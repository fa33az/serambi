// Membaca bab dari content/<buku>/<bahasa>/NN.txt saat build.
// Format berkas dijelaskan di scripts/extract.py.
import fs from 'node:fs';
import path from 'node:path';

export type Lang = 'id' | 'en';
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'v'; lines: string[] };

export interface Chapter {
  n: number;
  title: string;
  blocks: Block[];
}

const ROOT = path.resolve(process.cwd(), 'content');

export function chapterCount(slug: string): number {
  return fs.readdirSync(path.join(ROOT, slug, 'en')).filter((f) => f.endsWith('.txt')).length;
}

export function hasChapter(slug: string, lang: Lang, n: number): boolean {
  return fs.existsSync(file(slug, lang, n));
}

function file(slug: string, lang: Lang, n: number) {
  return path.join(ROOT, slug, lang, `${String(n).padStart(2, '0')}.txt`);
}

export function parseChapter(src: string, n: number): Chapter {
  const parts = src.replace(/\r/g, '').split(/\n[ \t]*\n/).map((s) => s.trim()).filter(Boolean);
  let title = '';
  const blocks: Block[] = [];
  for (const part of parts) {
    if (part.startsWith('# ')) title = part.slice(2).trim();
    else if (part.startsWith('## ')) blocks.push({ kind: 'h', text: part.slice(3).trim() });
    else if (part.startsWith('|')) blocks.push({ kind: 'v', lines: part.split('\n').map((l) => l.replace(/^\|\s?/, '')) });
    else blocks.push({ kind: 'p', text: part.replace(/\s*\n\s*/g, ' ') });
  }
  return { n, title, blocks };
}

export function loadChapter(slug: string, lang: Lang, n: number): Chapter | null {
  const f = file(slug, lang, n);
  if (!fs.existsSync(f)) return null;
  return parseChapter(fs.readFileSync(f, 'utf8'), n);
}

export function chapterTitles(slug: string, lang: Lang): string[] {
  const out: string[] = [];
  for (let n = 1; n <= chapterCount(slug); n++) {
    out.push((loadChapter(slug, lang, n) ?? loadChapter(slug, 'en', n))!.title);
  }
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s: string) {
  return esc(s)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(^|[\s(“"])_([^_]+)_/g, '$1<em>$2</em>')
    .replace(/'/g, '’');
}

/** HTML satu bab. Setiap blok diberi data-b (indeks) yang sama di semua bahasa. */
export function chapterHtml(ch: Chapter): string {
  let firstProse = true;
  return ch.blocks
    .map((b, i) => {
      if (b.kind === 'h') return `<h3 class="sec" data-b="${i}">${esc(b.text)}</h3>`;
      if (b.kind === 'v') return `<p class="verse" data-b="${i}">${b.lines.map(inline).join('<br>')}</p>`;
      let text = b.text;
      let num = '';
      const m = text.match(/^(\d+)\.\s+/);
      if (m) {
        text = text.slice(m[0].length);
        num = m[1];
      }
      if (firstProse) {
        firstProse = false;
        return `<p class="first" data-b="${i}">${inline(text)}</p>`;
      }
      return `<p data-b="${i}">${num ? `<span class="num">${num}</span>` : ''}${inline(text)}</p>`;
    })
    .join('');
}

export function wordCount(slug: string, lang: Lang): number {
  let w = 0;
  for (let n = 1; n <= chapterCount(slug); n++) {
    const ch = loadChapter(slug, lang, n);
    if (!ch) continue;
    for (const b of ch.blocks) w += (b.kind === 'v' ? b.lines.join(' ') : b.text).split(/\s+/).length;
  }
  return w;
}
