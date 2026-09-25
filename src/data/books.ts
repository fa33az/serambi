export interface BookMeta {
  slug: string;
  title: { id: string; en: string };
  spineTitle?: string;
  subtitle: string;
  author: string;
  era: string;
  written: string;
  spine: { color: string; height: number; width: number; band?: string };
  source: { translator: string; year: string; url: string; note?: string };
  intro: string[];
  howToRead: string;
  questions: { id: string; en: string }[];
}

export const books: BookMeta[] = [
  {
    slug: 'meditations',
    title: { id: 'Meditasi', en: 'Meditations' },
    subtitle: 'Catatan untuk diri sendiri',
    author: 'Marcus Aurelius',
    era: '121–180 M',
    written: 'Ditulis sekitar 170–180 M, di perkemahan militer di tepi Sungai Danube.',
    spine: { color: '#6b2f25', height: 236, width: 50, band: '#4f211a' },
    source: {
      translator: 'George Long',
      year: '1862',
      url: 'https://www.gutenberg.org/ebooks/15877',
      note: 'Catatan kaki penerjemah Inggris tidak disertakan.',
    },
    intro: [
      'Buku ini tidak pernah dimaksudkan untuk dibaca orang lain. Marcus Aurelius menulisnya untuk dirinya sendiri, pada malam-malam di tenda, di sela perang yang panjang, sebagai kaisar Romawi yang paling berkuasa di zamannya dan sekaligus seorang laki-laki yang lelah.',
      'Karena itu nadanya aneh sekaligus akrab: ia menegur dirinya sendiri, mengingatkan hal yang sama berkali-kali, kadang dengan sabar, kadang dengan kesal. Tidak ada argumen yang rapi, hanya seseorang yang berusaha tetap waras dan baik di tengah dunia yang tidak ia pilih.',
      'Buku Pertama berisi daftar terima kasih kepada orang-orang yang membentuknya. Setelah itu, catatan-catatannya berdiri sendiri, dan boleh dibaca satu per satu, tidak harus berurutan.',
    ],
    howToRead: 'Baca sedikit saja setiap kali. Satu atau dua catatan, lalu berhenti dan biarkan mengendap.',
    questions: [
      { id: 'Siapa orang yang diam-diam membentuk dirimu, dan apa yang kamu pelajari darinya?', en: 'Who quietly shaped you, and what did you learn from them?' },
      { id: 'Apa yang hari ini kamu khawatirkan, yang sebenarnya tidak ada dalam kendalimu?', en: 'What are you worried about today that is not actually in your control?' },
      { id: 'Jika waktumu tinggal sedikit, bagian mana dari harimu yang akan kamu lepaskan?', en: 'If your time were short, which part of your day would you let go of?' },
      { id: 'Kapan terakhir kali kamu benar-benar sendiri dengan pikiranmu sendiri?', en: 'When were you last truly alone with your own thoughts?' },
      { id: 'Apa yang membuatmu enggan bangun pagi, dan untuk apa sebenarnya kamu bangun?', en: 'What makes you reluctant to get up in the morning, and what do you really get up for?' },
      { id: 'Kata-kata siapa yang masih kamu bawa, padahal sudah lama ingin kamu letakkan?', en: 'Whose words are you still carrying, though you have long wanted to put them down?' },
      { id: 'Apa yang akan tetap sama dalam dirimu, meski semua di sekelilingmu berubah?', en: 'What in you would stay the same, even if everything around you changed?' },
      { id: 'Dalam hal apa kamu sedang berpura-pura, kepada orang lain atau kepada dirimu sendiri?', en: 'Where are you pretending right now, to others or to yourself?' },
      { id: 'Siapa yang sulit kamu maafkan, dan apa yang kamu genggam dengan tidak memaafkan?', en: 'Who is hard for you to forgive, and what are you holding on to by not forgiving?' },
      { id: 'Kalau kamu melihat hidupmu dari tempat yang sangat tinggi, apa yang tampak kecil?', en: 'If you looked at your life from very high above, what would look small?' },
      { id: 'Apa yang kamu lakukan hanya karena orang lain melihat?', en: 'What do you do only because others are watching?' },
      { id: 'Kalau ini halaman terakhir, apakah kamu sudah cukup?', en: 'If this were the last page, would you be enough?' },
    ],
  },
  {
    slug: 'apologia',
    title: { id: 'Apologia', en: 'Apology' },
    subtitle: 'Pembelaan Sokrates di hadapan Athena',
    author: 'Plato',
    era: 'sekitar 428–348 SM',
    written: 'Mengisahkan persidangan Sokrates pada tahun 399 SM.',
    spine: { color: '#3d4a3b', height: 204, width: 34, band: '#2c362b' },
    source: { translator: 'Benjamin Jowett', year: '1871', url: 'https://www.gutenberg.org/ebooks/1656' },
    intro: [
      'Pada tahun 399 SM, seorang laki-laki tua berusia tujuh puluh tahun berdiri di depan lima ratus warga Athena. Ia dituduh merusak anak muda dan tidak percaya pada dewa-dewa kota. Hukumannya bisa mati.',
      'Sokrates tidak menangis, tidak membawa anak-anaknya untuk meminta belas kasihan, dan tidak memakai kata-kata indah. Ia hanya menjelaskan, dengan tenang dan kadang dengan jenaka, mengapa ia menghabiskan hidupnya bertanya kepada orang-orang, dan mengapa ia tidak akan berhenti.',
      'Plato, muridnya, hadir di ruang sidang itu. Apologia adalah ingatannya tentang hari tersebut: pembelaan, vonis, dan kata-kata terakhir seorang guru.',
    ],
    howToRead: 'Bacalah seperti mendengarkan seseorang berbicara di ruangan yang penuh. Suaranya tenang; biarkan kalimatnya panjang.',
    questions: [
      { id: 'Kapan terakhir kali kamu berani berkata, “aku tidak tahu”?', en: 'When did you last dare to say, “I don’t know”?' },
      { id: 'Kalau semua orang jujur, apa yang menurutmu sebenarnya pantas kamu terima?', en: 'If everyone were honest, what do you think you truly deserve?' },
      { id: 'Apa yang kamu takutkan dari kematian, dan apakah kamu benar-benar tahu?', en: 'What do you fear about death, and do you actually know?' },
    ],
  },
  {
    slug: 'enchiridion',
    title: { id: 'Enchiridion', en: 'Enchiridion' },
    subtitle: 'Buku pegangan kecil',
    author: 'Epiktetos',
    era: 'sekitar 50–135 M',
    written: 'Dihimpun oleh muridnya, Arrianus, sekitar 125 M.',
    spine: { color: '#2e3a4c', height: 184, width: 26, band: '#212a37' },
    source: { translator: 'Thomas Wentworth Higginson', year: '1865', url: 'https://www.gutenberg.org/ebooks/45109' },
    intro: [
      'Epiktetos lahir sebagai budak. Kakinya pincang, konon karena dipatahkan tuannya. Ketika akhirnya bebas, ia menjadi guru filsafat, lalu diusir dari Roma, dan mengajar di kota kecil di pesisir Yunani sampai tua.',
      '“Enchiridion” berarti sesuatu yang dipegang di tangan: sebuah pisau kecil, atau buku saku. Muridnya merangkum ajarannya menjadi lima puluh satu catatan pendek yang bisa dibawa ke mana-mana, untuk dipakai, bukan untuk dikagumi.',
      'Kalimat pertamanya adalah pusat seluruh buku: ada hal-hal yang ada dalam kuasa kita, dan ada yang tidak.',
    ],
    howToRead: 'Satu bagian sehari sudah cukup. Coba pakai hari itu juga.',
    questions: [
      { id: 'Tulis satu hal yang mengganggumu hari ini. Ada dalam kuasamu, atau tidak?', en: 'Write down one thing that troubled you today. Is it within your power, or not?' },
      { id: 'Peran apa yang sedang kamu jalani sekarang, dan sudahkah kamu memainkannya dengan baik?', en: 'What role are you playing right now, and are you playing it well?' },
      { id: 'Pendapat siapa yang paling kamu takuti? Mengapa?', en: 'Whose opinion do you fear most? Why?' },
      { id: 'Kapan terakhir kali kamu diam, padahal ingin sekali membela diri?', en: 'When did you last stay silent, though you badly wanted to defend yourself?' },
      { id: 'Apa yang sudah lama kamu tahu benar, tapi belum juga kamu jalankan?', en: 'What have you long known to be right, but not yet practiced?' },
    ],
  },
  {
    slug: 'singkatnya-hidup',
    title: { id: 'Tentang Singkatnya Hidup', en: 'On the Shortness of Life' },
    spineTitle: 'Singkatnya Hidup',
    subtitle: 'Surat kepada Paulinus',
    author: 'Seneca',
    era: 'sekitar 4 SM–65 M',
    written: 'Ditulis sekitar 49 M.',
    spine: { color: '#5b4a2b', height: 216, width: 30, band: '#43361f' },
    source: {
      translator: 'Aubrey Stewart',
      year: '1900',
      url: 'https://www.gutenberg.org/ebooks/64576',
      note: 'Bagian-bagiannya dikelompokkan menjadi empat bab oleh Serambi.',
    },
    intro: [
      'Seneca adalah orang yang sibuk: penasihat kaisar, penulis drama, salah satu orang terkaya di Roma. Justru karena itu, suratnya tentang waktu terasa begitu jujur. Ia tahu persis bagaimana hidup bisa habis untuk urusan orang lain.',
      'Surat ini ditujukan kepada Paulinus, seorang pejabat yang mengurus persediaan gandum kota Roma. Isinya sederhana dan tajam: hidup tidak pendek. Kitalah yang membuatnya pendek, karena menghambur-hamburkannya.',
      'Hampir dua ribu tahun kemudian, daftar kesibukan yang ia sebut masih terasa seperti daftar kesibukan kita.',
    ],
    howToRead: 'Baca pelan-pelan, dan sesekali berhenti untuk menghitung, dengan jujur, ke mana waktumu pergi minggu ini.',
    questions: [
      { id: 'Kalau hidup sebenarnya cukup panjang, ke mana saja waktumu pergi hari ini?', en: 'If life is really long enough, where did your time go today?' },
      { id: 'Siapa yang paling banyak mengambil waktumu, dan apakah kamu memberikannya dengan sadar?', en: 'Who takes the most of your time, and do you give it knowingly?' },
      { id: 'Pemikir atau buku mana yang ingin kamu jadikan sahabat lama?', en: 'Which thinker or book would you like to keep as an old friend?' },
      { id: 'Apa yang sedang kamu tunda sampai “nanti”, seolah-olah nanti itu pasti datang?', en: 'What are you putting off until “later,” as if later were certain to come?' },
    ],
  },
  {
    slug: 'tao-te-ching',
    title: { id: 'Tao Te Ching', en: 'Tao Te Ching' },
    subtitle: 'Kitab tentang Jalan dan kebajikannya',
    author: 'Laozi',
    era: 'abad ke-6–4 SM',
    written: 'Asal-usulnya kabur; mungkin dihimpun dari banyak suara selama beberapa generasi.',
    spine: { color: '#2a2724', height: 222, width: 38, band: '#1c1a18' },
    source: {
      translator: 'James Legge',
      year: '1891',
      url: 'https://www.gutenberg.org/ebooks/216',
      note: 'Kata-kata dalam kurung adalah sisipan Legge untuk memperjelas makna.',
    },
    intro: [
      'Konon, Laozi adalah penjaga arsip di istana Zhou. Ketika ia sudah tua dan memutuskan pergi ke barat, penjaga gerbang perbatasan memintanya menuliskan apa yang ia ketahui sebelum menghilang. Hasilnya delapan puluh satu bab pendek, lalu ia pergi dan tidak pernah terlihat lagi.',
      'Apakah cerita itu benar, tak ada yang tahu. Yang tersisa adalah salah satu buku yang paling sering diterjemahkan di dunia: kalimat-kalimat pendek tentang air, lembah, bayi, bejana kosong, dan kekuatan dari hal-hal yang lunak.',
      'Tao Te Ching tidak berusaha meyakinkanmu. Ia lebih mirip teka-teki yang lembut: makin keras dipaksa dimengerti, makin menjauh.',
    ],
    howToRead: 'Satu bab saja, lalu tutup matamu sebentar. Bab-babnya pendek karena memang dimaksudkan untuk dikunyah lama.',
    questions: [
      { id: 'Kapan terakhir kali sesuatu berhasil justru karena kamu tidak memaksanya?', en: 'When did something last work out precisely because you did not force it?' },
      { id: 'Apa yang bisa kamu lepaskan hari ini, supaya tanganmu cukup kosong untuk menerima?', en: 'What could you let go of today, so your hands are empty enough to receive?' },
    ],
  },
];

export const bookBySlug = (slug: string) => books.find((b) => b.slug === slug)!;
