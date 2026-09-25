# Serambi

Tempat buat baca filsafat pelan-pelan.

Awalnya cuma pengen punya satu tempat yang enak buat baca buku-buku filsafat klasik, tanpa iklan, tanpa akun, tanpa notifikasi, tanpa "kamu sudah baca 37%". Cuma rak buku kecil, halaman yang bisa dibalik, dan sedikit ruang buat nulis.

![Serambi](preview/serambi.png)

## Isinya

Lima buku, semuanya domain publik, dan semuanya bisa dibaca dalam bahasa Indonesia maupun Inggris:

- *Meditasi*, Marcus Aurelius
- *Apologia*, Plato
- *Enchiridion*, Epiktetos
- *Tentang Singkatnya Hidup*, Seneca
- *Tao Te Ching*, Laozi

Teks Inggrisnya diambil dari [Project Gutenberg](https://www.gutenberg.org/) (terjemahan George Long, Benjamin Jowett, T. W. Higginson, Aubrey Stewart, dan James Legge). Versi Indonesianya disusun paragraf demi paragraf dari teks itu, jadi kalau lagi baca terus pindah bahasa, posisinya tetap di tempat yang sama.

## Sedikit tentang rasanya

Halaman depannya cuma satu kalimat sapaan yang beda-beda tergantung jam, rak buku, dan satu kutipan. Kalau sebelumnya udah pernah baca, dia bakal ingat kamu berhenti di mana.

![Halaman sampul](preview/sampul.png)

Bukunya dibaca kayak buku beneran. Di layar lebar muncul dua halaman, di HP satu halaman. Balik halamannya bisa diklik di sisi kanan/kiri, digeser, atau pakai tombol panah. Tombol-tombolnya ngilang sendiri kalau lagi fokus baca.

![Halaman baca](preview/baca.png)

Ada tiga suasana: Pagi, Senja, sama Lilin buat baca malam-malam. Bisa juga dibiarkan ngikutin jam. Kalau mau, nyalain suara hujan atau perapian. Suaranya dibikin langsung pakai Web Audio, jadi nggak ada file audio yang perlu diunduh.

![Mode lilin](preview/lilin.png)

Kalimat yang kena bisa dikasih garis pensil atau catatan di pinggir. Bisa juga disalin ke Buku Kutipan, tapi harus diketik ulang huruf demi huruf. Memang sengaja dibikin lambat.

![Menyalin kutipan](preview/salin.png)

Di akhir setiap bab ada satu pertanyaan kecil dan tempat buat nulis jawabannya kalau mau. Semua catatan, kutipan, dan posisi baca cuma disimpan di browser masing-masing (localStorage), nggak dikirim ke mana-mana.

![Di HP](preview/hp.png)

## Jalanin sendiri

Butuh Node.js 22 ke atas.

```bash
npm install
npm run dev
```

Buka `http://localhost:4321`.

Buat versi statisnya:

```bash
npm run build
```

Hasilnya ada di `dist/` dan bisa langsung ditaruh di Netlify, Vercel, Cloudflare Pages, GitHub Pages, atau hosting statis apa aja. Setelah pernah dibuka, bab-bab yang sudah dibaca tetap bisa diakses offline, dan situsnya bisa dipasang di layar utama HP.

## Susunan folder

```
content/<buku>/en/   teks Inggris per bab (hasil scripts/extract.py)
content/<buku>/id/   terjemahan Indonesia, sejajar dengan en/
sources/             teks mentah dari Project Gutenberg
scripts/             ekstraksi teks + pengecek kesejajaran
src/data/            info buku, pertanyaan renungan, kutipan harian
src/scripts/         logika halaman baca dan suara
```

Format bab-nya sederhana: paragraf dipisah baris kosong, `## I` buat penanda bagian, dan baris yang diawali `|` buat puisi.

## Mau benerin terjemahan?

Boleh banget. Terjemahan dari terjemahan pasti ada yang meleset. Edit aja file di `content/<buku>/id/`, asal jumlah paragrafnya tetap sama dengan versi `en/`-nya. Cek pakai:

```bash
npm run check-content
```

Perintah ini juga otomatis jalan setiap `npm run build`.

## Lisensi

Kodenya MIT. Teks sumber dari Project Gutenberg berstatus domain publik.
