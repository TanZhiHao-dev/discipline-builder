// Kajian Tambahan — ICDT theory enrichment from David Dharmawan's YouTube.
//
// ADDITIVE ONLY: this module never touches the core Kitab (lib/kitab.ts —
// PYRAMID / PILLARS / SOP_REMINDERS stay exactly as distilled from the course).
// These are own-words study notes from the mentor's public videos that make the
// same theory richer: ICT concepts, execution, process, and psychology. Each
// kajian can point at the SOP step(s) it enriches.

export type KajianGroup = "konsep" | "eksekusi" | "proses" | "psikologi";

export const KAJIAN_GROUPS: { key: KajianGroup; label: string; emoji: string; blurb: string }[] = [
  {
    key: "konsep",
    label: "Konsep ICT",
    emoji: "🧠",
    blurb: "Liquidity, FVG, Order Block, Premium/Discount, Stop Hunt — bahan baku steps 1–5.",
  },
  {
    key: "eksekusi",
    label: "Eksekusi & Entry",
    emoji: "🎯",
    blurb: "Cara masuk presisi, jebakan breakout, time + price — memperkaya steps 6–7.",
  },
  {
    key: "proses",
    label: "Proses & Trading Plan",
    emoji: "🗺️",
    blurb: "Trading plan, backtest yang benar, fokus pair, tipe trader.",
  },
  {
    key: "psikologi",
    label: "Psikologi",
    emoji: "🧘",
    blurb: "Drawdown, sunk cost, cuek, mindset jangka panjang — the mortar.",
  },
];

export type Kajian = {
  id: string;
  group: KajianGroup;
  title: string;
  videoTitle: string;
  videoId: string;
  /** SOP steps (1–7) this theory enriches; [] = general/mortar. */
  enrichesSteps: number[];
  thesis: string;
  points: string[];
  tips?: string[];
};

export const KAJIAN_INTRO =
  "Materi pengaya dari video publik mentor David Dharmawan — dirangkum ulang supaya teori ICDT makin kaya. SOP 7-step & pilar Kitab TIDAK berubah; kajian ini memperdalam cara membacanya.";

// Distilled from the mentor's public videos (channel @daviddharmawan).
export const KAJIAN: Kajian[] = [
  // ── Konsep ICT ──
  {
    id: "dua-agenda-market",
    group: "konsep",
    title: "Dua agenda pergerakan market",
    videoTitle: "Learn ICT Concepts From Scratch (#ICTSimplified eps. 1)",
    videoId: "nuY4Ow2X6tk",
    enrichesSteps: [3, 5],
    thesis:
      "Market pada dasarnya hanya bergerak untuk dua alasan yang bergantian terus-menerus: mengambil liquidity (low/high), lalu mengisi imbalance (FVG). Semua analisa dimulai dari pertanyaan: market baru saja menyelesaikan agenda yang mana?",
    points: [
      "Market bergerak hanya karena dua agenda — mengambil liquidity dan mengisi imbalance. Setelah ambil liquidity ia mengisi imbalance, lalu ambil liquidity lagi; siklus ini berulang di semua timeframe.",
      "Liquidity = bentuk low/high yang jadi sasaran harga; imbalance = gap/FVG yang belum terisi.",
      "Low lama berubah jadi liquidity karena retail menganggapnya support lalu buy di atasnya — SL mereka menumpuk di bawah low itu, sehingga low tersebut jadi target pergerakan turun berikutnya.",
      "Saat bias bearish (low weekly di-break, delivery berubah ke sellside), fokus hanya cari posisi sell; low-low di bawah jadi rangkaian target liquidity.",
      "Setelah harga break low dan ambil liquidity-nya, langkah paling mungkin berikutnya adalah retrace mengisi imbalance/FVG yang tertinggal — baru lanjut memburu liquidity berikutnya.",
      "Cara pakai: tanyakan 'harga baru habis ngapain?' Baru ambil liquidity → ekspektasikan retrace ke imbalance; baru isi imbalance → ekspektasikan dorongan ke liquidity berikutnya.",
      "Market tidak perlu dibuat rumit — dasar dua agenda ini adalah fondasi sebelum belajar konsep ICT lain.",
    ],
    tips: [
      "Sebelum entry, tandai: liquidity mana yang terakhir diambil dan imbalance mana yang belum terisi — posisimu harus searah agenda yang sedang berjalan.",
      "Verifikasi sendiri di chart weekly/HTF: telusuri mundur dan label tiap gerakan sebagai 'ambil liquidity' atau 'isi imbalance' sampai pola siklusnya terlihat.",
    ],
  },
  {
    id: "buyside-sellside-liquidity",
    group: "konsep",
    title: "Buyside & sellside liquidity",
    videoTitle: "What is Buyside & Sellside Liquidity? (eps. 2)",
    videoId: "x3v7a4hLzcM",
    enrichesSteps: [3],
    thesis:
      "Liquidity adalah magnet yang menarik harga karena di level itu menumpuk uang: stop loss dan pending order retail. Buyside di atas high (SL seller + buy stop), sellside di bawah low (SL buyer + sell stop).",
    points: [
      "Liquidity itu 'simply all about money' — level di mana market maker bisa memanen SL dan stop order dalam jumlah besar sekali gerakan.",
      "Buyside liquidity = old high, relative equal high, atau double top. Di atasnya: SL orang yang sell + buy stop breakout trader.",
      "Sellside liquidity = kebalikannya: di bawah old low / equal low menumpuk SL buyer dan sell stop breakout seller.",
      "Satu sweep buyside melikuidasi dua kubu sekaligus: seller yang masuk terlalu cepat (SL kena) dan breakout buyer yang ter-trigger di harga mahal lalu ikut dihajar turun.",
      "Trader yang hanya lihat 'break of structure' satu timeframe tanpa konteks top-down sering menganggap sweep sebagai BOS asli, lalu entry searah break dan jadi korban.",
      "Kalau bias bearish, ekspektasikan high terakhir (buyside) di-sweep dulu sebelum harga benar-benar turun — jangan anggap itu pergantian arah.",
      "Market hanya bergerak dari liquidity ke imbalance, atau liquidity ke liquidity — kunci membedakan break asli vs stop hunt.",
    ],
    tips: [
      "Sebelum menilai sebuah break, tanya: uang siapa yang baru diambil di level itu? Kalau jawabannya SL retail, kemungkinan besar itu sweep, bukan pergantian tren.",
      "Tandai old high/low dan equal high/low sebagai peta magnet harga — itu daftar target market maker.",
    ],
  },
  {
    id: "fvg-fair-value-gap",
    group: "konsep",
    title: "FVG: formasi tiga candle & cara pakainya",
    videoTitle: "What is FVG? (eps. 3)",
    videoId: "1cesp6ko8TM",
    enrichesSteps: [5, 6],
    thesis:
      "FVG adalah gap dari formasi tiga candle akibat candle tengah terlalu impulsif sehingga ada order belum terisi; harga cenderung kembali mengisinya. FVG hanya dipakai searah daily bias — bukan setiap FVG adalah acuan.",
    points: [
      "Identifikasi: FVG = formasi 3 candle dengan celah antara wick candle-1 dan wick candle-3 (tanpa wick pakai body). Bullish FVG: gap antara high candle-1 dan low candle-3; bearish tinggal dibalik.",
      "Warna candle TIDAK penting — selama gap-nya ada, FVG tetap valid.",
      "Logikanya: candle tengah terlalu impulsif sehingga order sisi lawan belum terpenuhi — harga kembali ke gap untuk mengisi order itu, lalu melanjutkan arah.",
      "Kesalahan pemula: memakai setiap FVG. Yang dipakai hanya FVG yang selaras daily bias / institutional order flow — saat uptrend cari FVG untuk buy, jangan paksakan FVG sell.",
      "FVG melawan order flow biasanya cuma disentuh sebentar lalu harga lanjut searah flow.",
      "FVG sebagai arah: habis ambil high dan di bawah ada FVG → skenario paling mungkin turun mengisi FVG dulu sebelum lanjut.",
      "Contoh entry (M1, sesi New York): high di-sweep → market structure break dengan displacement yang meninggalkan FVG → entry di FVG, SL ketat, target ~1:3.",
      "Yang sulit bukan menemukan FVG — yang sulit adalah daily bias yang benar; FVG hanya alat eksekusi.",
    ],
    tips: [
      "Checklist entry FVG: (1) liquidity sudah diambil, (2) ada MSB dengan displacement, (3) displacement meninggalkan FVG, (4) searah bias — baru entry.",
      "Jangan tandai FVG lawan arah sebagai POI; kalaupun disentuh, biasanya cuma mitigasi sebelum harga lanjut searah flow.",
    ],
  },
  {
    id: "order-block-change-of-state",
    group: "konsep",
    title: "Order Block: perubahan state delivery",
    videoTitle: "Apa itu Order Block? (eps. 4)",
    videoId: "z0mk8c682Xk",
    enrichesSteps: [5, 6],
    thesis:
      "Order block = gerakan turun terakhir sebelum naik (OB bullish) atau naik terakhir sebelum turun (OB bearish). OB hanya high-probability kalau lahir setelah harga menyentuh POI higher-timeframe — tanpa itu, pola serupa hanyalah stop hunt.",
    points: [
      "Definisi: OB bullish = the last down move before the up move; OB bearish = the last up move before the down move — intinya change of state of delivery.",
      "Konfirmasi validitas OB bullish: harga dari OB mampu break high sebelumnya — baru retest-nya layak dipakai.",
      "Syarat terpenting: OB hanya valid kalau terjadi SETELAH harga menyentuh POI higher timeframe (FVG HTF, atau habis ambil low/high HTF). Tanpa alasan HTF, 'break' itu kemungkinan stop hunt.",
      "Mekanisme umum: harga mitigasi FVG, naik sebentar, lalu sweep low sekali lagi menghukum buyer yang masuk terlalu awal — baru terbentuk OB valid dan harga naik sungguhan.",
      "Trading pola OB tanpa peduli daily bias = 'pattern trader' — retail yang trading contekan pola tanpa mengerti market.",
      "OB dipakai dua cara: penentu arah (harga tertahan di OB → lanjut searah bias) dan acuan entry saat retest.",
      "Untuk bearish semua aturan di-invert: POI HTF disentuh → sweep high → break structure turun → OB = up move terakhir sebelum down move.",
    ],
    tips: [
      "Sebelum pakai OB, geser chart ke kiri dan ke HTF: harga habis menyentuh apa? Tidak ada POI HTF yang dimitigasi → lewati OB itu.",
      "Jangan pakai OB yang belum terbukti — tunggu ia break swing high/low lawannya dulu, baru retest-nya dieksekusi.",
    ],
  },
  {
    id: "premium-discount-equilibrium",
    group: "konsep",
    title: "Premium, discount & equilibrium",
    videoTitle: "Premium, Discount & Equilibrium (eps. 5)",
    videoId: "ooMfPz0sIKM",
    enrichesSteps: [5],
    thesis:
      "Dari sebuah range, area di atas 50% = premium (mahal), di bawah 50% = discount (murah), 50% = equilibrium. Aturannya seperti hukum ekonomi: hanya buy di discount, hanya sell di premium — kebalikan persis dari ajaran retail.",
    points: [
      "Dasarnya hukum supply-demand: permintaan banyak + persediaan sedikit = mahal (premium); sebaliknya = didiskon. Market maker bertransaksi dengan logika dagang yang sama.",
      "Identifikasi: tarik range dari swing low ke swing high (fib 0–1). Di atas 0.5 = premium, di bawah 0.5 = discount, 0.5 = equilibrium.",
      "Aturan inti: hanya buy di discount (atau minimal equilibrium), hanya sell di premium. Jangan pernah buy di premium atau sell di discount.",
      "Buy on breakout ala retail = beli di premium; sell on breakdown = jual di harga murah — keduanya melawan logika ekonomi, itulah kenapa retail jadi lawan posisi market maker.",
      "Dalam uptrend, market maker menunggu harga ke PD array di zona discount (FVG, OB) sebelum menaikkan harga; distribusi hanya dari zona premium.",
      "Swing layak dianalisa dengan range ini kalau retracement sudah menyentuh 0.5 ke bawah.",
      "Banyak 'break of structure' palsu sebenarnya harga memitigasi POI di zona discount/premium sebelum melanjutkan tren — pattern trader terjebak sell di discount / buy di premium tepat sebelum berbalik.",
    ],
    tips: [
      "Setiap menandai POI, cek posisinya: POI buy hanya menarik di zona discount, POI sell hanya di premium.",
      "Harga break turun tapi baru masuk zona discount dari range bullish → curigai mitigasi/manipulasi, bukan pergantian tren.",
    ],
  },
  {
    id: "stop-hunt-fake-break",
    group: "konsep",
    title: "Stop hunt: fake break penjebak pattern trader",
    videoTitle: "Apa itu Stop Hunt? (eps. 6)",
    videoId: "nVoLlKAzq-4",
    enrichesSteps: [3],
    thesis:
      "Stop hunt adalah fake break yang seolah change of character padahal hanya sweep sebelum tren utama lanjut. Market maker melakukannya karena hafal pola retail yang menganggap setiap break sebagai pergantian tren.",
    points: [
      "Stop hunt = fake break menyerupai pergantian tren, padahal cuma pengambilan liquidity sebelum tren lanjut.",
      "Stop hunt itu necessary bagi market maker: mereka ingin sesedikit mungkin orang ikut profit, jadi penumpang dibuang lewat sweep sebelum gerakan sesungguhnya.",
      "Akar masalah retail: jadi 'pattern trader' — break turun = sell, break naik = buy, tanpa konteks timeframe besar. Pola tanpa konteks tidak ada artinya.",
      "Cara membedakan: pegang bias utama. Bias bullish → break ke bawah jangan langsung diartikan pergantian tren, kecuali konteks HTF sampai LTF semua mendukung.",
      "Ciri stop hunt: harga break low, sweep liquidity, mitigasi FVG/POI, lalu langsung naik meninggalkan level break — bukan lanjut turun.",
      "Tidak ada alasan konkret (POI HTF, target liquidity) kenapa harga break? Most of the time itu stop hunt.",
      "Aturan emas: ingin lihat harga naik → tunggu ada low di-sweep dulu; ingin lihat harga turun → tunggu high di-sweep dulu.",
    ],
    tips: [
      "Sebelum melabeli 'change of character', tanya: break ini setelah menyentuh POI HTF apa, liquidity apa yang diambil? Tidak ada jawaban = anggap stop hunt.",
      "Jadikan sweep prasyarat setup, bukan ancaman: entry terbaik justru muncul SETELAH stop hunt membuang retail.",
    ],
  },
  {
    id: "liquidity-yang-penting",
    group: "konsep",
    title: "Tidak semua liquidity itu penting",
    videoTitle: "Still Confused About Liquidity? (dijelaskan sampai paham)",
    videoId: "-PdGmX93OEY",
    enrichesSteps: [3, 6],
    thesis:
      "Hampir setiap swing high/low adalah liquidity, jadi menandai semuanya membuat tersesat. Yang penting hanya dua: liquidity yang di-sweep sebagai bahan bakar sebelum gerakan asli, dan liquidity yang jadi magnet/tujuan pergerakan.",
    points: [
      "Definisi lugas: liquidity = tempat stop loss kebanyakan retail berada — sesimpel itu, bukan holy grail rahasia.",
      "Konsekuensi: semua swing high/low di timeframe mana pun adalah liquidity. 'Tunggu liquidity diambil dulu' tanpa tahu yang MANA adalah nasihat kosong.",
      "Liquidity hanya punya dua peran: (1) tempat ambil uang/SL sebelum pergerakan sesungguhnya, (2) magnet/tujuan ke mana harga bergerak.",
      "Mekanismenya: SL buyer kena → mereka dipaksa sell menutup posisi → uang berpindah ke market. Itulah kenapa penting menunggu stop hunt sebelum entry.",
      "Setelah sweep + impulsivitas ke arah target, JANGAN menunggu stop hunt kedua/ketiga — ekspektasikan justru pergerakan trending cepat menuju liquidity target.",
      "Analogi Jakarta–Bandung: harga yang sudah isi bensin (sweep low) dan hampir sampai Bandung (target di atas) tidak masuk akal putar balik di tengah tol. Break higher low di tengah jalan biasanya stop hunt lagi.",
      "Pembalikan arah baru masuk akal SETELAH tujuan tercapai — harga sudah ambil liquidity target, baru break bisa dianggap serius.",
      "Market maker butuh uang besar untuk membalik arah — mereka mengambilnya di liquidity tujuan, bukan di tengah perjalanan.",
    ],
    tips: [
      "Di chart cukup tandai dua level: liquidity yang baru/akan di-sweep (bahan bakar) dan liquidity tujuan (magnet). Abaikan sisanya.",
      "Sweep + impulsivitas sudah terjadi → entry pada retrace tanpa menunggu stop hunt tambahan; belum ada sweep → bersabar.",
      "Jangan sell hanya karena higher low patah saat harga masih menuju liquidity target di atas — jebakan klasik.",
    ],
  },
  {
    id: "sl-breakeven-merusak-edge",
    group: "konsep",
    title: "Kenapa SL ke breakeven merusak edge",
    videoTitle: "Stop Loss to Breakeven? (eps. 7)",
    videoId: "7ZAsIeEDZTE",
    enrichesSteps: [7],
    thesis:
      "Memindah SL ke breakeven = tanda tidak menerima risiko yang sudah disiapkan. Kebiasaan ini memotong winner yang seharusnya sampai TP dan merusak profitabilitas metode. Pengecualian hanya kondisi spesifik seperti news besar saat trade hampir TP.",
    points: [
      "Argumen inti: kalau sudah OK meresikokan 1% saat entry, harusnya OK juga kalau SL kena. Buru-buru geser ke BE berarti tak pernah benar-benar menerima risiko itu.",
      "Pola berulang: harga jalan sedikit → SL ke BE → harga retrace, hit BE → lalu lanjut ke TP tanpa kamu.",
      "Lebih baik kena SL penuh daripada kena BE lalu harga lari ke TP — yang kedua jauh lebih menyakitkan dan memicu revenge.",
      "Analogi dealer mobil bekas: beli di harga diskon, punya target profit, lalu menjualnya di harga modal — logika breakeven trader, secara ekonomi tidak masuk akal.",
      "Matematis: target 1:3, geser SL ke BE saat profit 1:2 = meresikokan +2R yang sudah berjalan demi sisa +1R.",
      "BE tidak benar-benar nol: masih ada komisi dan spread — hasil akhirnya minus kecil.",
      "Kebiasaan BE merusak expectancy metode: winrate & RR di-backtest dengan SL dan TP penuh, bukan exit BE di tengah jalan.",
      "Pengecualian: trade sudah berjalan jauh dan hampir TP, lalu sebentar lagi ada news besar — baru masuk akal amankan ke BE.",
    ],
    tips: [
      "Set & forget: setelah entry, biarkan selesai di SL atau TP sesuai rencana.",
      "Merasa harus buru-buru BE = sinyal risk terlalu besar untuk mentalmu — kecilkan risk per trade, bukan geser SL.",
      "Izinkan BE hanya lewat aturan tertulis spesifik (hampir TP + menjelang high-impact news), bukan karena takut.",
    ],
  },

  // ── Eksekusi & Entry ──
  {
    id: "cave-entries-3-secrets",
    group: "eksekusi",
    title: "3 rahasia entry presisi: HTF idea, order flow, tunggu stop hunt",
    videoTitle: "3 Secrets: Cave Entries Super Precise",
    videoId: "NvAK8DdQlyk",
    enrichesSteps: [6],
    thesis:
      "Entry sering kena SL bukan karena arah salah, tapi karena tidak presisi. 3 filter sebelum eksekusi: didukung ide higher timeframe, searah order flow market maker, dan baru dilakukan SETELAH stop hunt terjadi.",
    points: [
      "Filter 1 — HTF lebih penting dari LTF. Entry tanpa dukungan weekly/daily = melawan ombak market maker. Untuk trading harian, weekly + daily cukup sebagai HTF.",
      "Filter 2 — Follow the order flow. Retail itu ikan teri: ikut arah ikan besar. Order flow bullish → JANGAN iseng cari sell.",
      "Filter 3 — Tunggu stop hunt dulu, baru entry. Stop hunt adalah 'tanda tangan' market maker; entry sebelum stop hunt = kamu jadi bagian dari liquidity itu.",
      "Urutan: weekly tentukan narasi (candle merah besar bisa manipulasi/retracement cari diskon, bukan reversal) → daily cari POI menarik (FVG deep discount) → H1 tunggu stop hunt di POI itu.",
      "Jebakan umum: langsung buy saat harga pertama sentuh FVG, SL di bawah swing low baru — dan swing low itulah yang dimakan sebelum harga naik. Sabar satu langkah membedakan TP dan SL.",
      "Setelah stop hunt, turun ke timeframe entry (M5), tunggu break swing high terakhir sebagai konfirmasi; buy stop di atas break, SL di bawah low stop hunt.",
      "Jangan pusingkan jarak SL dalam pips — yang dihitung hanya rasio RR (1:2, 1:3).",
      "Setelah posisi terpasang lengkap SL + TP: set and forget.",
    ],
    tips: [
      "Sebelum klik entry, cek 3 kotak: didukung HTF idea? searah order flow? stop hunt sudah terjadi? Ada satu yang belum → tunggu.",
      "Backtest ketiga filter ini dan integrasikan ke trading plan.",
    ],
  },
  {
    id: "entry-strategy-konfirmasi",
    group: "eksekusi",
    title: "Setup entry konfirmasi: stop hunt → break → retrace → eksekusi",
    videoTitle: "My Entry Strategy (Consistently Profitable)",
    videoId: "MlTywrTApIc",
    enrichesSteps: [6],
    thesis:
      "Satu setup yang sama diulang terus: tunggu stop hunt pada level target, tunggu break structure di timeframe kecil, tunggu retracement, entry saat lower high/higher low terakhir di-break. Trader konfirmasi, bukan risk-entry.",
    points: [
      "Prasyarat mutlak: stop hunt harus terjadi dulu pada level yang sudah diprediksi dari analisa top-down.",
      "Setelah stop hunt, pindah ke M5 dan tunggu harga break swing high terdekat — bukti pergantian arah, bukan tebakan.",
      "Jangan entry di break itu — tunggu retracement dulu. Amannya trading konfirmasi: masuk di harga pullback, bukan mengejar.",
      "Trigger entry: harga break lower high terakhir dari retracement → market execution, SL di bawah low stop hunt.",
      "SL boleh besar dalam pips — tidak masalah selama searah order flow; yang dipedulikan hanya rasio 1:3.",
      "Setelah entry: set and forget. Geser SL ke BE terlalu cepat = keluar 0,1% pada trade yang seharusnya jalan penuh.",
      "Entry adalah bagian PALING TIDAK PENTING dari sistem — copy setup tanpa nalar top-down berarti hanya memegang satu keping puzzle.",
      "Ketajaman datang dari repetisi: satu setup diulang terus (repetition is the mother of all skills), bukan koleksi banyak setup.",
    ],
    tips: [
      "Tulis urutan setup sebagai checklist mekanis: stop hunt → break swing high (M5) → retrace → break lower high terakhir → entry + SL + TP → jangan disentuh.",
      "Ukur trade hanya dengan RR, bukan pips.",
    ],
  },
  {
    id: "breakout-trap",
    group: "eksekusi",
    title: "Buy on breakout = umpan liquidity; beli di retest",
    videoTitle: "Buy on Breakout = Makanan Market Maker",
    videoId: "Jkksmcp0960",
    enrichesSteps: [3, 6],
    thesis:
      "Buy on breakout / sell on breakdown adalah 'ilmu retail' yang membuat SL retail berkumpul di tempat mudah dipanen. Entry terbaik adalah buy on retest di level discount setelah stop hunt, bukan mengejar harga di premium.",
    points: [
      "Logika jebakan: buy on breakout = beli di premium. Market lalu turun cari diskon (perilaku normalnya), SL-mu di bawah breakout jadi liquidity — setelah SL retail di-hit, market lanjut arah sebenarnya.",
      "Konsep support/resistance klasik membuat entry & SL ribuan retail menumpuk di titik yang sama — 'retail entry zone' santapan market maker.",
      "Kasus investor: berani beli justru saat breakout naik ('terkonfirmasi uptrend'), lalu nyangkut dalam — beli saat harga naik = mengejar harga mahal.",
      "Yang benar: tunggu retest ke bawah, tunggu stop hunt di low itu, pastikan order flow mendukung, lalu buy di area discount — upside lebih besar, margin of safety lebih besar.",
      "Pengecualian — breakout BOLEH dibeli jika: (1) harga sudah retest ke discount, (2) sudah ada stop hunt + pergantian order flow terkonfirmasi, (3) jelas ada liquidity besar di atas sebagai magnet.",
      "Fokus pada liquidity tujuan yang besar — magnet itulah yang menjustifikasi harga bergerak cepat setelah breakout tervalidasi.",
    ],
    tips: [
      "Tergoda entry saat candle break level? Tanya: 'aku sedang berharap market impulsif tanpa retest?' Kalau ya, itu harapan, bukan setup.",
      "Balik kebiasaan: breakout bukan sinyal masuk, tapi sinyal MENUNGGU retest untuk entry berikutnya.",
    ],
  },
  {
    id: "time-plus-price",
    group: "eksekusi",
    title: "Time + price: session menentukan kapan setup boleh dieksekusi",
    videoTitle: "The Best Time To Trade: Time + Price",
    videoId: "S1vptHiuKho",
    enrichesSteps: [4, 6],
    thesis:
      "Analisa harga saja tidak cukup — waktu bahkan bisa lebih penting. Setup yang benar secara top-down tetap bisa membuatmu jadi liquidity kalau dieksekusi di session yang salah.",
    points: [
      "Tiga session utama (UTC-5 New York): Asia 18.00–00.00, London 00.00–06.00, New York 06.00–12.00.",
      "Kenali SIAPA player pair-mu: GBPUSD digerakkan BoE dan Fed → hanya layak di session London & New York; tidak ada yang menggerakkannya di sesi Asia.",
      "Bahaya entry di session mati: bias weekly/daily benar pun, buy di sesi Asia = harga diam diakumulasi, lalu low Asia di-stop-hunt saat London buka — benar arah tapi tetap jadi liquidity.",
      "Pola berulang: London open menyapu low/high range sesi Asia sambil men-tap PD array di bawahnya, baru bergerak cepat ke arah sebenarnya.",
      "Confluence terbaik = time + price: POI yang benar DAN jam yang benar. Stop hunt terhadap Asia range saat London open adalah kombinasi keduanya.",
      "Filter waktu mengubah random entry jadi time-based entry — pembeda profesional dari pemula.",
    ],
    tips: [
      "Tandai range sesi Asia tiap hari; high/low-nya kandidat liquidity pertama yang disapu London open.",
      "Sebelum entry: 'session ini jam kerja player pair ini atau bukan?' Bukan → tunda setup sebagus apa pun.",
      "Set timezone chart ke UTC-5 (New York) supaya batas session konsisten.",
    ],
  },
  {
    id: "indikator-lagging",
    group: "eksekusi",
    title: "Indikator itu lagging: harga tercetak dulu",
    videoTitle: "Why I Hate Trading Indicators",
    videoId: "6P0Qh_3p8EY",
    enrichesSteps: [1],
    thesis:
      "Harga selalu tercetak lebih dulu; indikator hanya menghitung ulang harga yang sudah terjadi. Yang layak dipelajari adalah nature pergerakan harga itu sendiri — indikator hanya sah sebagai confluence, bukan pengambil keputusan.",
    points: [
      "Uji logika: mana yang tercetak duluan — indikator atau harga? Harga. Maka indikator per definisi lagging; price is leading.",
      "Gejala khas: MA 'kelihatan mau golden cross' lalu gagal cross setelah candle close — tapi kamu sudah terlanjur buy.",
      "Studi kasus stochastic di gold: harga bertahan di overbought 3 bulan+ sambil terus naik. Yang patuh 'overbought = sell' akan MC berkali-kali; pembaca order flow fokus buy sepanjang tren.",
      "Studi kasus MACD: golden cross muncul tepat saat harga bereaksi turun dari FVG/breaker — pemuja indikator buy di puncak reaksi.",
      "Bahaya terbesar psikologis: indikator melatih malas berpikir — hanya ingin 'dikasih tahu kapan buy/sell' tanpa paham kenapa harga bergerak.",
      "Penggunaan yang diterima: analisa utama tetap price action + PD array HTF + konfirmasi struktur; indikator hanya penguat SETELAH analisa selesai.",
      "Logika anti-scam: kalau penjual 'indikator 99% win' benar punya alat itu, mereka akan all-in sendiri — bukan menjualnya murah.",
    ],
    tips: [
      "Alokasikan waktu belajar ke nature pergerakan harga (liquidity, manipulasi) — bukan ke setting indikator.",
      "Kalau tetap pakai indikator, tulis aturannya: tidak pernah boleh jadi ALASAN entry, hanya penguat analisa yang sudah jadi.",
    ],
  },

  // ── Proses & Trading Plan ──
  {
    id: "empat-elemen-trading-plan",
    group: "proses",
    title: "4 elemen wajib trading plan yang solid",
    videoTitle: "4 Elemen Sakti dalam Trading Plan",
    videoId: "ZHD7MUKp578",
    enrichesSteps: [4, 6],
    thesis:
      "Kebanyakan trader gagal bukan karena market, tapi karena masuk tanpa rencana. Trading plan kuat cukup dari 4 elemen: satu setup yang dikuasai, rules entry/SL/TP fix, time session + pair utama, dan jurnal harian.",
    points: [
      "Masuk market tanpa plan = bunuh diri finansial; tanpa rencana, tiap gerakan market jadi trigger emosi.",
      "Elemen 1 — SATU setup saja yang dipahami luar-dalam. Plan A/B/C untuk tiap kondisi tidak realistis: saat tiga plan muncul bersamaan, kamu cuma bingung.",
      "Elemen 2 — rules entry, SL, TP yang solid dan FIX — jangan berubah ikut mood (hari ini pede nahan TP, besok habis loss asal close).",
      "Elemen 3 — time session dan pair utama: cukup 1-2 pair supaya bisa mengikuti flow-nya detail, dan sesi yang jelas — mustahil trading 24 jam.",
      "Elemen 4 — journaling dan feedback harian: kesalahan yang tidak dicatat tidak akan pernah diperbaiki.",
      "Market bergerak sama untuk semua; yang membedakan trader reaktif dari yang tenang hanyalah ada-tidaknya plan yang solid.",
      "Fungsi plan bukan membuat 100% profit, tapi membuat kamu SURVIVE sampai profit datang.",
    ],
    tips: [
      "Audit plan-mu: kalau ada elemen yang kosong (setup tunggal, rules fix, sesi+pair, jurnal), lengkapi dulu sebelum entry berikutnya.",
      "Baca jurnal kemarin sebelum sesi hari ini — itulah mekanisme belajar dari kesalahan yang sebenarnya.",
    ],
  },
  {
    id: "trading-plan-simpel",
    group: "proses",
    title: "Trading plan simpel: pisau tajam, bukan lukisan",
    videoTitle: "How to Create a Hassle-Free Trading Plan",
    videoId: "aEwNTqKJMNo",
    enrichesSteps: [6],
    thesis:
      "Plan yang profitable bukan yang ribet penuh indikator, tapi yang simpel, jelas, repeatable, dan berlogika — kebanyakan trader gagal justru karena meribetkan plan-nya sendiri.",
    points: [
      "Simpel bukan asal feeling; simpel = jelas, repeatable, berlogika. Banyak trader top justru pakai plan sederhana.",
      "Strategi yang butuh 10 'voting system' konfirmasi bukan trading plan — tidak bisa dieksekusi konsisten.",
      "Tiga akar overcomplicating: takut salah (terus menambah konfirmasi demi rasa aman), belajar comot sana-sini, dan tidak percaya diri pada strategi sendiri.",
      "Kekuatan plan simpel: tidak ada guessing game — trigger muncul (stop hunt/sweep), ada konfirmasi atau tidak, entry, selesai.",
      "Cara menyederhanakan: buang indikator, mulai dari price action, fokus 1-2 model entry, latih repetitif tanpa variasi baru.",
      "Strategi seperti pisau: makin diasah makin tajam. Pisau pemotong daging selalu polos — tapi melakukan tugasnya sangat baik.",
      "Market tidak butuh kamu jenius; market hanya butuh kamu konsisten.",
    ],
    tips: [
      "Bersihkan chart: hapus indikator dan garis yang tidak dipakai plan utama.",
      "Tulis plan dalam satu kalimat trigger→konfirmasi→entry→RR; kalau tidak muat satu kalimat, masih terlalu ribet.",
      "Setelah disederhanakan, backtest plan tunggal itu sampai repetitif — bukan menambah variasi.",
    ],
  },
  {
    id: "agresif-vs-konservatif",
    group: "proses",
    title: "Agresif vs konservatif: trading sesuai DNA",
    videoTitle: "Aggressive vs Conservative Traders",
    videoId: "TQpPPGKh7Og",
    enrichesSteps: [],
    thesis:
      "Karakter bawaanmu sudah menentukan gaya trading yang cocok; memaksakan diri jadi tipe berlawanan adalah resep hasil tidak sehat — kenali dirimu lalu setia pada profil risikomu.",
    points: [
      "Agresif = risiko lebih tinggi demi reward lebih tinggi; konservatif = lebih aman dengan growth lebih pelan. Keduanya valid.",
      "Profil agresif: nyaman timeframe kecil (M1), entry sering, SL/TP kecil & cepat, siap kena stop hunt berkali-kali, terima drawdown lebih besar demi growth.",
      "Profil konservatif: sabar menunggu konfirmasi terbaik, filter noise, frekuensi rendah, nyaman di M15/H1/H4.",
      "Bahaya #1: orang agresif dipaksa konservatif → tersiksa menunggu, lalu suatu hari trading emosional menghancurkan seluruh progres.",
      "Bahaya #2: orang konservatif dipaksa scalping M1 → melawan DNA sendiri, hasil tak pernah optimal.",
      "Di area harga sama: trader M1 bisa kena SL berkali-kali sebelum sharp entry ber-RR tinggi; trader M15 sekali SL lalu entry lebih lambat — dua distribusi risiko berbeda, bukan dua kualitas berbeda.",
      "Jangan saling iri: agresif jangan iri konservatif yang jarang SL; konservatif jangan iri TP cepat si agresif — itu bayaran risiko masing-masing.",
    ],
    tips: [
      "Tes jujur: menunggu setup H4 bikin gatal entry → kamu agresif; M1 bikin cemas → kamu konservatif.",
      "Apapun tipenya, risiko tetap wajib dijaga — agresif bukan izin sembrono.",
      "Bandingkan progres hanya dengan versi kemarin dirimu, bukan trader bertipe lain.",
    ],
  },
  {
    id: "empat-tipe-trading",
    group: "proses",
    title: "Empat tipe trading: pilih yang cocok dengan hidupmu",
    videoTitle: "Tipe Trading Seperti Apa yang Cocok?",
    videoId: "MeglRVFZArc",
    enrichesSteps: [],
    thesis:
      "Trading itu personal — meniru gaya orang lain dengan kondisi hidup berbeda hampir pasti gagal. Cocokkan tipe trading dengan kepribadian DAN keadaan hidupmu.",
    points: [
      "Positional (mingguan-tahunan): untuk yang sabar, strategis, fokus jangka panjang. Pro: minim stres, komisi kecil. Kontra: modal terkunci lama, harus tahan volatilitas tanpa panik.",
      "Swing (harian-mingguan): untuk yang adaptable, suka analisa pattern & trend, 'kesabaran aktif'. Pro: hemat waktu, hidup balance. Kontra: frekuensi naik membuka pintu emotional trading.",
      "Short-term (jam-hari): butuh pemikir cepat, desisif, toleransi risiko tinggi. Pro: lincah, entry lebih awal. Kontra: stres tinggi saat losing streak.",
      "Intraday/scalping (menit-jam): butuh fokus intens, keputusan tercepat, kekuatan mental menghadapi ups-downs. Kontra: stres paling tinggi karena hasil dinilai trade-per-trade.",
      "Kesalahan umum: memilih tipe hanya dari pro-nya — padahal kontra-lah yang menentukan apakah kamu bertahan.",
      "Filter kedua setelah kepribadian: kondisi hidup. Pekerja kantoran praktis tidak mungkin scalping — jam kerjamu ikut memilihkan tipe tradingmu.",
    ],
    tips: [
      "Tulis dua daftar: sifat dominanmu dan slot waktu nyata per hari — pilih tipe yang lolos KEDUA filter.",
      "Ragu di antara dua tipe? Pilih yang stresnya lebih rendah dulu; naik intensitas lebih mudah daripada pulih dari burnout.",
    ],
  },
  {
    id: "risk-management-tameng",
    group: "proses",
    title: "Risk management: tameng melawan probabilitas",
    videoTitle: "1 Kunci Rahasia Profit Konsisten (Full-Time Funded Trader)",
    videoId: "0hfoHvQv-m4",
    enrichesSteps: [],
    thesis:
      "Trading adalah permainan probabilitas — satu-satunya pelindung dari bad distribution dan risk of ruin adalah position sizing realistis dan mindset risk-to-reward, bukan pips.",
    points: [
      "Win rate 50% ≠ lima loss beruntun membuat trade keenam 'harusnya win'. Losing streak panjang itu normal secara matematis.",
      "Hitung 'peluru': akun prop max drawdown 10% dengan risk 1%/trade = hanya 10 peluru; risk 2% = beberapa loss beruntun normal saja sudah breach.",
      "Risk 0,5% mengubah matematikanya: butuh 20 loss beruntun untuk breach — risk of ruin turun drastis.",
      "Rekomendasi sizing: 0,5% per trade untuk akun prop, 1-2% untuk akun personal.",
      "Reframe tujuan prop firm: goal utamanya jadi risk manager yang baik — prop firm melatih skill risk management, bukan skill cetak profit.",
      "Buang mindset pips: yang dihitung rasio RR + berapa persen risiko per trade.",
      "Jebakan win rate tinggi: dibeli dengan RR rendah (1:0,5) — satu loss menghapus dua win, memicu revenge dengan risiko digandakan → grafik boom-and-bust.",
      "Metode profitable + psikologi baik belum cukup — tanpa risk management, probabilitas random cepat atau lambat menghancurkan akun.",
    ],
    tips: [
      "Sebelum entry, tulis risiko dalam % akun dan RR — bukan pips.",
      "Simulasikan worst case: berapa loss beruntun yang bisa ditanggung pada risiko sekarang — kurang dari ~15-20 → kecilkan size.",
    ],
  },
  {
    id: "pelajaran-prop-firm",
    group: "proses",
    title: "4 pelajaran dari 2 tahun mengelola akun prop firm",
    videoTitle: "2 Tahun Jadi Prop Firm Trader — Pelajaran",
    videoId: "FZKxBKcoBdM",
    enrichesSteps: [],
    thesis:
      "Tujuan sebenarnya prop firm adalah payout berulang — bukan akun sebesar-besarnya. Dicapai lewat memisah akun, drawdown plan, tidak serakah, dan fokus pada hasil sendiri.",
    points: [
      "Jangan merge akun: satu keranjang raksasa membebani emosi — saat drawdown, confidence hilang, tilt, revenge, gambling 'satu trade balik modal', akun hangus.",
      "Cara lebih optimal: kelola satu per satu — akun pertama profit → withdraw → pindah ke akun kedua; akun kedua drawdown → pindah ke akun ketiga. Rotasi menjaga emosi ringan.",
      "Tujuan mengelola akun prop cuma SATU: how do we get a payout.",
      "Wajib punya drawdown plan: kebanyakan orang hanya mensimulasikan best case, tidak pernah merencanakan worst case.",
      "Contoh konkret: drawdown -4% (dengan risk 0,5% = 8 loss beruntun) → potong risiko jadi setengah (0,25%) — 8 loss beruntun artinya ada yang salah dengan market atau dirimu.",
      "Jangan serakah payout: profit 2-3% → amankan dan withdraw dulu; data masa lalu tidak menjamin masa depan.",
      "Fokus hasil sendiri: 5% per bulan ≈ 60% setahun — hampir setara return tahunan hedge fund legendaris; berhenti merasa kurang karena klaim influencer.",
    ],
    tips: [
      "Pegang beberapa akun terpisah dan rotasikan; merge hanya kalau emosimu sudah terbukti stabil.",
      "Tulis drawdown plan SEKARANG: di level berapa risiko dipotong setengah, kapan berhenti trading.",
      "Jadwalkan withdraw begitu sentuh target kecil (2-3%) — payout aman lebih berharga dari screenshot equity besar.",
    ],
  },
  {
    id: "satu-pair-spesialisasi",
    group: "proses",
    title: "Less is more: spesialisasi 1-2 pair",
    videoTitle: "Trading Banyak Pair = Penghambat Profit",
    videoId: "Qtf-72RL2NY",
    enrichesSteps: [],
    thesis:
      "Banyak pair terasa 'lebih banyak peluang', padahal membagi fokus dan mencegah spesialisasi. Edge datang dari jam terbang yang menumpuk di SATU pair — bukan menyebar 1 liter air ke 10 gelas.",
    points: [
      "Decision fatigue nyata: kapasitas keputusan per hari terbatas. 12 pair = keputusan buruk di sore hari; 1 pair = tiap keputusan dengan mental capital penuh.",
      "Ilusi diversifikasi: diversifikasi konsep INVESTASI, bukan trading. Kamu execution specialist, bukan portfolio manager.",
      "Korelasi menggandakan risiko diam-diam: EURUSD & GBPUSD sama-sama digerakkan DXY — 1% di keduanya = risiko efektif 2% pada taruhan yang sama.",
      "Tiap pair punya karakter (gold impulsif, EURUSD kalem, indeks lebih liar) — mustahil kenal 12 karakter real-time; spesialis tahu jam & pola stop hunt pair-nya dari jam terbang.",
      "Data advantage: backtest mendalam hanya mungkin di 1-2 pair — data mendalam itulah edge.",
      "Overtrading trap: 16 pair = selalu ada 'peluang' tiap jam; 10 peluang × 1% = meresikokan 10% modal sehari tanpa sadar.",
      "10.000 jam di 1 pair menghasilkan kungfu jauh lebih berbahaya daripada dibagi 16 pair — 'satu tendangan dilatih seribu kali' ala Bruce Lee.",
    ],
    tips: [
      "Pangkas watchlist ke maksimal 1-2 pair dan komit backtest hanya di situ.",
      "Tidak ada setup di pair-mu hari ini? Jawabannya MENUNGGU — bukan buka chart pair lain.",
      "Sebelum tambah posisi pair kedua, cek apakah mengandung mata uang sama — kalau ya, hitung sebagai penggandaan risiko.",
    ],
  },
  {
    id: "lima-kesalahan-backtest",
    group: "proses",
    title: "5 kesalahan yang bikin data backtest menipu",
    videoTitle: "5 Kesalahan yang Bikin Data Backtest Sampah",
    videoId: "K66D2_CGZJY",
    enrichesSteps: [],
    thesis:
      "'Kok pas backtest bagus, pas live jelek?' Pembedanya: tekanan psikologis yang tidak ada di backtest. Lima cacat bawaan membuat data terlihat lebih indah dari kemampuan asli — backtest hanya setengah resep; setengahnya lagi live testing.",
    points: [
      "Kesalahan 1 — Hindsight bias ('curang halus'): saat replay diam-diam sudah tahu harga mau ke mana, jadi 'berani' hold saat stop hunt. Confidence palsu.",
      "Kesalahan 2 — Mempercantik data ('curang kasar'): ragu entry, skip, lalu setelah harga naik dicatat sebagai win 'karena tadinya mau entry'. Boost ego, bukan gambaran eksekusi asli.",
      "Kesalahan 3 — Backtest tidak melatih kesabaran: tombol next memunculkan candle seketika; live harus menunggu candle close & berhari-hari antar setup.",
      "Kesalahan 4 — Mengabaikan kondisi nyata: slippage & spread bikin SL 1% jadi 1,1-1,2%, bahkan 3-5% saat parah.",
      "Kesalahan 5 — Transisi ke live tanpa sadar blind spot di atas: hampir 100% hasil backtest ≠ live; yang tidak siap kaget lalu menyalahkan sistem.",
      "Fungsi backtest yang benar: melatih pattern recognition dan menghafal SOP entry — bukan memproduksi win rate untuk dipamerkan.",
      "Conviction sejati datang dari jam terbang live, bukan data backtest yang dipercantik.",
    ],
    tips: [
      "Saat replay, jangan intip candle ke depan supaya hindsight bias minimal.",
      "Catat HANYA trade yang benar-benar dieksekusi di replay.",
      "Diskon ekspektasi: asumsikan hasil live lebih buruk, masukkan buffer slippage/spread ke perhitungan risiko.",
      "Perlakukan live testing modal kecil sebagai bagian resmi riset.",
    ],
  },

  // ── Psikologi ──
  {
    id: "drawdown-professional",
    group: "psikologi",
    title: "Drawdown: tempat lahirnya trader profesional",
    videoTitle: "Drawdown: Where Professional Traders Are Made",
    videoId: "JeKZwuWlHi0",
    enrichesSteps: [],
    thesis:
      "Drawdown bukan musibah — ia sistem penyaring market yang memisahkan trader beneran dari trader hoki. Yang menentukan kelasmu bukan drawdown-nya, tapi bagaimana kamu menguasai diri di dalamnya.",
    points: [
      "Semua trader legendaris pernah drawdown. Loss 3x beruntun sudah menyerah = kamu turis yang tersasar di market.",
      "Tujuannya bukan menghindari drawdown, tapi mengontrol diri di dalamnya. Bounce back = bukti trader beneran.",
      "Langkah 1 — Evaluasi sumber: probabilitas market atau kesalahan sendiri? Kalau salah sendiri, telusuri root cause emosional (7 dari 10 loss karena FOMO → FOMO karena 'butuh duit'). Itu yang di-fix.",
      "Kalau murni probabilitas dan sistem sudah terbukti: jangan ubah apa-apa, teruskan eksekusi dengan risiko yang benar.",
      "Langkah 2 — Fokus ke eksekusi, bukan hasil: bukan 'trade berikut win atau loss?', tapi 'setup ini sesuai plan atau tidak?'",
      "Langkah 3 — Jangan isolasi diri: cari mentor dan komunitas yang benar untuk afirmasi positif.",
      "Drawdown memberi 3 hadiah: kesabaran, kerendahan hati, dan disiplin.",
      "Profit mengajarkan cara menang; drawdown mengajarkan cara jadi petarung.",
    ],
  },
  {
    id: "sunk-cost-fallacy",
    group: "psikologi",
    title: "Sunk cost fallacy: menahan posisi rugi karena 'sayang'",
    videoTitle: "The Danger of Sunk Cost Fallacy in Trading",
    videoId: "-WXzFcDsEfc",
    enrichesSteps: [],
    thesis:
      "Sunk cost fallacy = mempertahankan posisi rugi karena sudah banyak waktu, effort, dan uang yang ditanam. Di bioskop ruginya harga tiket; di trading, ruginya tak terbatas.",
    points: [
      "Cirinya: floating loss berbulan-bulan, terus top-up, tanpa SL, berdoa harga reverse. Trading pakai doa, bukan data.",
      "Tiga bahaya: jadi tidak rasional (logika di-override emosi), loss kecil berubah bencana besar, ego terjebak masa lalu (bertahan karena tak mau malu mengaku salah).",
      "Uang yang sudah hilang = uang edukasi. Keputusan terbaik dibuat berdasarkan kondisi SAAT INI, bukan berapa banyak yang sudah dikorbankan.",
      "Obat utama: tentukan exit SEBELUM entry. Pikirkan loss dulu baru reward — loss itu kepastian, win itu probabilitas.",
      "Latih move on: tiap posisi tidak ada hubungannya dengan posisi sebelumnya.",
      "Anggap tiap posisi bisnis kecil — kalau rugi, tutup tokonya.",
      "Posisi bukan pasangan hidup. Menahan posisi salah = bertahan di toxic relationship karena sudah banyak berkorban.",
    ],
    tips: ["Bangun mental cut-loss lewat backtest dan simulasi — ketahanan mental dilatih, bukan bawaan."],
  },
  {
    id: "belajar-cuek",
    group: "psikologi",
    title: "Belajar cuek: detachment dari posisi",
    videoTitle: "Belajar Cuek = Kunci Trader Sukses",
    videoId: "Brq17jDeyzc",
    enrichesSteps: [],
    thesis:
      "Semakin cuek terhadap posisi yang berjalan, semakin profitable. Mantengin chart tidak mengubah arah harga — detachment emosional adalah mindset inti trader profesional.",
    points: [
      "Over-monitoring berbahaya: makin sering dipantau, makin besar sunk cost emosional, makin sakit saat loss; euforia floating profit = double damage saat berbalik SL.",
      "Belum bisa lepas dari chart setelah entry = belum punya sistem yang baku.",
      "Set and forget: SL & TP terpasang → lupakan; biarkan hit sendiri.",
      "Trader profesional melihat satu posisi sebagai 1 dari 1000 trade berikutnya.",
      "Jadilah sniper, bukan machine gunner: bidik lama, tembak sekali presisi; miss → tidak baper, ambil tembakan berikutnya lebih hati-hati.",
      "Trader sukses bukan yang paling jago baca chart, tapi yang paling bisa let go saat salah.",
    ],
    tips: [
      "Setelah entry: pasang SL + TP, tutup chart, pasang alert. Buka lagi hanya saat SL/TP tersentuh.",
      "Anggap tiap trade bakal loss — profit jadi bonus, bukan ekspektasi.",
      "Jurnal semua entry supaya fokus pindah dari hasil ke proses.",
    ],
  },
  {
    id: "mindset-capital-preservation",
    group: "psikologi",
    title: "Mindset trader pemenang: capital preservation dulu",
    videoTitle: "The Mindset of a Winning Trader",
    videoId: "fa-QCV_g7oA",
    enrichesSteps: [],
    thesis:
      "Fokus trader pemenang bukan 'berapa profit yang bisa didapat', tapi 'bagaimana menjaga risk'. Trader dibayar berdasarkan kualitas keputusan, bukan lamanya menatap chart.",
    points: [
      "Risk management punya dua fungsi: mencegah keputusan bodoh, dan mengecilkan risiko saat market tidak memberi peluang bagus. Tahu kapan stay away, kapan offensif.",
      "Begitu fokus bergeser ke outcome ('tinggal 2% lolos prop', 'hari ini harus profit'), kamu tetap ambil risiko di kondisi low probability — awal kehancuran.",
      "'Sudah mantengin market seharian, masa nggak dapat trade' = mindset karyawan. Market membayar keputusan baik, bukan jam kerja.",
      "Target harian bukan profit tapi membangun good habits: patuh risk management, patuh rules, percaya sistem. Profit adalah by-product.",
      "Satu hari/minggu/bulan jelek tidak merusak karir — bagian dari probabilitas; yang penting gambaran jangka panjang.",
      "Analogi: kasih modal ke 'Mr. Businessman' (sistem teruji), bukan ke 'pengemis' (judi, revenge, martingale). Selama uang terus dikasih ke pengemis, tidak akan pernah menang.",
    ],
  },
  {
    id: "trading-seperti-video-game",
    group: "psikologi",
    title: "Perlakukan trading seperti video game",
    videoTitle: "Perlakukan Trading Seperti Video Game",
    videoId: "WRvXfB3Q3ZE",
    enrichesSteps: [],
    thesis:
      "Level up karaktermu sedikit demi sedikit lewat jam terbang. Bedanya satu: di trading kamu tidak berkompetisi dengan siapa pun — keputusan demi 'menang lawan orang lain' itu pointless.",
    points: [
      "Buat learning experience unik untuk diri sendiri: suka video → tonton; suka teks → baca. Backtest sambil narasi seolah market live adalah cara ampuh menyerap pola.",
      "Track progress seperti build tim game: ukur naik level dari hari ke hari. Money is NOT the focus — nilai performa harian dengan grade (A/B/C), bukan rupiah.",
      "Improve 1% setiap hari sudah lebih dari cukup — efeknya compounding.",
      "Setiap kesalahan (mis. revenge trading) wajib dicatat hari itu juga supaya besok tidak diulang. Kesalahan sama dua hari berturut = not improving.",
      "Improvement terlihat dari kualitas eksekusi yang membaik, bukan profit hari ini — hasilnya compounding jangka panjang.",
      "Bawa mindset gamer yang selalu ingin naik rank: level up every single day.",
    ],
  },
  {
    id: "berpikir-tahunan",
    group: "psikologi",
    title: "Berpikir dalam hitungan tahun, bukan hari",
    videoTitle: "Successful Traders Think in Yearly Timeframes",
    videoId: "MpaMT2iDBIg",
    enrichesSteps: [],
    thesis:
      "Trader jelek berpikir harian, trader sukses berpikir tahunan. Yang bikin kaya bukan persentase profit besar, tapi the power of compounding di atas modal yang terus tumbuh.",
    points: [
      "Matematika: 100% profit di akun $1.000 = $1.000 dengan effort mati-matian; 10% per TAHUN di akun $1 juta = $100.000. Money makes money; effort bukan penentu bayaran.",
      "Short-term thinking melahirkan keputusan bodoh: robot trading, money game, ponzi. Long-term thinking membuatmu menolak semua itu.",
      "Kumpulkan profit untuk membesarkan PERSONAL account: akun prop comes and go; personal account dengan risk 0,5-1% praktis tidak mungkin MC dan jadi aset jangka sangat panjang.",
      "5-10% per bulan sudah lebih dari cukup — tidak perlu ngoyo 100%.",
      "'Bulan ini harus profit buat bayar kebutuhan' → memaksakan entry yang tidak ada → kalah. Losing day bukan masalah selama sesuai SOP.",
      "Konsistensi kunci: SOP, rules, risk management konsisten setiap hari — bukan disiplin selang-seling.",
      "Trading itu game seumur hidup — dengan horizon sepanjang itu, satu bulan merah tidak berarti apa-apa.",
    ],
  },
  {
    id: "lima-pelajaran-lima-tahun",
    group: "psikologi",
    title: "5 pelajaran dari 5 tahun trading",
    videoTitle: "5 Pelajaran dari 5 Tahun Trading",
    videoId: "l_52_GwE9i8",
    enrichesSteps: [],
    thesis:
      "Lima pelajaran, satu per tahun perjalanan: dari risk management sampai memprioritaskan personal account. Ambil pelajarannya tanpa harus bayar 5 tahun yang sama.",
    points: [
      "Tahun 1 — Risk management: tidak seksi, tapi tanpa ini metode apa pun gagal. Kesalahan fatalnya dulu: double size saat profit, martingale saat loss → equity boom-and-bust.",
      "Tahun 2 — Backtesting: satu-satunya cara memastikan metode profitable adalah data. Trading tanpa data = bet on black di Las Vegas.",
      "Tahun 3 — Simplicity is key: kalau tidak bisa menjelaskan metodemu secara simpel, kamu belum paham metodemu. Aturan sederhana mengalahkan micromanaging.",
      "Tahun 4 — Prop firm sebagai kendaraan: untuk modal kecil, reward-nya jauh lebih besar — syaratnya skill sudah mumpuni.",
      "Tahun 5 — Prioritaskan personal account: banyak prop firm gugur/scam; yang paling aman uang sendiri. Withdraw profit prop, pindahkan ke personal, kejar compounding di sana.",
    ],
  },
  {
    id: "lima-sifat-tidak-cocok",
    group: "psikologi",
    title: "5 tipe orang yang tidak cocok jadi trader",
    videoTitle: "5 Traits: Tidak Cocok Jadi Trader",
    videoId: "BdD1jeLeJKo",
    enrichesSteps: [],
    thesis:
      "Lima sifat yang membuat seseorang lebih baik tidak trading — dan cermin kebalikannya: profil yang justru cocok. Trading bukan Indomie; mie instan pun butuh proses masak.",
    points: [
      "1. Si instan: baru belajar 3 hari sudah tanya 'bisa WD berapa persen per hari?'. Trader beneran menilai progres bulanan, bukan profit harian.",
      "2. Si gampang emosian — dua arah: marah saat stop hunt → revenge; DAN euforia saat TP → overtrading, over-lot. Emosi positif sama bahayanya dengan negatif.",
      "3. Si tidak mau belajar tapi mau cuan: minta SOP instan, robot trading, jual-beli sinyal. Tidak ada orang kaya dari copy sinyal.",
      "4. Si copycat tanpa konteks: meniru SOP/trade tanpa paham logikanya, lalu menyalahkan orangnya saat loss.",
      "5. Si egois tak mau ngaku salah: SL ditembus → martingale; floating loss → averaging; melawan order flow demi membuktikan analisa benar.",
      "Yang COCOK: mindset jangka panjang, siap belajar-disiplin-bertanggung jawab, mengakui loss sebagai loss-nya sendiri, fokus ke sistem, mental tahan banting.",
    ],
  },
  {
    id: "stop-loser-trader",
    group: "psikologi",
    title: "Berhenti jadi trader pecundang",
    videoTitle: "Stop Being a Loser Trader",
    videoId: "bYfpjMHxtpw",
    enrichesSteps: [],
    thesis:
      "Playground sama, chart sama, tidak ada manipulasi — tapi mayoritas kalah. Pembeda pecundang dan pemenang bukan market atau sistem, melainkan mental orangnya.",
    points: [
      "Penyebab 1 — Mindset instan: berharap mentorship memberi rumus 'A+B = buy' tanpa mikir. Belajarnya malas → profit tidak konsisten.",
      "Penyebab 2 — Tidak punya sistem: buy karena 'kayaknya naik', chart penuh indikator seperti art project tapi tak tahu entry di mana. Trading harus berbasis probabilitas: RR, win rate, losing streak, journaling.",
      "Market tidak pernah anomali — polanya berulang. Gagal bukan salah market; kamu yang tidak punya plan.",
      "Penyebab 3 — Diperbudak ego: buang SL karena 'yakin benar', MC, lalu salahkan 'market anomali'. Trader benar mengakui: kena SL = analisa kali ini salah, cut, beres.",
      "Penyebab 4 — Terlalu banyak input, nol fokus: ganti strategi tiap minggu itu panik berkedok belajar. Information overload mendilusi metode utama.",
      "Filter informasi: kualitas > kuantitas. Fokus SATU strategi sampai paham luar-dalam.",
    ],
    tips: ["Deklarasikan komitmen tertulis — menuliskannya mengirim sinyal ke alam bawah sadar bahwa kesalahan lama selesai."],
  },
  {
    id: "dua-kebiasaan-longterm",
    group: "psikologi",
    title: "2 kebiasaan untuk long-term success",
    videoTitle: "2 Hal untuk Long-Term Success dalam Trading",
    videoId: "ZNRf_CwA2HA",
    enrichesSteps: [],
    thesis:
      "Dua kebiasaan yang bermuara ke satu hal: KONSISTENSI. Tanpa cara eksekusi dan cara membaca market yang konsisten, mustahil hasilnya konsisten.",
    points: [
      "Kebiasaan 1 — Selalu in-tune dengan market: paham apa yang terjadi minggu lalu, bagaimana membentuk minggu ini, ke mana minggu depan. Tidak satu frekuensi dengan market → jangan trading dulu.",
      "Alat utamanya jurnal harian: dari jurnal kamu tahu 'kemarin market begini, kemungkinan hari ini mengejar liquidity yang itu'.",
      "Review mingguan: cek semua trade sesuai SOP. Ada 4 trade di luar SOP = 'ring rust' — karat kecil yang harus dibersihkan sebelum jadi kebiasaan.",
      "Kebiasaan 2 — Rutinitas terstruktur: bangun tidur langsung buka chart berharap profit = resep kekacauan. Tetapkan jendela trading (sesi mana, berapa jam).",
      "Rutinitas adalah mesin disiplin: tanpa disiplin menjalankan rutinitas, konsistensi proses tidak ketemu — dan tanpa itu, tidak ada konsistensi hasil.",
    ],
  },
  {
    id: "power-of-focus",
    group: "psikologi",
    title: "The power of focus: satu-satunya jalan sukses",
    videoTitle: "Hanya Ini Caranya Sukses di Trading",
    videoId: "Oc2HoynZVls",
    enrichesSteps: [],
    thesis:
      "Dari semua faktor eksternal yang tak bisa dikontrol, ada satu superpower internal yang sepenuhnya di tanganmu: FOKUS. Tuang 100% air ke satu gelas sampai penuh, jangan dibagi ke lima gelas.",
    points: [
      "Tolak semua godaan 'ide bisnis bagus' di kiri-kanan. Fokus 100% di satu keahlian sampai jadi paling jago — progresmu akan jauh melampaui yang coba-coba lalu quit.",
      "Perlakukan trading seolah tidak ada opsi lain — justru saat opsi lain ditutup, breakthrough muncul.",
      "Uji dengan 3 pertanyaan bisnis: (1) bisnis mana yang tak punya pembukuan? Jurnal = pembukuanmu. (2) Bisnis mana yang tak butuh proses? (3) Bisnis mana yang tak ada masa sepi? Satu bulan minus lalu ganti metode = tidak akan pernah sukses.",
      "Setelah profitable, jangan puas: kebanyakan gagal justru SESUDAH profitable — merasa jago, kendor disiplin, lalai risiko. Target: profitable DAN konsisten.",
      "Stay in the game long enough: bertahan cukup lama sampai menemukan titik terang. Merasa tak punya mental untuk ini? Jangan trading — itu justru menyelamatkanmu.",
    ],
  },

  // ── Studi kasus & realita full-time ──
  {
    id: "nq-breakdown-9r",
    group: "eksekusi",
    title: "Breakdown trade NQ +9R: dari bias weekly sampai set & forget",
    videoTitle: "NQ Trade Breakdown: +9R dalam 1 Minggu (NFP Week)",
    videoId: "9RvQzCPBYd4",
    enrichesSteps: [1, 2, 3, 4, 5, 6, 7],
    thesis:
      "Walkthrough nyata trade buy Nasdaq yang profit 3x dalam satu minggu (termasuk NFP): bias bullish dibangun top-down weekly→daily, entry di New York session setelah break of high, posisi ditinggal tanpa breakeven — bukti logika market maker + set & forget mengalahkan pattern hafalan.",
    points: [
      "Liquidity diambil BUKAN otomatis reversal: setelah high weekly disapu, NQ tidak bereaksi bearish — malah membentuk order block. Sinyal harga masih mau naik mengisi imbalance di atas sebelum berbalik.",
      "Bukan sembarang FVG daily dipakai: FVG paling bawah diabaikan karena tanpa PD array pendamping; yang dipilih valid karena tepat di sebelah high yang baru di-break. Konteks penempatan FVG > FVG-nya sendiri.",
      "Rencana utama: tunggu reaksi FVG 1H saat New York session. Tapi karena impuls naik terlalu kuat, disiapkan plan B — high terdekat di-break → langsung entry tanpa menunggu retrace. 'Pegang logikanya, bukan pattern-nya.'",
      "Eksekusi Senin: turun ke M5, entry saat break of high, SL hanya selebar 1 bar di bawah. TP tersentuh 10-15 menit — presisi datang dari konteks HTF, bukan SL lebar.",
      "Trade Rabu: tunggu low disapu dulu (stop hunt), break ke atas baru entry. Di-hold lintas hari — Kamis hampir kena SL — dan TP saat NFP Jumat.",
      "Anti-breakeven terbukti: harga bolak-balik lama persis di area BE. Kalau SL digeser ke BE / pakai trailing, posisi tersapu dua kali sebelum TP. Kalah ya kalah penuh, menang ya menang penuh.",
      "Set & forget sebagai moto: order + SL + TP terpasang → tidak dicek, tidak diintervensi — bahkan menjelang NFP tidak ada TP manual karena takut.",
      "Tiga profit satu minggu lahir dari proses yang sama diulang: konfirmasi weekly → daily → tunggu session → trigger LTF → tinggalkan posisi.",
    ],
    tips: [
      "Impuls searah bias sangat kuat? Jangan keras kepala menunggu retrace ke POI ideal — siapkan skenario entry pada break of structure terdekat.",
      "Sebelum entry, tulis dua skenario (reaksi di POI vs break langsung) supaya tidak improvisasi saat candle bergerak.",
      "Jangan geser SL / tutup posisi lebih awal karena news — setup dan risk sudah benar → biarkan market menyelesaikan.",
    ],
  },
  {
    id: "gold-12m-floating-loss",
    group: "psikologi",
    title: "Anatomi rungkat di gold: lawan order flow + average down",
    videoTitle: "Floating Loss 12M karena Sell Gold — Studi Kasus",
    videoId: "Fofl6ogfYFs",
    enrichesSteps: [1, 2],
    thesis:
      "Mayoritas trader hancur di gold karena satu kesalahan yang sama: sell melawan order flow yang jelas bullish, lalu diperparah inject dana dan menahan posisi minus — sementara yang sekadar ikut arah order flow justru panen di instrumen yang sama.",
    points: [
      "Akar masalah bukan strategi rumit: sell gold saat order flow bullish. Retail tidak menggerakkan market (volume harian ~$6 triliun) — satu-satunya peran kita adalah ikut arus institusi.",
      "Studi kasus nyata: korban grup sinyal IB sell gold 3 lot dari area 2.000-2.300, menahan berbulan-bulan sambil terus inject dana; ada yang floating loss ratusan ribu dolar hanya karena menahan sell.",
      "Pola psikologis averaging: makin dalam minus, makin sulit mengaku salah — cut loss terasa berat, 'solusinya' tambah dana. Sunk cost yang menggulung jadi kehancuran akun.",
      "Insentif busuk: banyak 'edukator' penyaran sell gold adalah IB yang tidak bisa trading — makin sering kamu lawan trend, makin sering inject, makin besar komisi mereka.",
      "Sell di top yang sesekali kena hanyalah kemenangan semu: cuma menangkap retracement kecil sebelum harga lanjut naik — hoki sesaat memperkuat kebiasaan counter-trend yang mematikan.",
      "Tes paling sederhana: buka chart daily gold, tanya 'uptrend atau downtrend?'. Kalau orang awam saja bisa jawab uptrend, tidak ada analisa canggih yang membenarkan sell.",
      "Kontras hasil: dengan konsisten 'gold buy, order flow bullish', komunitas yang sama profit terus di instrumen yang membangkrutkan trader lain — pembedanya murni arah, bukan kecanggihan entry.",
    ],
    tips: [
      "Sebelum analisa apapun, tetapkan arah order flow di daily; haram melawannya sekencang apa pun 'sinyal' reversal.",
      "Jangan pernah average down posisi minus — posisi salah dipotong, bukan dipupuk.",
      "Sumber edukasi/sinyal berafiliasi IB yang sering menyuruh counter-trend? Anggap sarannya konflik kepentingan.",
    ],
  },
  {
    id: "prop-firm-alat-bukan-tujuan",
    group: "proses",
    title: "Prop firm itu alat, bukan tujuan: wajib punya personal account",
    videoTitle: "Lu Gak Akan Kaya dari Prop Firm",
    videoId: "RTTZysGuwgU",
    enrichesSteps: [],
    thesis:
      "Prop firm adalah leverage terbaik untuk modal kecil, tapi tetap bisnis yang tidak ingin semua trader profit — punya hidden rules dan bisa hilang kapan saja. Kekayaan jangka panjang dibangun di personal account.",
    points: [
      "Prop firm jalur paling masuk akal untuk pemula bermodal terbatas: risk-to-reward terhadap modal sendiri jauh lebih tinggi.",
      "Tapi ingat model bisnisnya: prop firm untung justru kalau mayoritas trader gagal — tidak pernah didesain supaya semua lolos dan dibayar.",
      "Bahaya hidden rules: ada kasus profit ditolak saat withdraw karena aturan yang tak tertulis di awal. Di personal account mustahil — profit tinggal tarik.",
      "Pelajaran My Forex Funds: dana terkumpul bisa lenyap karena prop firm-nya sendiri bermasalah — lolos fase 1 & 2 jadi kerja tanpa dibayar.",
      "Alokasi konkret yang dipakai: ~60% bobot di prop firm (demi leverage), 40% di personal account sebagai jaring pengaman.",
      "Perbedaan inti: prop memaksa disiplin lewat rules (bagus untuk yang belum matang); personal memberi kebebasan penuh (menguntungkan hanya untuk yang psikologinya dewasa).",
      "Prasyarat personal account: broker teregulasi ketat & terpercaya — kebebasan menarik dana tak ada artinya kalau brokernya tak bisa dipercaya.",
      "Perlakukan prop firm sebagai bisnis untuk dimanfaatkan — jangan 100% menggantungkan hidup pada institusi yang aturannya bisa berubah sepihak.",
    ],
    tips: [
      "Sisihkan sebagian payout prop ke personal account sejak payout PERTAMA.",
      "Sebelum ambil challenge, baca rules payout tuntas dan cari kasus penolakan withdraw prop firm itu di komunitas.",
      "Disiplin masih bocor? Biarkan rules prop firm memaksamu disiplin dulu sebelum pindah ke kebebasan personal account.",
    ],
  },
  {
    id: "tiga-kebohongan-fulltime",
    group: "psikologi",
    title: "Tiga kebohongan full-time trading",
    videoTitle: "The Lie About Full-Time Trading",
    videoId: "LhGZ8HF_oTM",
    enrichesSteps: [7],
    thesis:
      "Full-time trading memberi kebebasan finansial, lokasi, dan waktu — tapi ada harga yang tidak diceritakan: hilangnya kepastian gaji merusak objektivitas, 'makin rajin makin cuan' justru terbalik, dan time freedom bisa jadi racun.",
    points: [
      "Kebohongan #1 — kepastian: saat karyawan, profit konsisten justru karena ada safety net gaji. Begitu full-time, uncertainty muncul dan 2-3 bulan pertama berdarah-darah — bukan metodenya salah, operatornya error di bawah tekanan.",
      "Transisi tersulit: membuang mindset 'akhir bulan pasti gajian'. Hari ini loss, besok win — yang dinilai total akhir bulan; loss harian adalah biaya bisnis.",
      "Setelah uncertainty diterima sebagai bagian bisnis, growth meledak — hambatan terbesar psikologis, bukan teknikal.",
      "Kebohongan #2 — produktivitas: trading itu paradoks. 80% pekerjaan adalah MENUNGGU setup, hanya 20% eksekusi. Makin sering entry, makin besar risk of ruin.",
      "Profit besar datang dari kesabaran menunggu setup tepat — 'rajin mencari entry' adalah kerajinan salah alamat.",
      "Kebohongan #3 — time freedom bermata dua: waktu luang dipakai menatap chart 24 jam = selalu ada 'setup menarik' yang sebenarnya bukan setup-mu.",
      "Tidak ada bos yang menyusun harimu — kamu yang membangun rutinitas; apa yang kamu lakukan dengan waktu kosong menentukan sukses karir full-time.",
      "Waktu luang yang benar: backtest, jurnal, cari setup & pair yang cocok dengan karaktermu, perbaiki psikologi.",
    ],
    tips: [
      "Jangan resign sebelum penghasilan trading konsisten minimal 2x gaji — dan siapkan mental 2-3 bulan pertama tetap lebih berat dari perkiraan.",
      "Ukur produktivitas dari kualitas menunggu (patuh setup), bukan jumlah trade per hari.",
      "Susun jadwal harian tertulis layaknya punya bos: jam analisa, eksekusi, belajar, hidup — sisanya tutup chart.",
    ],
  },
  {
    id: "lima-sisi-gelap-trading",
    group: "psikologi",
    title: "5 sisi gelap dunia trading",
    videoTitle: "5 Dark Sides of the Trading World",
    videoId: "fIaMmsVVi6s",
    enrichesSteps: [],
    thesis:
      "Semua orang pamer profit, tidak ada yang cerita saat dihantam loss. Lima realita gelap yang pasti dialami setiap trader — dan kesiapan menghadapinya adalah modal sesungguhnya.",
    points: [
      "#1 Kesepian: kamu menjalani ini sendirian; orang terdekat tak mengerti pekerjaanmu. Support hanya dari komunitas seperjuangan. Siap = 20% modal.",
      "#2 Mental breakdown saat drawdown: bukan cuma soal uang, tapi kepercayaan diri. 90% trader meragukan dirinya saat minus; tetap percaya proses selama drawdown = 40% modal.",
      "#3 Kecanduan chart: analisa beberapa jam khusus itu sehat; menempel di chart sepanjang hari (makan bersama keluarga pun sambil lihat chart) itu penyakit. Lolos = 60% modal.",
      "#4 Ilusi kontrol: 100 video support-resistance tidak memberi kontrol atas market — yang kamu dapat hanyalah kemampuan BERADAPTASI. Menerima ini = 80% modal.",
      "#5 Ego vs realita: 'gua lulusan kampus top, harusnya gampang' — makin tinggi ego, makin keras market membanting. Masuk tanpa ego, hanya percaya disiplin = 100% modal.",
      "Benang merah: setiap trader yang survive pernah merasakan kelimanya. Kamu tidak jadi trader hebat sebelum dihancurkan lebih dulu.",
    ],
    tips: [
      "Bangun support system sesama trader SEBELUM drawdown datang.",
      "Pasang batas jam layar chart harian yang tegas — di luar itu, chart ditutup.",
      "Merasa 'sudah jago'? Anggap alarm — biasanya itu momen tepat sebelum market menghajar.",
    ],
  },
  {
    id: "persiapan-fulltime-trader",
    group: "psikologi",
    title: "5 hal yang harus disiapkan sebelum full-time",
    videoTitle: "Hal yang Gua Harap Tau Sebelum Jadi Full-Time Trader",
    videoId: "zWXn5alN1vc",
    enrichesSteps: [],
    thesis:
      "Sukses full-time trading lebih ditentukan persiapan hidup di luar chart — disiplin waktu kosong, kehidupan selain trading, dana darurat 6-12 bulan, investasi jangka panjang, dan dokumentasi — daripada strateginya sendiri.",
    points: [
      "Waktu luang melimpah = pro sekaligus kontra terbesar: tanpa bos, yang tidak disiplin menghabiskannya tidur & main game. Disiplin itu menular — hidup harian tak disiplin, mustahil trading disiplin.",
      "Wajib punya kehidupan di luar trading (gym, komunitas, hobi): kalau seluruh identitasmu cuma trading, satu hari merah terasa seperti hidup runtuh.",
      "Buang stres finansial dulu: siapkan 6-12 bulan biaya hidup sebagai dana darurat. Tanpa itu kamu trading untuk bayar makan — subjektif dan panik.",
      "Trading bukan tujuan akhir: salurkan sebagian profit ke investasi jangka panjang — biarkan uang hasil trading bekerja sendiri.",
      "Dokumentasikan perjalanan dari hari pertama: bahan evaluasi, pengukur progres, sumber rasa syukur.",
      "Urutan logis: amankan fondasi hidup dulu (dana darurat, rutinitas, sosial) → beban psikologis trading mengecil sendiri, bukan sebaliknya.",
    ],
    tips: [
      "Sebelum resign: hitung pengeluaran bulanan × 6-12 — itu 'tiket masuk' full-time, bukan opsional.",
      "Jadwalkan aktivitas non-trading sebagai agenda tetap mingguan, setara pentingnya dengan jam analisa.",
      "Mulai jurnal hari ini meski belum full-time — data historis diri sendiri adalah mentor termurah.",
    ],
  },
];

export function kajianByGroup(): {
  key: KajianGroup;
  label: string;
  emoji: string;
  blurb: string;
  items: Kajian[];
}[] {
  return KAJIAN_GROUPS.map((g) => ({
    ...g,
    items: KAJIAN.filter((k) => k.group === g.key),
  })).filter((g) => g.items.length > 0);
}
