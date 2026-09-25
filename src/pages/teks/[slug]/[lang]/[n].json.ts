import type { APIRoute } from 'astro';
import { books } from '../../../../data/books';
import { chapterCount, chapterHtml, hasChapter, loadChapter, type Lang } from '../../../../lib/content';

export function getStaticPaths() {
  const paths = [];
  for (const b of books) {
    const count = chapterCount(b.slug);
    for (const lang of ['id', 'en'] as Lang[]) {
      for (let n = 1; n <= count; n++) {
        if (hasChapter(b.slug, lang, n)) paths.push({ params: { slug: b.slug, lang, n: String(n) } });
      }
    }
  }
  return paths;
}

export const GET: APIRoute = ({ params }) => {
  const ch = loadChapter(params.slug!, params.lang as Lang, Number(params.n))!;
  return new Response(JSON.stringify({ title: ch.title, html: chapterHtml(ch), blocks: ch.blocks.length }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
