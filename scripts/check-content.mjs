// Memastikan setiap bab bahasa Indonesia sejajar dengan bab Inggrisnya:
// jumlah blok sama, jenis blok sama, dan penanda bagian (## ...) sama persis.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('content');
let errors = 0;
let missing = 0;

function parse(file) {
  const parts = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split(/\n[ \t]*\n/).map((s) => s.trim()).filter(Boolean);
  const title = parts.find((p) => p.startsWith('# '));
  const blocks = parts.filter((p) => !p.startsWith('# ')).map((p) =>
    p.startsWith('## ') ? { k: 'h', t: p.slice(3).trim() } : p.startsWith('|') ? { k: 'v', t: p.split('\n').length } : { k: 'p', t: (p.match(/^(\d+)\.\s/) || [])[1] ?? '' },
  );
  return { title, blocks };
}

for (const slug of fs.readdirSync(root)) {
  const enDir = path.join(root, slug, 'en');
  for (const f of fs.readdirSync(enDir).filter((f) => f.endsWith('.txt')).sort()) {
    const idFile = path.join(root, slug, 'id', f);
    if (!fs.existsSync(idFile)) {
      missing++;
      continue;
    }
    const en = parse(path.join(enDir, f));
    const id = parse(idFile);
    const where = `${slug}/id/${f}`;
    if (!id.title) {
      console.error(`✗ ${where}: tidak ada judul (# ...)`);
      errors++;
    }
    if (en.blocks.length !== id.blocks.length) {
      console.error(`✗ ${where}: ${id.blocks.length} blok, seharusnya ${en.blocks.length}`);
      errors++;
    }
    const n = Math.min(en.blocks.length, id.blocks.length);
    for (let i = 0; i < n; i++) {
      const a = en.blocks[i];
      const b = id.blocks[i];
      if (a.k !== b.k || (a.k !== 'v' && a.t !== b.t)) {
        console.error(`✗ ${where}: blok ke-${i + 1} berbeda (en: ${a.k} ${a.t}, id: ${b.k} ${b.t})`);
        errors++;
        break;
      }
    }
  }
}

if (missing) console.log(`· ${missing} bab belum diterjemahkan (akan tampil dalam bahasa Inggris).`);
if (errors) {
  console.error(`${errors} masalah ditemukan.`);
  process.exit(1);
}
console.log('✓ konten sejajar');
