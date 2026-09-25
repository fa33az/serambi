// Semua yang diingat Serambi tinggal di perangkat pembaca (localStorage).
const P = 'serambi:';

export function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(P + key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

export function set(key: string, value: unknown) {
  try {
    localStorage.setItem(P + key, JSON.stringify(value));
  } catch {
    /* penyimpanan penuh atau diblokir: biarkan saja */
  }
}

export type Lang = 'id' | 'en';

export interface Pos {
  ch: number;
  b: number;
  lang: Lang;
  t: number;
  snip: string;
}

export interface Mark {
  id: string;
  lang: Lang;
  ch: number;
  b: number;
  s: number;
  e: number;
  text: string;
  note?: string;
  t: number;
}

export interface Quote {
  id: string;
  text: string;
  slug: string;
  lang: Lang;
  ch: number;
  b: number;
  t: number;
  copied: boolean;
}

export interface Reflection {
  text: string;
  t: number;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const pos = (slug: string) => get<Pos | null>('pos:' + slug, null);
export const setPos = (slug: string, p: Pos) => {
  set('pos:' + slug, p);
  set('last', slug);
};
export const marks = (slug: string) => get<Mark[]>('marks:' + slug, []);
export const setMarks = (slug: string, m: Mark[]) => set('marks:' + slug, m);
export const quotes = () => get<Quote[]>('quotes', []);
export const setQuotes = (q: Quote[]) => set('quotes', q);
export const reflections = (slug: string) => get<Record<string, Reflection>>('refl:' + slug, {});
export const setReflections = (slug: string, r: Record<string, Reflection>) => set('refl:' + slug, r);

export function autoMood(): 'pagi' | 'senja' | 'lilin' {
  const h = new Date().getHours();
  return h >= 5 && h < 15 ? 'pagi' : h >= 15 && h < 19 ? 'senja' : 'lilin';
}

export function applyMood(choice: string) {
  const m = choice === 'auto' ? autoMood() : choice;
  document.documentElement.dataset.mood = m;
  const tc = { pagi: '#f4ede0', senja: '#eadcc2', lilin: '#1b1713' }[m as 'pagi'];
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', tc);
}

const ANGKA = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'];

/** "Kemarin", "Tiga hari lalu", "Dua minggu lalu" */
export function ago(t: number): string {
  const s = (Date.now() - t) / 1000;
  const cap = (x: string) => x[0].toUpperCase() + x.slice(1);
  if (s < 60 * 20) return 'Barusan';
  const today = new Date();
  const then = new Date(t);
  const days = Math.round(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
      new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) /
      864e5,
  );
  if (days === 0) {
    const h = then.getHours();
    return h < 11 ? 'Tadi pagi' : h < 15 ? 'Tadi siang' : h < 19 ? 'Tadi sore' : 'Tadi malam';
  }
  if (days === 1) return 'Kemarin';
  if (days < 7) return cap(ANGKA[days]) + ' hari lalu';
  if (days < 14) return 'Seminggu lalu';
  if (days < 30) return cap(ANGKA[Math.round(days / 7)] ?? String(Math.round(days / 7))) + ' minggu lalu';
  if (days < 60) return 'Sebulan lalu';
  if (days < 365) return Math.round(days / 30) + ' bulan lalu';
  return 'Lama sekali';
}

export function dateId(t: number) {
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
