import {
  get, set, pos, setPos, marks, setMarks, quotes, setQuotes, reflections, setReflections,
  applyMood, ago, uid, type Lang, type Mark,
} from './store';
import { setAmbience, pageRustle, type Ambience } from './sound';

interface Config {
  slug: string;
  title: { id: string; en: string };
  author: string;
  count: number;
  titles: { id: string[]; en: string[] };
  available: { id: boolean[]; en: boolean[] };
  questions: { id: string; en: string }[];
}

const C: Config = JSON.parse(document.getElementById('book-config')!.textContent!);
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const reader = $('reader');
const stage = $('stage');
const flow = $('flow');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ keadaan
let lang: Lang = get<Lang>('lang', 'id');
let ch = 1;
let view = 0;
let views = 1;
let step = 0;
let spread = false;
let cur: { lang: Lang; ch: number } | null = null;
let busy = false;
const cache = new Map<string, Promise<{ title: string; html: string }>>();

function chapterLang(n: number): Lang {
  return C.available[lang][n - 1] ? lang : 'en';
}

function fetchChapter(l: Lang, n: number) {
  const key = `${l}:${n}`;
  if (!cache.has(key)) {
    const p = fetch(`/teks/${C.slug}/${l}/${n}.json`).then((r) => {
      if (!r.ok) throw new Error('bab tidak ditemukan');
      return r.json();
    });
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key)!;
}

// ------------------------------------------------------------------ menyusun halaman
async function render(n: number, l: Lang) {
  const data = await fetchChapter(l, n);
  const q = C.questions[n - 1];
  const last = n === C.count;
  const nextTitle = last ? '' : C.titles[chapterLang(n + 1)][n];
  const refl = reflections(C.slug)[n]?.text ?? '';
  const label = C.slug === 'meditations' ? '' : `<span class="label">${ROMAN[n] ?? n}</span>`;
  flow.lang = l;
  flow.innerHTML =
    `<header class="ch-head">${label}<h2>${data.title}</h2><div class="orn">❧</div></header>` +
    data.html +
    `<section class="pause" data-pause>
      <div class="orn">❧</div>
      ${q ? `<p class="q">${l === 'en' ? q.en : q.id}</p>
      <label class="sr" for="refl">Renunganmu</label>
      <textarea id="refl" placeholder="Tulis kalau mau. Tidak ada yang membacanya selain kamu.">${escapeHtml(refl)}</textarea>
      <p class="saved" id="refl-saved">tersimpan</p>` : ''}
      ${last
        ? `<p class="fin">Selesai. Terima kasih sudah membaca pelan-pelan.</p>
           <p class="fin-links"><a class="link" href="/catatan/">Buka catatanmu</a><a class="link" href="/">Kembali ke serambi</a></p>`
        : `<button class="go" data-go="${n + 1}">Lanjut ke ${nextTitle} →</button>`}
    </section>`;
  cur = { lang: l, ch: n };
  if (l !== lang && !sessionStorage.getItem('serambi:fallback-noted')) {
    sessionStorage.setItem('serambi:fallback-noted', '1');
    notice('Bab ini belum tersedia dalam bahasa Indonesia, jadi ditampilkan dalam bahasa Inggris.');
  }
  paintMarks();
  wirePause(n);
  if (last) set('done:' + C.slug, Date.now());
  // siapkan bab berikutnya diam-diam
  if (!last) fetchChapter(chapterLang(n + 1), n + 1).catch(() => {});
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wirePause(n: number) {
  const ta = flow.querySelector<HTMLTextAreaElement>('#refl');
  const saved = flow.querySelector('#refl-saved');
  let t: number | undefined;
  ta?.addEventListener('input', () => {
    const all = reflections(C.slug);
    if (ta.value.trim()) all[n] = { text: ta.value, t: Date.now() };
    else delete all[n];
    setReflections(C.slug, all);
    saved?.classList.add('on');
    clearTimeout(t);
    t = window.setTimeout(() => saved?.classList.remove('on'), 1400);
  });
  flow.querySelector<HTMLButtonElement>('[data-go]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    go(n + 1, 'start');
  });
}

function measure() {
  const fs = parseFloat(getComputedStyle(document.body).fontSize);
  const vw = innerWidth;
  const deskH = stage.parentElement!.clientHeight;
  spread = vw >= 1060 && deskH >= 460 && vw / deskH > 1.25;
  const gap = spread ? Math.round(fs * 3.6) : Math.round(fs * 2.4);
  const colW = Math.min(fs * (spread ? 26 : 33), spread ? (vw - 160 - gap) / 2 : vw - 40);
  const stageW = spread ? colW * 2 + gap : colW;
  reader.style.setProperty('--stage-w', `${stageW}px`);
  reader.classList.toggle('spread', spread);
  reader.classList.toggle('single', !spread);
  flow.style.width = `${stageW}px`;
  flow.style.columnWidth = `${colW}px`;
  flow.style.columnGap = `${gap}px`;
  flow.style.columnCount = spread ? '2' : '1';
  step = stageW + gap;
  flow.classList.add('instant');
  flow.style.transform = 'translateX(0)';
  const colsTotal = Math.max(1, Math.round((flow.scrollWidth + gap) / (colW + gap)));
  views = Math.max(1, Math.ceil(colsTotal / (spread ? 2 : 1)));
  // column-count membatasi jumlah kolom per lebar; kolom sisanya meluap ke kanan
}

function blockView(b: number): number {
  const el = flow.querySelector<HTMLElement>(`[data-b="${b}"]`);
  if (!el) return 0;
  const base = flow.getBoundingClientRect().left;
  const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
  return Math.min(views - 1, Math.max(0, Math.floor((r.left - base + 2) / step)));
}

function firstVisibleBlock(): HTMLElement | null {
  // Utamakan blok yang dimulai di halaman ini; paragraf sambungan dari halaman sebelumnya
  // hanya dipakai kalau tak ada blok yang dimulai di sini.
  const base = flow.getBoundingClientRect().left;
  const lo = view * step - 2;
  const hi = lo + step;
  let spill: HTMLElement | null = null;
  for (const el of flow.querySelectorAll<HTMLElement>('[data-b]')) {
    const rects = el.getClientRects();
    if (!rects.length) continue;
    const start = rects[0].left - base;
    if (start >= lo && start < hi) return el;
    if (!spill) for (const r of rects) {
      const x = r.left - base;
      if (x >= lo && x < hi) { spill = el; break; }
    }
    if (start >= hi) break;
  }
  return spill;
}

function show(animate: boolean) {
  flow.classList.toggle('instant', !animate || reduced);
  flow.style.transform = `translateX(${-view * step}px)`;
  const perView = spread ? 2 : 1;
  const onPause = view === views - 1;
  const a = view * perView + 1;
  $('pn-l').textContent = onPause && !spread ? '' : String(a);
  $('pn-r').textContent = spread && !onPause ? String(a + 1) : '';
  $('where').textContent = C.titles[cur?.lang ?? lang][ch - 1];
  const within = views > 1 ? view / (views - 1) : 0;
  const p = (ch - 1 + within) / C.count;
  $('edge-l').style.width = `${2 + p * 12}px`;
  $('edge-r').style.width = `${2 + (1 - p) * 12}px`;
  $('ribbon').style.height = `${58 + p * 60}px`;
  save();
}

function save() {
  const el = firstVisibleBlock();
  if (!el || !cur) return;
  const b = Number(el.dataset.b);
  // penanda bagian (mis. "IV") tidak berguna sebagai cuplikan; ambil paragraf sesudahnya
  let src: Element | null = el;
  while (src && (src.textContent ?? '').trim().length < 12) src = src.nextElementSibling;
  const text = ((src as HTMLElement | null)?.innerText ?? '').replace(/\s+/g, ' ').replace(/^\d+\s*/, '').trim();
  const snip = text.split(/\s+/).slice(0, 9).join(' ').replace(/[,;:.!?—]+$/, '');
  setPos(C.slug, { ch, b, lang: cur.lang, t: Date.now(), snip });
}

async function go(n: number, where: 'start' | 'end' | { b: number }, animate = true) {
  if (busy || n < 1 || n > C.count) return;
  busy = true;
  const l = chapterLang(n);
  const fade = animate && !reduced && !!cur;
  if (fade) {
    flow.classList.add('fading');
    await wait(360);
  }
  try {
    ch = n;
    await render(n, l);
    await document.fonts.ready;
    measure();
    view = where === 'start' ? 0 : where === 'end' ? views - 1 : blockView(where.b);
    show(false);
  } finally {
    requestAnimationFrame(() => flow.classList.remove('fading'));
    busy = false;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function turn(d: 1 | -1) {
  if (busy || anyOpen()) return;
  const nv = view + d;
  if (nv < 0) return void go(ch - 1, 'end');
  if (nv >= views) return void (ch < C.count && go(ch + 1, 'start'));
  view = nv;
  show(true);
  if (get('rustle', 'off') === 'on') pageRustle();
}

// ------------------------------------------------------------------ kontrol yang menyingkir
let idleT: number | undefined;
function wake() {
  document.body.classList.remove('still');
  clearTimeout(idleT);
  idleT = window.setTimeout(() => {
    if (!anyOpen()) document.body.classList.add('still');
  }, 2800);
}
addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') wake();
});

// ------------------------------------------------------------------ navigasi
$('prev').addEventListener('click', () => turn(-1));
$('next').addEventListener('click', () => turn(1));

stage.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('textarea, button, a, input, label')) return;
  const m = target.closest<HTMLElement>('mark.pencil');
  if (m) return openMark(m.dataset.id!);
  if (hasSelection()) return;
  const x = e.clientX / innerWidth;
  if (x < 0.34) turn(-1);
  else if (x > 0.66) turn(1);
  else if (document.body.classList.contains('still')) wake();
  else document.body.classList.add('still');
});

addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (e.key === 'Escape') return closeAll();
  if (t.closest('textarea, input') || anyOpen()) return;
  if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
    e.preventDefault();
    turn(1);
  } else if (['ArrowLeft', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
    e.preventDefault();
    turn(-1);
  }
});

let touch: { x: number; y: number; t: number } | null = null;
stage.addEventListener('touchstart', (e) => {
  const p = e.touches[0];
  touch = { x: p.clientX, y: p.clientY, t: Date.now() };
}, { passive: true });
stage.addEventListener('touchend', (e) => {
  if (!touch) return;
  const p = e.changedTouches[0];
  const dx = p.clientX - touch.x;
  const dy = p.clientY - touch.y;
  const quick = Date.now() - touch.t < 600;
  touch = null;
  if (quick && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && !hasSelection()) turn(dx < 0 ? 1 : -1);
});

let rt: number | undefined;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = window.setTimeout(relayout, 160);
});

function relayout() {
  if (!cur) return;
  const el = firstVisibleBlock();
  const b = el ? Number(el.dataset.b) : 0;
  measure();
  view = blockView(b);
  show(false);
}

// ------------------------------------------------------------------ lembar-lembar (daftar isi, pengaturan, garis pensil)
const scrim = $('scrim');
const sheets = ['sheet-toc', 'sheet-set', 'sheet-mark'].map((id) => $(id));
function anyOpen() {
  return sheets.some((s) => s.classList.contains('open')) || $('ritual').classList.contains('open');
}
function openSheet(id: string) {
  closeAll();
  $(id).classList.add('open');
  scrim.classList.add('on');
  document.body.classList.remove('still');
}
function closeAll() {
  sheets.forEach((s) => s.classList.remove('open'));
  scrim.classList.remove('on');
  closeRitual();
  hideSelMenu();
}
scrim.addEventListener('click', closeAll);

function buildToc() {
  const ol = $('toc');
  ol.innerHTML = '';
  C.titles[lang].forEach((t, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span class="n">${i + 1}</span><span>${C.available[lang][i] ? t : C.titles.en[i]}</span>`;
    if (i + 1 === ch) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => {
      closeAll();
      if (i + 1 !== ch) go(i + 1, 'start');
    });
    li.append(b);
    ol.append(li);
  });
}
$('btn-toc').addEventListener('click', () => {
  buildToc();
  openSheet('sheet-toc');
});

function syncSettings() {
  const vals: Record<string, string> = {
    lang,
    size: get('size', 'm'),
    mood: get('mood', 'auto'),
    sound: get('sound', 'off'),
    rustle: get('rustle', 'off'),
  };
  document.querySelectorAll<HTMLElement>('#sheet-set .opts').forEach((g) => {
    g.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === vals[g.dataset.set!])));
  });
}
$('btn-set').addEventListener('click', () => {
  syncSettings();
  openSheet('sheet-set');
});
document.querySelectorAll<HTMLElement>('#sheet-set .opts').forEach((g) => {
  g.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    const k = g.dataset.set!;
    const v = b.dataset.v!;
    set(k, v);
    if (k === 'mood') applyMood(v);
    if (k === 'size') {
      document.documentElement.dataset.size = v;
      relayout();
    }
    if (k === 'sound') {
      soundUnlocked = true;
      setAmbience(v as Ambience);
    }
    if (k === 'rustle' && v === 'on') pageRustle();
    if (k === 'lang') {
      const el = firstVisibleBlock();
      lang = v as Lang;
      await go(ch, { b: el ? Number(el.dataset.b) : 0 });
    }
    syncSettings();
  });
});

// suara hanya boleh mulai setelah pembaca menyentuh halaman
let soundUnlocked = false;
const unlock = () => {
  if (soundUnlocked) return;
  soundUnlocked = true;
  const s = get<Ambience>('sound', 'off');
  if (s !== 'off') setAmbience(s);
};
addEventListener('pointerdown', unlock, { once: true });
addEventListener('keydown', unlock, { once: true });

// ------------------------------------------------------------------ garis pensil
function hasSelection() {
  const s = getSelection();
  return !!s && !s.isCollapsed && s.toString().trim().length > 0;
}

function blockOf(node: Node | null): HTMLElement | null {
  const el = node instanceof HTMLElement ? node : node?.parentElement;
  return el?.closest<HTMLElement>('#flow [data-b]') ?? null;
}

function offsetIn(block: HTMLElement, node: Node, offset: number) {
  const r = document.createRange();
  r.setStart(block, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

function currentSelection(): { b: number; s: number; e: number; text: string } | null {
  const sel = getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const sb = blockOf(range.startContainer);
  if (!sb) return null;
  const eb = blockOf(range.endContainer);
  const s = offsetIn(sb, range.startContainer, range.startOffset);
  const e = eb === sb ? offsetIn(sb, range.endContainer, range.endOffset) : (sb.textContent ?? '').length;
  const full = sb.textContent ?? '';
  // rapikan spasi di tepi
  let a = s, z = e;
  while (a < z && /[\s,;:.—–-]/.test(full[a])) a++;
  while (z > a && /\s/.test(full[z - 1])) z--;
  if (z - a < 2) return null;
  return { b: Number(sb.dataset.b), s: a, e: z, text: full.slice(a, z) };
}

const selmenu = $('selmenu');
function hideSelMenu() {
  selmenu.classList.remove('on');
}
function placeSelMenu() {
  const info = currentSelection();
  if (!info || anyOpen()) return hideSelMenu();
  const r = getSelection()!.getRangeAt(0).getBoundingClientRect();
  const top = r.top - 48 < 8 ? r.bottom + 10 : r.top - 46;
  selmenu.style.left = `${Math.min(innerWidth - 120, Math.max(120, r.left + r.width / 2))}px`;
  selmenu.style.top = `${top}px`;
  selmenu.classList.add('on');
}
let selT: number | undefined;
document.addEventListener('selectionchange', () => {
  clearTimeout(selT);
  if (!hasSelection()) return hideSelMenu();
  selT = window.setTimeout(placeSelMenu, 260);
});

selmenu.addEventListener('pointerdown', (e) => e.preventDefault());
selmenu.addEventListener('click', (e) => {
  const act = (e.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.act;
  const info = currentSelection();
  if (!act || !info || !cur) return;
  hideSelMenu();
  getSelection()?.removeAllRanges();
  if (act === 'copy') return openRitual(info.text, info.b);
  const m: Mark = { id: uid(), lang: cur.lang, ch, b: info.b, s: info.s, e: info.e, text: info.text, t: Date.now() };
  const all = marks(C.slug).filter((x) => !(x.lang === m.lang && x.ch === m.ch && x.b === m.b && x.s < m.e && x.e > m.s));
  all.push(m);
  setMarks(C.slug, all);
  paintMarks();
  if (act === 'note') openMark(m.id, true);
});

function paintMarks() {
  if (!cur) return;
  flow.querySelectorAll('mark.pencil').forEach((m) => m.replaceWith(...m.childNodes));
  flow.normalize();
  for (const m of marks(C.slug)) {
    if (m.lang !== cur.lang || m.ch !== cur.ch) continue;
    const block = flow.querySelector<HTMLElement>(`[data-b="${m.b}"]`);
    if (block) wrap(block, m);
  }
}

function wrap(block: HTMLElement, m: Mark) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let pos = 0;
  const parts: [Text, number, number][] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = node as Text;
    const len = t.data.length;
    const a = Math.max(m.s, pos);
    const z = Math.min(m.e, pos + len);
    if (a < z) parts.push([t, a - pos, z - pos]);
    pos += len;
  }
  for (const [t, a, z] of parts) {
    let target = t;
    if (a > 0) target = target.splitText(a);
    if (z - a < target.data.length) target.splitText(z - a);
    const mk = document.createElement('mark');
    mk.className = 'pencil' + (m.note ? ' noted' : '');
    mk.dataset.id = m.id;
    target.replaceWith(mk);
    mk.append(target);
  }
}

let openMarkId: string | null = null;
function openMark(id: string, focusNote = false) {
  const m = marks(C.slug).find((x) => x.id === id);
  if (!m) return;
  openMarkId = id;
  $('mark-text').textContent = m.text;
  const ta = $<HTMLTextAreaElement>('mark-note');
  ta.value = m.note ?? '';
  openSheet('sheet-mark');
  if (focusNote) setTimeout(() => ta.focus(), 400);
}
$('mark-note').addEventListener('input', () => {
  const all = marks(C.slug);
  const m = all.find((x) => x.id === openMarkId);
  if (!m) return;
  m.note = $<HTMLTextAreaElement>('mark-note').value.trim() || undefined;
  setMarks(C.slug, all);
  flow.querySelectorAll(`mark[data-id="${m.id}"]`).forEach((el) => el.classList.toggle('noted', !!m.note));
});
$('mark-del').addEventListener('click', () => {
  setMarks(C.slug, marks(C.slug).filter((x) => x.id !== openMarkId));
  closeAll();
  paintMarks();
});
$('mark-copy').addEventListener('click', () => {
  const m = marks(C.slug).find((x) => x.id === openMarkId);
  if (!m) return;
  closeAll();
  openRitual(m.text, m.b);
});

// ------------------------------------------------------------------ ritual menyalin
const ritual = $('ritual');
const ritText = $('rit-text');
const ritInput = $<HTMLInputElement>('rit-input');
let ritChars: HTMLSpanElement[] = [];
let ritAt = 0;
let ritQuote: { text: string; b: number } | null = null;
let ritDone = false;

const norm = (c: string) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const isWord = (c: string) => /[\p{L}\p{N}]/u.test(c);

function openRitual(text: string, b: number) {
  ritQuote = { text, b };
  ritDone = false;
  ritText.innerHTML = '';
  ritChars = [...text].map((c) => {
    const s = document.createElement('span');
    s.className = 'c';
    s.textContent = c;
    ritText.append(s);
    return s;
  });
  ritAt = 0;
  advance();
  $('rit-src').textContent = `${C.author}, ${C.title[cur?.lang ?? 'id']} · ${C.titles[cur?.lang ?? lang][ch - 1]}`;
  $('rit-done').classList.remove('on');
  closeAll();
  ritual.classList.add('open');
  ritInput.value = '';
  setTimeout(() => ritInput.focus(), 300);
}

function closeRitual() {
  ritual.classList.remove('open');
  ritInput.blur();
}

function advance() {
  ritChars[ritAt - 1]?.classList.remove('cur');
  while (ritAt < ritChars.length && !isWord(ritChars[ritAt].textContent!)) {
    ritChars[ritAt].classList.add('in');
    ritAt++;
  }
  ritChars.forEach((c) => c.classList.remove('cur'));
  if (ritAt < ritChars.length) ritChars[ritAt].classList.add('cur');
  else finishRitual(true);
}

function finishRitual(copied: boolean) {
  if (ritDone || !ritQuote || !cur) return;
  ritDone = true;
  const q = quotes();
  q.unshift({ id: uid(), text: ritQuote.text, slug: C.slug, lang: cur.lang, ch, b: ritQuote.b, t: Date.now(), copied });
  setQuotes(q);
  $('rit-done').classList.add('on');
  setTimeout(closeRitual, copied ? 1900 : 1200);
}

ritInput.addEventListener('input', () => {
  const typed = ritInput.value;
  ritInput.value = '';
  for (const c of typed) {
    if (!isWord(c) || ritAt >= ritChars.length) continue;
    const want = ritChars[ritAt];
    if (norm(c) === norm(want.textContent!)) {
      want.classList.remove('miss');
      want.classList.add('in');
      ritAt++;
      advance();
    } else {
      want.classList.add('miss');
      setTimeout(() => want.classList.remove('miss'), 500);
    }
  }
});
ritText.addEventListener('click', () => ritInput.focus());
$('rit-skip').addEventListener('click', () => {
  ritChars.forEach((c) => c.classList.add('in'));
  finishRitual(false);
});
$('rit-close').addEventListener('click', closeRitual);

// ------------------------------------------------------------------ pesan kecil
let noticeT: number | undefined;
function notice(html: string, ms = 3600) {
  const h = $('hello');
  h.innerHTML = html;
  h.classList.add('on');
  clearTimeout(noticeT);
  noticeT = window.setTimeout(() => h.classList.remove('on'), ms);
}
$('hello').addEventListener('click', () => $('hello').classList.remove('on'));

// ------------------------------------------------------------------ mulai
async function start() {
  const hash = location.hash.match(/^#bab-(\d+)$/);
  const saved = pos(C.slug);
  if (hash) {
    const n = Math.min(C.count, Math.max(1, Number(hash[1])));
    history.replaceState(null, '', location.pathname);
    await go(n, 'start', false);
  } else if (saved) {
    await go(saved.ch, { b: saved.b }, false);
    if (Date.now() - saved.t > 30 * 60 * 1000) {
      notice(`${ago(saved.t)}, kamu berhenti di sini.` + (saved.snip ? `<span class="snip">“${saved.snip}…”</span>` : ''), 3800);
    }
  } else {
    await go(1, 'start', false);
  }
  wake();
}

start().catch(() => {
  flow.innerHTML = '<p class="first">Halaman ini gagal dimuat. Coba muat ulang, atau periksa sambunganmu.</p>';
});

addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save();
});
