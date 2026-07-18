// Kevin Jonathan (@kevinjon27) — trading method, distilled.
//
// Own-words summaries of the methodology/tutorial videos from Kevin Jonathan's
// YouTube channel (personal-use study notes, not transcripts). Focus = his
// METHOD & principles (technical analysis, futures risk, psychology, valuation,
// accumulation, narratives) — NOT his time-sensitive daily price calls.

export type KJTopic =
  | "basics"
  | "technical"
  | "futures"
  | "risk"
  | "psychology"
  | "manipulation"
  | "valuation"
  | "narrative"
  | "accumulation";

export const KJ_TOPICS: { key: KJTopic; label: string; emoji: string }[] = [
  { key: "basics", label: "Dasar Trading", emoji: "📗" },
  { key: "technical", label: "Analisa Teknikal", emoji: "📈" },
  { key: "futures", label: "Futures", emoji: "⚙️" },
  { key: "risk", label: "Risk Management", emoji: "🛡️" },
  { key: "psychology", label: "Psikologi", emoji: "🧠" },
  { key: "manipulation", label: "Market Maker & Manipulasi", emoji: "🕹️" },
  { key: "valuation", label: "Valuasi & Target Harga", emoji: "🧮" },
  { key: "narrative", label: "Narasi", emoji: "📖" },
  { key: "accumulation", label: "Akumulasi / Menabung", emoji: "💰" },
];

export const KJ_TOPIC_META: Record<KJTopic, { label: string; emoji: string }> =
  Object.fromEntries(KJ_TOPICS.map((t) => [t.key, { label: t.label, emoji: t.emoji }])) as Record<
    KJTopic,
    { label: string; emoji: string }
  >;

export type KJLesson = {
  id: string;
  topic: KJTopic;
  title: string;
  videoTitle: string;
  videoId: string;
  thesis: string;
  points: string[];
  tips?: string[];
};

export const KJ_INTRO =
  "Rangkuman metode trading crypto ala Kevin Jonathan (@kevinjon27) — disaring dari video tutorial & study case-nya (bukan prediksi harga hariannya). Fokus ke prinsip yang tahan lama: cara baca chart, atur risk di futures, psikologi, hitung valuasi, dan strategi akumulasi.";

// Distilled from the 14 curated videos.
export const KJ_LESSONS: KJLesson[] = [
  {
    id: "pengenalan-dunia-trading",
    topic: "basics",
    title: "Pengenalan dunia trading",
    videoTitle: "Episode 1: Introduction to the world of trading",
    videoId: "G5P5xH3KP6I",
    thesis:
      "Trading adalah jual-beli aset untuk untung dari selisih harga — bukan judi, tapi permainan probabilitas yang menuntut manajemen risiko dan disiplin.",
    points: [
      "Trading = jual-beli instrumen (saham, forex, komoditas, crypto) atau barang/jasa dengan harapan untung dari perubahan harga; logika sama dengan bisnis (beli murah, jual mahal).",
      "Di crypto bisa untung dua arah: 'long' saat harga naik dan 'short' saat harga turun — beda dari saham yang intinya beli murah jual mahal.",
      "Trading tidak selalu menang; cut loss / rugi adalah bagian tak terpisahkan (analogi belajar sepeda: pasti jatuh dulu).",
      "Analisa sebagus apa pun tidak menjamin tiap posisi profit — bisa dihantam bad news di luar rencana (contoh: FTX, Luna).",
      "Tujuan cut loss = meminimalkan rugi agar modal tak habis, supaya masih bisa trading lagi; di futures kalau tak cut loss bisa kena Liquid.",
      "Trader pro pun tetap rugi dari waktu ke waktu — ada bulan cuan, ada bulan minus; yang penting hasil akhir terkendali.",
      "Kalau tak berani menerima rugi, jangan jadi trader — lebih baik investasi aman atau jadi karyawan.",
      "Pahami dasar: bullish (naik/optimis) vs bearish (turun/pesimis), serta demand vs supply — permintaan > penawaran → harga naik.",
      "Kenali volatilitas (seberapa cepat harga bergerak, dipicu berita/The Fed/SEC/inflasi) dan likuiditas (kemudahan jual-beli tanpa menggerakkan harga).",
    ],
    tips: [
      "3 kunci minim risiko: atur ukuran posisi/margin, tentukan batas rugi (risk/reward), dan patuhi trading plan.",
      "Ukur likuiditas: kalau beli sedikit saja harga sudah melonjak, berarti aset tidak likuid — hati-hati.",
      "Cut loss bertingkat: SL minus (kurangi rugi), SL plus (amankan cuan), atau exit saat target tercapai.",
    ],
  },
  {
    id: "beda-pair-usdt-busd-usdc",
    topic: "basics",
    title: "Beda pair (USDT/BUSD/USDC) & kenapa harga beda tiap tempat",
    videoTitle: "Bedanya BTC/USDT, BTC/BUSD, BTC/USDC?",
    videoId: "7a3hgLxvM3Y",
    thesis:
      "BTC/USDT hanyalah 'pair' — aset di depan yang kamu miliki, di belakang alat konversinya; harga aset sama bisa beda tiap exchange karena source & likuiditas berbeda.",
    points: [
      "Pair = pasangan konversi. Depan (BTC) = barang yang kamu punya; belakang (USDT/BUSD/USDC) = tujuan jual/konversi.",
      "Kalau satu pair di-remove (mis. BTC/BUSD ditutup), asetmu (BTC) tetap aman — cuma hilang satu jalur konversi.",
      "Konversi antar-pair cuma pindah value: USDT jadi 0, value pindah ke BTC — tidak ada 'BTC-USDT' yang beda dari BTC biasa.",
      "Harga aset sama beda tiap tempat karena SOURCE beda (Binance, KuCoin, Coinbase, DEX) — masing-masing punya likuiditas sendiri, tidak sharing.",
      "Likuiditas tiap source beda, jadi harga di exchange kecil lebih mudah digerakkan/di-pump.",
      "Selisih harga antar-exchange = peluang arbitrase (beli murah, jual mahal), tapi transfer lambat bisa bikin harga keburu menyesuaikan.",
      "Di satu platform pun, harga Spot dan Futures bisa beda karena source/likuiditas databasenya beda.",
      "Beda dengan saham Indonesia: semua sekuritas tarik data dari satu source (IDX) → harga sama, tak ada arbitrase.",
    ],
    tips: [
      "Cek pair & source koin lewat CoinMarketCap → tab Markets (daftar pair, source, harga, volume tiap tempat).",
      "Baca cepat: depan pair = barang yang dipegang; belakang pair = mau dijual/konversi ke apa.",
    ],
  },
  {
    id: "memahami-analisa-teknikal",
    topic: "technical",
    title: "Memahami analisa teknikal",
    videoTitle: "Episode 2: Memahami Analisa Teknikal",
    videoId: "DaKZGPfXN1w",
    thesis:
      "Analisa teknikal memakai data harga historis + grafik + pola untuk memperkirakan arah harga; pada dasarnya menghitung probabilitas, bukan ramalan pasti.",
    points: [
      "Analisa teknikal = pakai data historis + chart + pola untuk prediksi arah, mengidentifikasi trend, support, dan resistance.",
      "Trading intinya probabilitas (seperti statistika); grafik cuma mempermudah — hasil tetap dua: naik atau turun.",
      "Setup 90% pun bisa salah karena faktor news/fundamental — makanya disebut probabilitas, bukan kepastian.",
      "3 tampilan chart: Bar (lidi), Candlestick (lilin, paling umum), Line (garis dari harga closing).",
      "Baca candle: hijau = open bawah, close atas; merah = open atas, close bawah. Wick/shadow = harga sempat menyentuh lalu ditarik balik.",
      "Timeframe menentukan lama hold: scalping, intraday, swing (harian/mingguan), atau investor/positioning.",
      "Analisa top-down: mulai timeframe besar untuk arah utama, lalu turun ke kecil untuk cari entry.",
      "Makin banyak indikasi searah (teknikal + fundamental + makro), makin tinggi probabilitas keberhasilan.",
      "Analisa teknikal hanya valid pada aset ber-volume & market cap besar; koin 'micin' dipegang bandar → harga mudah digerakkan → itu lebih ke judi.",
    ],
    tips: [
      "Pakai timeframe minimal 5 menit — di bawah itu terlalu banyak noise.",
      "Timeframe tetap yang dipakai Kevin: Monthly, Weekly, Daily, 4H, 1H, 15m, 5m (tanpa 2H/30m).",
      "Durasi hold per TF: 5m → ~10m-4jam; 1H → ~4-12jam; 4H → ~1-3 hari; Daily → 1-3 minggu; Weekly → ~3 bulan; Monthly → 3 bulan-tahunan.",
      "Pakai TradingView untuk analisa banyak pair & bandingkan source antar-exchange dalam satu tempat.",
    ],
  },
  {
    id: "tutorial-futures-cara-main-dan-tips",
    topic: "futures",
    title: "Tutorial futures: entry, margin & stop loss plus",
    videoTitle: "Tutorial Future Crypto + Tips and Tricks",
    videoId: "ySi3JPmBbK4",
    thesis:
      "Panduan praktis eksekusi futures: isolated vs cross, limit vs market, long vs short, membaca liquidation price, dan mengunci profit dengan stop loss plus sambil jaga risk <5%.",
    points: [
      "Mulai dari trading plan/teknikal: tentukan entry, SL, TP, lalu fokus ke % risk dan nominal rupiah yang rela hilang.",
      "Isolated margin: hanya dana di posisi itu yang bisa habis. Cross margin: rugi memakai seluruh saldo wallet — untuk posisi panjang, margin dijaga ketat.",
      "Order Limit = antri di harga tertentu (long antri di bawah, short antri di atas); Market = eksekusi langsung di harga sekarang.",
      "Long = cuan saat naik; Short = cuan saat turun. P/L selalu dikali leverage (gerak 2,59% x 10 = ~26%).",
      "Makin besar leverage, makin kecil Max Position Value yang boleh dibuka — kalau sudah mentok, tak bisa nambah porsi berapa pun modalmu.",
      "Perhatikan Estimate Liquidation Price: kalau Mark Price menyentuhnya, dana habis total — itulah Liquid/Margin Call.",
      "Kalau semua posisi searah dan market melawan, tak ada yang menahan; risk naik terus mendekati Liquid — batasi jumlah posisi.",
      "Stop Loss Plus: setelah floating profit ~15-20%, geser SL ke area entry → posisi jadi risk-free (modal terlindungi).",
      "Fitur lain: Reverse (balik long↔short tanpa close-entry ulang), Close (buang sebagian %), Close All.",
    ],
    tips: [
      "Jaga risk maksimum ~5% per posisi (di bawah 10% masih ditoleransi, tapi 5% paling aman).",
      "Batasi posisi aktif maksimal 3-4; lebih dari itu sulit dimanage.",
      "Untuk breakout TF besar, biarkan profit lari pakai trailing stop bertahap ketimbang TP terlalu cepat.",
    ],
  },
  {
    id: "risk-management-anti-liquid-margin-call",
    topic: "risk",
    title: "Risk management: anti-Liquid & anti-Margin Call",
    videoTitle: "Trading Future Anti Liquid & Margin Call",
    videoId: "mTgkaa6HRAU",
    thesis:
      "Kena Liquid/MC bukan salah market, tapi gagal atur risiko. Dengan membatasi risk per posisi, RR minimal 1:2, dan menghitung leverage dari batas rugi, kamu tetap cuan meski winrate cuma 40%.",
    points: [
      "Liquid & Margin Call itu 'stop loss yang salah' — akibat tak me-manage risiko, bukan kesalahan market.",
      "Selalu pakai risk/reward minimal 1:2 (SL -1% → TP +2%); hindari 1:1 karena berat balik modal saat rugi beruntun.",
      "Dengan RR 1:2, cuan meski winrate 40%: dari 5 posisi, 2 win (+4) & 3 loss (-3) = tetap +1.",
      "Winrate bukan segalanya — yang penting hasil akhir cuan; winrate 80% itu sudah sangat bagus.",
      "Kalau mau main lebih besar, yang dibesarkan MODAL, bukan % risk. Membesarkan risk memaksamu menahan posisi saat harga melawan.",
      "Futures bukan tempat top-up: Liquid/MC adalah stop loss-mu, bukan 'habis lalu isi lagi' — itu mental judi.",
      "Jangan menahan posisi rugi (contoh: long BTC 125x lalu hold sampai rugi dari 5 juta membengkak jadi 100 juta+).",
      "Orang kaya makin kaya karena menghitung risiko dulu, bukan cuma potensi cuan; konsep ini juga berlaku di spot/saham/forex.",
    ],
    tips: [
      "Batas risk per posisi maksimum 5% dari modal (Cross); jadi maksimal 5 posisi @1% aktif bersamaan.",
      "Aturan cut loss Kevin: begitu ROE -50% dari margin posisi, pasti cut loss.",
      "Rumus leverage dari batas rugi (target CL -50%): SL -1% → leverage maks 50x; -2% → 25x; -5% → 10x; -10% → 5x (% SL × leverage = 50%).",
      "Mau posisi lebih besar: gedein modal/margin, pertahankan risk tetap ~5%.",
    ],
  },
  {
    id: "take-profit-di-euforia",
    topic: "risk",
    title: "Kurangi portofolio saat market euforia (reduce 90%)",
    videoTitle: "Bitcoin Update: Why I Reduce My Portfolio by 90%",
    videoId: "Jx5dZozKXuo",
    thesis:
      "Ambil profit saat market hijau pekat & orang serakah, bukan saat takut. Makin market naik, makin kurangi posisi — tujuan utama bertahan hidup lama, bukan menang paling cepat.",
    points: [
      "Kontrarian: serakah saat orang takut, takut saat orang serakah. Exit saat naik, akumulasi saat koreksi/deep.",
      "Take profit atas yang sudah di depan mata, bukan mengejar 5-10% terakhir menuju target yang belum pasti.",
      "Saat target teknikal utama tercapai, anggap selesai — kelebihan di atasnya adalah bonus, jangan FOMO.",
      "Makin besar market cap, makin berat & lambat naiknya (makin mature) — jangan berharap kenaikan mudah seperti saat cap kecil.",
      "'Orang kaya baru datang dari deep market, bukan dari top market' — beli saat diskon/koreksi, bukan saat hype naik.",
      "Kalau tak punya trading plan hari itu, artinya lagi takut/tak lihat peluang bagus — dan tidak entry juga bagian dari plan. '90% trading adalah seni menunggu.'",
      "Jaga posisi kontra-tren sangat kecil (mis. short saat bull cuma 0,1-0,3% modal) supaya kalau salah tak fatal.",
      "Lebih baik tak cuan (modal utuh) daripada rugi habis; perlakukan uang berharga SEBELUM kehilangan.",
    ],
    tips: [
      "Analogi 'jangan cuci piring': kalau sudah kenyang (cuan), jangan overeat sampai muntah (balik rugi).",
      "Pakai SL-plus: begitu floating profit, geser stop loss ke titik entry supaya minimal tidak rugi.",
    ],
  },
  {
    id: "average-down-minus-50",
    topic: "psychology",
    title: "Average down saat aset minus 50%+",
    videoTitle: "Portfolio -50%++ What Should I Do?",
    videoId: "iRvVr0gpudA",
    thesis:
      "Kalau aset (yang fundamentalnya kamu yakini) sudah turun 50%+, jangan diam — cicil beli lagi, karena makin dalam minus makin berat balik modal, sementara nilai uang digerus inflasi.",
    points: [
      "Average down hanya untuk aset berfundamental bagus yang layak di-hold jangka panjang (2-5 tahun), bukan asal koin.",
      "Matematika pemulihan tidak simetris: turun 50% butuh +100% untuk balik modal; turun 60% butuh +150%; turun 70% ~+230%.",
      "Average down tak harus 1:1 dengan modal awal — nambah 5% saja sudah bagus, 10% lebih bagus.",
      "Contoh: modal 100 turun ke 50, tambah 5 → total keluar 105. Saat balik modal jadi 110 — profit, bukan sekadar impas.",
      "Profit kecil dari nyicil tetap lebih baik daripada tidak masuk sama sekali.",
      "Tujuan inti investasi = mengalahkan inflasi; $100 hari ini tidak sama nilainya dengan $100 beberapa tahun lagi.",
      "Sumber dana averaging bisa dari pengeluaran gaya hidup (puasa jajan/kopi sebulan, dialihkan untuk cicil aset).",
    ],
    tips: [
      "Rumus recovery: kenaikan dibutuhkan = 1/(1 − %turun) − 1. Minus 50% → +100%; minus 90% → +900%.",
      "Averaging bertahap 5-10% dari modal awal tiap kali, tak perlu langsung besar.",
    ],
  },
  {
    id: "manta-kapan-cut-loss",
    topic: "psychology",
    title: "Kapan harus cut loss (cintai cuan, bukan koin)",
    videoTitle: "Manta Coin Surgery — From 100% Profit to 90% Loss",
    videoId: "anZBE58l1sY",
    thesis:
      "Sebelum entry, TP & SL wajib sudah ada. Kalau struktur major support & koreksi sehat sudah rusak, itu sinyal keluar — jangan jatuh cinta pada koinnya, cintai cuannya.",
    points: [
      "Tentukan TP dari area supply/resistance historis di kiri chart; Fibonacci ekstensi ~1.618 & ~2.618 sering jadi TP1 & TP2.",
      "Wajib tahu exit sebelum entry: tetapkan SL & position sizing dari risiko yang sanggup ditanggung (rela rugi 10% = Rp1jt → modal maks Rp10jt).",
      "Koreksi sehat: selama harga di atas Golden Ratio 0.618 retracement, masih sehat. Jebol 0.618 & gagal balik = koreksi tidak sehat.",
      "Major support (penopang uptrend) yang jebol = alert serius; kalau tak mampu retrace naik, waktunya keluar.",
      "Downtrend dikenali dari lower high–lower low; tiap retrace naik justru kesempatan buang barang, bukan tanda pemulihan.",
      "Jangan jual saat harga sedang jatuh — tunggu pullback naik dulu, baru lepas di situ (harga lebih baik).",
      "Waspada stop hunt / liquidity grab: harga sengaja jebol support sedikit untuk memancing cut loss, lalu balik — buang di retrace, bukan panik di bawah.",
      "'Jangan cintai koinnya, cintai cuannya' — kalau ladang tak memberi cuan, pivot ke koin yang flow/sentimennya jalan.",
    ],
    tips: [
      "Beri ~3-4 kali kesempatan retrace sebagai titik exit; tiap gagal balik ke zona sehat = konfirmasi tambahan keluar.",
      "Di futures, minus dikali leverage (−10% × 50 = −500%), jadi SL-plus makin krusial.",
    ],
  },
  {
    id: "trb-anatomi-pump-dump",
    topic: "manipulation",
    title: "Anatomi pump & dump TRB: cap ringan + liquidation cascade",
    videoTitle: "Study Case: Kenapa Tellor TRB Pump $600 & Dump $130",
    videoId: "wdFKHCFjw_M",
    thesis:
      "TRB pump ekstrem ke $600 karena market cap kecil (ringan diangkat) & dimainkan market maker (DWF Labs), lalu dump semalam lewat efek berantai likuidasi — bukan sekadar satu pihak 'buang barang'.",
    points: [
      "Market cap kecil = mudah di-pump: cap TRB ~$30-40jt lalu naik ~10x ke ~$450jt. Makin kecil cap, makin sedikit modal untuk menggerakkan.",
      "Selalu cek siapa di balik koin: TRB digerakkan market maker DWF Labs. Tahu polanya membantu memprediksi cara mereka pump & buang barang.",
      "Dump bukan satu tombol jual, tapi liquidation cascade: short tertahan kena likuidasi (buy paksa saat naik), lalu saat turun SL beruntun ter-trigger → jual → makin jatuh → memicu likuidasi berikutnya.",
      "Yang short di jalur naik biasanya gagal berkali-kali dulu sebelum harga runtuh — menemukan 'top' persis sangat sulit.",
      "Salah baca on-chain: label 'Binance yang dump' menyesatkan. Wallet memang Binance, tapi karena banyak user withdraw/realisasi profit — exchange harus menjual/memindahkan token.",
      "Selama dana berputar di dalam satu exchange, token tetap di hot wallet-nya; baru 'keluar' saat user withdraw — mirip bank run.",
      "Setelah pump liar pasti ada koreksi sehat; TRB level sehatnya sekitar Fibo $145, bahkan bisa ke $125.",
      "Koin yang hype-nya sudah habis (Doge, Shiba, Luna, BTT dulu) jangan diharap balik ke puncak — move on cari yang hype-nya belum keluar.",
    ],
    tips: [
      "Sebelum ikut pump, hitung: berapa modal untuk menggerakkan cap sekarang, dan siapa market maker-nya.",
      "Untuk koin yang sudah dump besar, tunggu stabil di area koreksi sehat (Fibo) baru cicil kecil.",
    ],
  },
  {
    id: "nfprompt-valuasi-market-cap",
    topic: "valuation",
    title: "Valuasi berbasis market cap komparatif (NFPROMPT)",
    videoTitle: "Price Calculation NFPROMPT (koin AI DWF Labs)",
    videoId: "bf6pBK_9o7U",
    thesis:
      "Target harga koin dihitung dari market cap ÷ supply, bukan dari 'harga per koin'. Sinyal utama Kevin bukan fundamental, tapi siapa market maker di baliknya (dilacak on-chain).",
    points: [
      "Rumus dasar: harga target = market cap target ÷ circulating supply.",
      "Data NFP: harga ~$0,65, market cap ~$163jt, supply beredar ~250jt koin (~25%). Semua skenario diturunkan dari sini.",
      "Skenario komparatif: ke $1 = cap ~$250jt (+90%, 'sangat easy'); $2 = ~$500jt; $4 = ~$1M; $5 = ~$1,2M.",
      "Realistis & konservatif: target utama $1 (cukup), $2 bonus; jangan langsung samakan dengan TRB yang sempat cap $1,2M.",
      "Fundamental NFP dinilai standar (koin AI, aplikasinya masih kurang) tapi cukup karena sudah listing Binance — fundamental bukan alasan utama.",
      "Alasan utama masuk = ketahuan dimainkan DWF Labs lewat riset on-chain (transfer ~8jt NFP ke wallet DWF sebelum muncul di porto publik).",
      "Market cap masih kecil = volatilitas tinggi = potensi pump lebih besar dengan modal market maker yang tidak terlalu besar.",
      "Disiplin target: kelebihan di atas target selalu diperlakukan sebagai bonus, bukan ekspektasi.",
    ],
    tips: [
      "Langkah valuasi: (1) catat market cap & supply, (2) tentukan cap target realistis dari koin sejenis, (3) bagi dengan supply → harga, (4) verifikasi market maker via on-chain.",
      "Untuk koin market-maker-driven: kalau gerak mendadak/tak sehat, keluar lebih dulu saat dip.",
    ],
  },
  {
    id: "valuasi-rwa-market-cap-comparable",
    topic: "valuation",
    title: "Menaksir upside proyek lewat perbandingan market cap",
    videoTitle: "Top RWA Project + Hitung Valuasi Kasar",
    videoId: "ea0vC8P2tT4",
    thesis:
      "Untuk memperkirakan potensi kenaikan sebuah koin, bandingkan market cap-nya dengan koin sejenis yang lebih besar; makin kecil cap relatif terhadap acuan, makin ringan naik berkali lipat.",
    points: [
      "Nilai koin dari market cap, bukan harga per-koin. Cap yang sudah 'gendut' berat naik 2x; cap kecil jauh lebih ringan naik ratusan persen.",
      "Hitung kasar: ambil koin acuan yang lebih besar, tanya 'untuk menyamai level itu, koin ini perlu naik berapa %?'.",
      "Buat tier list (S/A/B/C) per sektor (RWA, gaming, AI) untuk memetakan koin berdasar risiko & upside, bukan suka-tidak-suka.",
      "Tier S = big cap, stabil, cocok konservatif tapi upside terbatas. Tier A = cap medium ke bawah, volatil, tapi risk/reward paling menarik untuk agresif.",
      "Sentimen ganda menaikkan daya tarik: koin yang kena dua narasi sekaligus (mis. RWA + AI) bisa dinaikkan tier-nya.",
      "Jujur pada batas pengetahuan: koin yang fundamentalnya tak dipahami sebaiknya di-skip.",
      "Koin yang menyimpan uang riil (DeFi/lending) → tambahkan diskon risiko karena lebih sensitif kalau ada masalah dana.",
      "Cek teknikal cepat sebelum masuk: support kunci & struktur tren, supaya tak beli koin bagus yang mau breakdown.",
    ],
    tips: [
      "Upside kasar: (cap koin acuan ÷ cap koin target) → perkiraan kelipatan sebelum 'menyusul' acuan.",
      "Big cap: target realistis ~2x. Small/mid cap dengan sentimen kuat: potensi ratusan persen.",
    ],
  },
  {
    id: "menabung-btc-jelang-halving-teknikal",
    topic: "accumulation",
    title: "Cicil BTC jelang halving berbasis level teknikal",
    videoTitle: "Strategi Menabung Bitcoin Menjelang Halving 2024",
    videoId: "ZSfoZp_lTZo",
    thesis:
      "Menabung BTC jelang halving dilakukan bertahap (DCA) pada level teknikal yang ditentukan lebih dulu, dengan alokasi % berbeda per skenario, plus exit rule kalau struktur tren jangka panjang patah.",
    points: [
      "Tetapkan area cicil DULU sebelum harga sampai, supaya beli terprogram bukan emosi. Anggap total modal 100% lalu bagi ke beberapa termin.",
      "Termin pertama: beli di zona support tren jangka panjang (bulanan), alokasi kecil dulu ~10-20%.",
      "Termin terbesar justru saat konfirmasi kekuatan: alokasi paling besar (~30%) saat breakout resistance mingguan/bulanan yang lama menahan.",
      "'Beli breakout': berapa pun harganya, kalau closing breakout weekly (apalagi dikonfirmasi monthly), itu sinyal menambah.",
      "Selalu punya EXIT rule: kalau support kunci jebol secara closing bulanan, buang minimal ~50% karena target turun berlanjut.",
      "Bedakan koreksi sehat vs patah tren: dip/retest di dalam pola = peluang nambah; jebol support multi-tahun = tren bullish batal → jual.",
      "Kelola risiko platform: kalau exchange top-1 kolaps, dampaknya ke SELURUH market termasuk BTC — siap buang mayoritas aset ke stablecoin.",
      "Kita tak pernah tahu bottom/top persis; andalkan konfirmasi teknikal bertahap, bukan menebak titik balik.",
    ],
    tips: [
      "Contoh alokasi: ~10-20% di support bulanan, ~30% saat breakout resistance utama, ~20% saat breakout lanjutan.",
      "Exit: closing bulanan di bawah support tren multi-tahun → jual ≥50%, sisakan modal untuk cicil ulang lebih bawah.",
    ],
  },
  {
    id: "cicil-btc-part2-konfluensi-fibonacci-pola",
    topic: "accumulation",
    title: "Cicil BTC Part 2: konfluensi support, Fibonacci & pola",
    videoTitle: "Strategi Cicil BTC Sebelum Halving Part 2 (dgn Analisa Teknikal)",
    videoId: "Pjs2K4GTwmU",
    thesis:
      "Perbarui rencana cicil saat harga sudah bergerak: cari area beli di titik konfluensi (support tren + Fibonacci + pola), dan tetap pegang aturan buang jika level invalidasi tembus.",
    points: [
      "Reset analisa saat harga berubah signifikan: gambar ulang support/resistance dari nol supaya level tetap relevan.",
      "Area beli terkuat = konfluensi beberapa alat: support tren bulanan + Fibonacci 0.618 (golden ratio) weekly + target pola menunjuk zona yang sama.",
      "Cicil di dalam pola koreksi (mis. wedge): beli bertahap di dalam rentang pola, bukan sekaligus.",
      "Beli di zona, bukan satu harga: tentukan rentang lalu sebar pembelian di sepanjangnya.",
      "Punya level invalidasi jelas: breakdown di bawah support pola/tren (closing weekly) → buang, tapi jual saat pullback naik (retest), bukan panic sell di terendah.",
      "Buy on breakout bersyarat: closing weekly di atas resistance → boleh tambah; tapi kalau harga balik ke bawah level itu (false breakout) → langsung buang.",
      "Rantai target turun bertingkat sebagai peta risiko: jebol support 1 → target support 2 → dst. Tahu di mana keluar tiap tingkat sebelum masuk.",
      "Jangan memaksakan sinyal: kalau syarat area belum terpenuhi, tidak ada transaksi — tunggu.",
    ],
    tips: [
      "Konfluensi minimal 2 alat sebelum sebut 'best buy area': support trendline + Fib 0.618 weekly.",
      "False breakout rule: harga kembali ke bawah level breakout → keluar segera.",
    ],
  },
  {
    id: "narasi-pump-rotasi-likuiditas-smallcap",
    topic: "narrative",
    title: "Kenapa small cap pump ratusan % saat volume sepi",
    videoTitle: "Kenapa Banyak Crypto Pump Ratusan Persen (Q4 2023)",
    videoId: "5UOEcgB8e8o",
    thesis:
      "Saat volume market total rendah, uang bandar tak cukup untuk menggerakkan big cap, sehingga rotasi ke altcoin cap kecil yang punya katalis — itulah pemicu pump ratusan persen.",
    points: [
      "Baca volume exchange sebagai indikator likuiditas: kalau volume anjlok (mis. ke ~20-25% dari rata-rata), artinya uang beredar sedikit.",
      "Dengan likuiditas kecil, menggerakkan koin top-10 butuh modal sangat besar yang tak tersedia — jadi big cap 'diam'.",
      "Bandar tetap butuh cuan; karena tak sanggup gerakkan big cap, mereka pindah ke koin cap kecil yang 'ringan' digerakkan.",
      "Pump berkelanjutan bukan pump kosong: koin yang naik biasanya punya katalis nyata (investasi market maker, kemitraan, sentimen fundamental).",
      "Lacak jejak market maker: kalau satu entitas menaruh uang ke banyak koin kecil, koin-koin di portofolionya berpeluang jadi kandidat pump berikutnya.",
      "Pahami rotasi money flow: BTC → ETH → large cap → ke bawah; tapi jika large cap tak bergerak (likuiditas tipis), aliran 'loncat' ke small cap berkatalis.",
      "Filter kandidat: market cap kecil (mudah digerakkan) DIKALIKAN ada sentimen/katalis — dua syarat bersamaan, bukan salah satu.",
      "Sadari sifat sementara: begitu koin sudah naik banyak & cap membengkak, kenaikan lanjutan makin berat — jangan kejar di pucuk.",
    ],
    tips: [
      "Indikator: volume exchange top-1 turun drastis → sinyal musim rotasi ke small cap.",
      "Screening: market cap kecil (mis. < ~$100jt) + ada katalis investasi/berita = kandidat pump.",
      "Cek portofolio market maker besar untuk mengantisipasi koin yang 'giliran' berikutnya.",
    ],
  },
];

export function kjLessonsByTopic(): { topic: KJTopic; label: string; emoji: string; lessons: KJLesson[] }[] {
  return KJ_TOPICS.map((t) => ({
    topic: t.key,
    label: t.label,
    emoji: t.emoji,
    lessons: KJ_LESSONS.filter((l) => l.topic === t.key),
  })).filter((g) => g.lessons.length > 0);
}
