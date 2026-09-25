// Suara dibuat langsung dengan Web Audio: tidak ada berkas audio yang perlu diunduh.
export type Ambience = 'off' | 'hujan' | 'api';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: { kind: Ambience; stop: () => void } | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number, color: 'white' | 'brown' | 'pink') {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'white') d[i] = w;
    else if (color === 'brown') {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else {
      b0 = 0.997 * b0 + w * 0.029591;
      b1 = 0.985 * b1 + w * 0.032534;
      b2 = 0.95 * b2 + w * 0.048056;
      d[i] = (b0 + b1 + b2 + w * 0.05) * 0.9;
    }
  }
  return buf;
}

function loop(ac: AudioContext, buf: AudioBuffer) {
  const s = ac.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  return s;
}

function rain(ac: AudioContext, out: GainNode) {
  const nodes: AudioScheduledSourceNode[] = [];
  // desis hujan di kejauhan
  const hiss = loop(ac, noiseBuffer(ac, 3, 'pink'));
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 0.5;
  const hg = ac.createGain();
  hg.gain.value = 0.18;
  hiss.connect(bp).connect(hg).connect(out);
  // gemuruh rendah
  const rum = loop(ac, noiseBuffer(ac, 4, 'brown'));
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  const rg = ac.createGain();
  rg.gain.value = 0.22;
  rum.connect(lp).connect(rg).connect(out);
  hiss.start();
  rum.start();
  nodes.push(hiss, rum);
  // tetes di atap
  const drop = noiseBuffer(ac, 0.05, 'white');
  let alive = true;
  const tick = () => {
    if (!alive) return;
    const s = ac.createBufferSource();
    s.buffer = drop;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2200 + Math.random() * 3000;
    f.Q.value = 3;
    const g = ac.createGain();
    const t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.06, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    s.connect(f).connect(g).connect(out);
    s.start(t);
    setTimeout(tick, 40 + Math.random() * 260);
  };
  tick();
  return () => {
    alive = false;
    nodes.forEach((n) => n.stop());
  };
}

function fire(ac: AudioContext, out: GainNode) {
  const base = loop(ac, noiseBuffer(ac, 4, 'brown'));
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const bg = ac.createGain();
  bg.gain.value = 0.35;
  // nyala api naik-turun pelan
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoG = ac.createGain();
  lfoG.gain.value = 0.12;
  lfo.connect(lfoG).connect(bg.gain);
  base.connect(lp).connect(bg).connect(out);
  base.start();
  lfo.start();
  const crackBuf = noiseBuffer(ac, 0.02, 'white');
  let alive = true;
  const crack = (burst = false) => {
    if (!alive) return;
    const n = burst ? 2 + Math.floor(Math.random() * 4) : 1;
    for (let i = 0; i < n; i++) {
      const s = ac.createBufferSource();
      s.buffer = crackBuf;
      const f = ac.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 1500 + Math.random() * 2500;
      const g = ac.createGain();
      const t = ac.currentTime + i * (0.02 + Math.random() * 0.05);
      const peak = 0.04 + Math.random() * 0.14;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + Math.random() * 0.02);
      s.connect(f).connect(g).connect(out);
      s.start(t);
    }
    setTimeout(() => crack(Math.random() < 0.25), 90 + Math.random() * 900);
  };
  crack();
  return () => {
    alive = false;
    base.stop();
    lfo.stop();
  };
}

export function setAmbience(kind: Ambience) {
  if (current?.kind === kind) return;
  if (current) {
    const old = current;
    current = null;
    old.stop();
  }
  if (kind === 'off') return;
  const ac = audio();
  const out = ac.createGain();
  out.gain.value = 0.0001;
  out.connect(master!);
  out.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 2.5);
  const stopInner = kind === 'hujan' ? rain(ac, out) : fire(ac, out);
  current = {
    kind,
    stop: () => {
      const t = ac.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      setTimeout(() => {
        stopInner();
        out.disconnect();
      }, 1300);
    },
  };
}

let rustleBuf: AudioBuffer | null = null;
export function pageRustle() {
  const ac = audio();
  rustleBuf ??= noiseBuffer(ac, 0.35, 'pink');
  const s = ac.createBufferSource();
  s.buffer = rustleBuf;
  s.playbackRate.value = 0.9 + Math.random() * 0.25;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.8;
  const t = ac.currentTime;
  f.frequency.setValueAtTime(3800, t);
  f.frequency.exponentialRampToValueAtTime(1400, t + 0.28);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  s.connect(f).connect(g).connect(master!);
  s.start(t);
  s.stop(t + 0.36);
}
