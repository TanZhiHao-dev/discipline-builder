// ICDT "Market Maker Logic" SOP — distilled reference playbook.
// Synthesised from the full ICDT course (David Dharmawan, Pertemuan 1–12 + bonus).
// This is quick-reference material embedded in the app so the SOP is one click
// away while journaling. Ordered bottom-up along the course pyramid.

export type PlaybookBlock = { h: string; items: string[] };

export type PlaybookPillar = {
  id: string;
  layer: number; // 1 = fondasi … 6 = puncak; 0 = pendukung (mental/modal/evaluasi)
  kicker: string; // short role tag
  title: string;
  source: string; // which meeting(s)
  summary: string;
  blocks: PlaybookBlock[];
};

export const PYRAMID: { id: string; label: string }[] = [
  { id: "entry", label: "Entry" },
  { id: "pd-array", label: "PD Array (POI)" },
  { id: "quarterly", label: "Quarterly Theory / Waktu" },
  { id: "ams", label: "Advanced Market Structure" },
  { id: "daily-bias", label: "Daily Bias" },
  { id: "tda", label: "Top Down Analysis" },
];

export const PILLARS: PlaybookPillar[] = [
  {
    id: "order-flow",
    layer: 1,
    kicker: "Fondasi",
    title: "Order Flow — Kenapa Market Bergerak",
    source: "Pertemuan 1 & 2",
    summary:
      "Market bergerak HANYA karena dua alasan: mengambil liquidity & mengisi imbalance (FVG). Semua yang lain (S&R, Supply/Demand, News) bukan penggerak.",
    blocks: [
      {
        h: "Dua alasan market bergerak",
        items: [
          "Mengambil Liquidity = area menumpuknya stop-loss mayoritas trader.",
          "Mengisi Imbalance (FVG) = mengisi gap yang ditinggalkan gerakan impulsif.",
          "Retail rugi karena berenang MELAWAN arah market maker (ikan besar).",
        ],
      },
      {
        h: "Jenis Liquidity",
        items: [
          "Old High / Old Low — tiap swing high/low; uptrend → Old High jadi target.",
          "Relative Equal High/Low (= Double Top/Bottom) — SL menumpuk rapi → jebakan 'buy kena, sell kena'.",
        ],
      },
      {
        h: "4 Kunci Order Flow",
        items: [
          "#1 Pergantian agenda sah setelah swing high/low terbentuk di Weekly.",
          "#2 FVG yang berdekatan dengan low/high yang di-break = FVG kuat / high-probability.",
          "#3 Kalau tak ada FVG untuk diisi, MM ambil liquidity berlawanan dulu.",
          "#4 Volume Imbalance > FVG biasa.",
        ],
      },
      {
        h: "Cara tahu order flow BERUBAH",
        items: [
          "Break swing high saja belum cukup (bisa stop hunt).",
          "Hit FVG lalu break bawah lagi → FVG gagal → cuma stop hunt.",
          "Hit FVG lalu tembus naik → FIX, order flow berubah.",
          "Swing valid = lebih tinggi/rendah dari kiri-kanan + dikonfirmasi candle searah.",
        ],
      },
    ],
  },
  {
    id: "tda",
    layer: 2,
    kicker: "Analisa",
    title: "Top Down Analysis & Daily Bias",
    source: "Pertemuan 9",
    summary:
      "Narasi dijahit dari timeframe paling besar ke timeframe entry. TDA otomatis membentuk Daily Bias yang WAJIB punya target (liquidity).",
    blocks: [
      {
        h: "Urutan timeframe",
        items: [
          "Monthly → Weekly → Daily → H1 → M15 → entry M5/M3.",
          "Semua TF jadi SATU narasi utuh, tidak boleh dipotong.",
          "Prinsip Fractal: yang terjadi di TF besar terjadi juga di TF kecil.",
        ],
      },
      {
        h: "2 kesalahan trader",
        items: [
          "Tak melakukan TDA → jadi pattern trader (tiap FVG langsung entry).",
          "TDA kurang big-picture (kira Daily/H4 sudah 'besar', padahal Monthly paling besar).",
        ],
      },
      {
        h: "Daily Bias",
        items: [
          "DB WAJIB punya target — tanpa target = 'bias kosong / semu'.",
          "Target = liquidity. Bedakan candle real vs candle manipulasi.",
          "Bias = kecenderungan (>50% high-probability), bukan 100%.",
          "Dua Tujuan: (1) Liquidity, (2) Imbalance/FVG ('isi bensin' — retrace isi imbalance ≠ ganti trend).",
        ],
      },
      {
        h: "Order flow = aturan paling strict",
        items: [
          "Jangan lawan order flow. 'Kita nggak pernah tahu order flow sampai mana.'",
          "Loss besar datang dari ego (tak akui salah, tak pakai SL) + lawan order flow.",
        ],
      },
    ],
  },
  {
    id: "ams",
    layer: 3,
    kicker: "Struktur",
    title: "Advanced Market Structure (AMS)",
    source: "Pertemuan 6",
    summary:
      "Market tidak serapi buku. Tiap struktur punya PERAN berbeda: Long Term (target & invalidation), Short Term (jadi liquidity), Intermediary (baca order flow harian).",
    blocks: [
      {
        h: "Tiga jenis struktur",
        items: [
          "Long Term (LTH & LTL) — dilihat sekali. LTH = Target Liquidity, LTL = Invalidation Point.",
          "Short Term (STH & STL) — di 1H, fungsinya HANYA jadi liquidity/di-sweep. Jangan jadi patokan.",
          "Intermediary (ITH & ITL) — paling penting untuk analisa harian.",
        ],
      },
      {
        h: "Definisi ITH / ITL",
        items: [
          "ITH = STH lebih tinggi dari STH kiri & STL kanan, + STH kanan break ke bawah.",
          "ITL = STL lebih rendah dari STL kiri & kanan, + STL kanan break ke atas.",
        ],
      },
      {
        h: "Aturan order flow via Intermediary",
        items: [
          "ITH masih hold → bearish. ITL muncul → bullish.",
          "ITH & ITL TIDAK boleh di-break. Kalau di-break → agenda berganti.",
          "STL pasti di-sweep; selama ITL belum di-break, struktur masih bullish.",
          "Fokus sesuai order flow: bullish → fokus ITL; bearish → fokus ITH.",
        ],
      },
    ],
  },
  {
    id: "quarterly",
    layer: 4,
    kicker: "Waktu",
    title: "Quarterly Theory + AMD / Midnight Open / DXY",
    source: "Pertemuan 8 & 10",
    summary:
      "'Time is more important than price.' Waktu (sesi) menentukan valid/palsunya gerakan. Pasar bergerak dalam siklus AMD, dipetakan ke quarter.",
    blocks: [
      {
        h: "AMD (Accumulation–Manipulation–Distribution)",
        items: [
          "A = kumpulkan liquidity, M = ambil liquidity via stop hunt, D = lanjut ke target.",
          "Sesi (NY time): Asia = Akumulasi, London = Manipulasi, New York = Distribusi.",
          "Golden Rule London: hari bullish → low of the day di London; bearish → high of the day di London.",
          "No-trade: Heavy Accumulation Day (news besar) & Heavy Expanding Day.",
        ],
      },
      {
        h: "Midnight Open (MO) & DXY",
        items: [
          "MO = open candle jam 00:00 (NY). Di bawah MO = Discount, di atas = Premium.",
          "DXY: 'Wherever the dollar goes, the rest follows.' SELALU analisa DXY dulu.",
          "Inverted (GBPUSD, XAUUSD) vs Positive correlation (USDJPY).",
        ],
      },
      {
        h: "Quarterly Theory",
        items: [
          "Waktu dibagi 4 quarter dengan 4 peran, fraktal: Yearly → Monthly → Weekly → Session.",
          "Peran = AMDX atau XAMD. A/M/D + X-Phase (Continuation/Reversal). Hanya 2 urutan ini.",
          "Q1 = kunci. Cek FVG: ada FVG → Q1=X (XAMD); tak ada → Q1=A (AMDX).",
          "Fase termudah entry = Q3 (Distribusi). Meat of the move di Q2–Q3.",
        ],
      },
    ],
  },
  {
    id: "pd-array",
    layer: 5,
    kicker: "Zona (POI)",
    title: "PD Array — Premium & Discount",
    source: "Pertemuan 3 & 4",
    summary:
      "Aturan emas: Buy di Discount, Sell di Premium (equilibrium = Fibonacci 0.5). 6 komponen PD Array jadi Point of Interest (POI).",
    blocks: [
      {
        h: "Premium / Discount",
        items: [
          "Tarik Fibonacci dari awal impulsive move terakhir → 0.5 = equilibrium.",
          "Di atas 0.5 = Premium (jual), di bawah = Discount (beli).",
          "Retail justru kebalikannya (buy on breakout = beli mahal) → jarang profit.",
          "Forex = Mean Reversion Game (trading); US Index = Compounding (invest).",
        ],
      },
      {
        h: "6 komponen PD Array",
        items: [
          "FVG (Fair Value Gap) — BISI (buy) & SIBI (sell).",
          "IFVG (Inverted FVG) — FVG gagal/ditembus lalu berbalik fungsi.",
          "Order Block (OB) = REVERSAL — pergerakan berlawanan terakhir (ambil seluruh swing, bukan pucuk).",
          "Breaker Block (BB) = CONTINUATION — retracement terakhir sebelum lanjut.",
          "BPR (Balanced Price Range) — FVG langsung dibalas FVG berlawanan; paling powerful.",
          "Stop Hunt — level liquidity di-sweep dulu.",
        ],
      },
      {
        h: "Konfluensi & pembeda",
        items: [
          "Trade idea didukung 2+ PD Array = high-probability.",
          "Gold Combination = Breaker Block + FVG.",
          "Stop Hunt vs Order Block dibedakan oleh INTENTION (apakah liquidity tujuan sudah dicapai).",
        ],
      },
    ],
  },
  {
    id: "entry",
    layer: 6,
    kicker: "Eksekusi",
    title: "Entry",
    source: "Pertemuan 11",
    summary:
      "Puncak piramida & bagian paling gampang — kalau fondasi kokoh, cara entry apapun tetap tajam. Entry jarang tapi presisi karena sabar.",
    blocks: [
      {
        h: "Jenis order",
        items: [
          "Limit (nunggu retrace): Buy/Sell Limit. Stop (setelah break): Buy/Sell Stop. Market execution.",
          "Risk entry (entry di POI langsung) vs Confirmation entry (tunggu swing break dulu).",
        ],
      },
      {
        h: "Position sizing",
        items: [
          "Lot = ($ yang dirisikokan) ÷ (poin SL). Lot BEDA tiap trade.",
          "Aturan kaku '$10.000 = 1 lot' itu SALAH.",
        ],
      },
      {
        h: "Urutan menggabungkan SOP",
        items: [
          "Order flow/TDA → AMS → QT → PD array (POI kuat: FVG + breaker block di diskon) → tunggu semua line up.",
          "Trigger: tunggu swing high di-break dulu (buy stop). RR 1:3.",
          "Set & Forget — jangan geser SL (trailing manual merusak ekspektansi).",
          "Kalau harga tak sentuh POI → no trade.",
        ],
      },
    ],
  },
  {
    id: "psychology",
    layer: 0,
    kicker: "Mental (Semen)",
    title: "Psikologi Trading",
    source: "Pertemuan 7",
    summary:
      "Psikologi = 'semen' yang mengikat seluruh piramida. Emosi positif (cockiness) justru paling berbahaya.",
    blocks: [
      {
        h: "Dua kelompok emosi",
        items: [
          "Negatif: Fear → Frustration → Anger → Depression → Stress ('Circle of doom').",
          "Positif (paling bahaya): Excitement, Joy, Cockiness → remehkan risiko.",
          "Trader matang = grafik emosi almost neutral (aware + terkontrol).",
        ],
      },
      {
        h: "Metode kunci",
        items: [
          "Probability mindset (SOP diikuti) > Outcome mindset (fokus hasil per-trade).",
          "Maks 2 trade/hari. Jadi Sniper, bukan Machine Gunner.",
          "'Not every day is a trading day.' Terima loss sebagai bagian trading.",
          "Judge performa di AKHIR BULAN, bukan per-trade.",
        ],
      },
      {
        h: "Self-development",
        items: [
          "Buku wajib: Trading in the Zone. Inchworm: perbaiki C-game (terjelek) dulu.",
          "'Trading for living, bukan living to trade.' Input determines output.",
        ],
      },
    ],
  },
  {
    id: "prop-firm",
    layer: 0,
    kicker: "Modal",
    title: "Blueprint Prop Firm",
    source: "Pertemuan 5",
    summary:
      "Cara lolos & bertahan di funded account. Yang membunuh akun = drawdown (over-trading), bukan aturan news.",
    blocks: [
      {
        h: "Aturan & risk",
        items: [
          "Fase 1 target 8%, Fase 2 target 5%, split 80/20. Rekomendasi: The5ers.",
          "Max drawdown 10% & daily drawdown 5% → akun hangus.",
          "Evaluasi: 0,5%/trade (20 'peluru'). Live: 0,25%/trade (40 peluru). Target 5%/bulan.",
        ],
      },
      {
        h: "Prinsip",
        items: [
          "Jalankan prop firm DAN akun personal bersamaan (personal 100% milikmu).",
          "Dapat live account → amankan biaya pendaftaran + profit awal dulu, baru lanjut.",
          "'Slow and steady wins the race — maraton bukan sprint.'",
        ],
      },
    ],
  },
  {
    id: "backtest",
    layer: 0,
    kicker: "Evaluasi",
    title: "Backtesting & Journaling",
    source: "Pertemuan 12",
    summary:
      "Backtest = kumpulkan data profitabilitas SOP. Journaling = catat apa yang dipikirkan saat lihat chart (bukan pembukuan SL/TP).",
    blocks: [
      {
        h: "Backtesting",
        items: [
          "4 metrik wajib: win rate, risk-to-reward, consecutive wins, consecutive loss.",
          "Sizing dari consecutive loss: pernah 8x loss beruntun → risk aman 0,5%.",
          "Review: temukan winning patterns & buang losing patterns.",
          "Harus JUJUR. Backtest TIDAK melatih patience (di TradingView tinggal next-next).",
        ],
      },
      {
        h: "Journaling",
        items: [
          "Catat pikiran saat lihat chart di jam tertentu — bikin sadar pola psikologis.",
          "'Loss is a business expense.' 'Patience pays by avoiding a bad trade.'",
          "Siap full-time = dobel income pekerjaan selama 3 bulan berturut-turut.",
        ],
      },
    ],
  },
];

// Per-step reminders for the SOP logger — "apa yang harus dicari" di tiap
// langkah piramida, disarikan dari Kitab. Keyed by the logger's step number.
export const SOP_REMINDERS: Record<number, string[]> = {
  // 1 — Top Down Analysis (termasuk fondasi Order Flow)
  1: [
    "Mulai Monthly → Weekly → Daily. Jahit jadi SATU narasi, jangan dipotong per-TF.",
    "Baca order flow: market lagi ambil liquidity (Old High/Low) atau isi imbalance (FVG)?",
    "Sudah terbentuk swing high/low di Weekly? (Kunci #1 — konfirmasi agenda).",
    "Jangan anggap Daily/H4 sudah 'besar' — Monthly yang paling besar.",
  ],
  // 2 — Daily Bias
  2: [
    "Bias WAJIB punya TARGET. Tanpa target = bias kosong / semu.",
    "Target = liquidity mana yang paling jelas/terdekat di TF besar?",
    "Bedakan candle real vs candle manipulasi saat menarik target.",
    "Bias = kecenderungan (>50% high-probability), bukan 100%.",
  ],
  // 3 — Advanced Market Structure
  3: [
    "Tandai LTH/LTL (target & invalidation), STH/STL (liquidity), ITH/ITL (baca order flow).",
    "ITL in control → bullish. ITH in control → bearish.",
    "ITH/ITL di-break? → agenda berganti. STL di-sweep itu wajar, jangan panik.",
    "Fokus sesuai order flow: bullish → fokus ITL; bearish → fokus ITH.",
  ],
  // 4 — Quarterly Theory
  4: [
    "Set jam chart ke New York time. Di quarter mana sekarang (Yearly/Monthly/Weekly/Session)?",
    "Q1 ada FVG? → Q1=X (XAMD). Tak ada → Q1=A (AMDX).",
    "Sesi: Asia = Akumulasi, London = Manipulasi, New York = Distribusi.",
    "Incar fase Distribusi (Q3). Hindari heavy accumulation / heavy expanding day.",
    "Cek Midnight Open (di bawah MO = discount) & analisa DXY dulu.",
  ],
  // 5 — PD Array
  5: [
    "Tarik Fibonacci dari impulsive move TERAKHIR → 0.5 = equilibrium.",
    "Buy di Discount (<0.5), Sell di Premium (>0.5).",
    "Pilih POI: FVG (BISI=buy / SIBI=sell), OB (reversal), BB (continuation), BPR, Stop Hunt.",
    "FVG yang di sebelah high/low yang di-break = paling kuat.",
    "Konfluensi 2+ PD array = high-probability. Gold Combination = BB + FVG.",
  ],
  // 6 — Entry
  6: [
    "Semua sudah line up (TDA + DB + AMS + QT + PD array)? Kalau harga tak sentuh POI → NO TRADE.",
    "Tunggu swing high/low di-break dulu (confirmation entry) — atau risk entry di POI.",
    "Lot = $ risiko ÷ poin SL. Lot beda tiap trade. RR minimal 1:2–1:3.",
    "Risk 0,5% (evaluasi prop firm) / 0,25% (live account).",
  ],
  // 7 — Set & Forget / Journaling
  7: [
    "JANGAN geser SL (trailing manual merusak ekspektansi jangka panjang).",
    "Anggap trade ini bakal loss — kalau profit itu bonus.",
    "Catat APA yang dipikirkan saat entry (journaling, bukan pembukuan SL/TP).",
    "Judge performa di AKHIR BULAN, bukan per-trade.",
  ],
};

export const WISDOM: string[] = [
  "Entry itu bagian paling gampang & tidak signifikan. Fondasi + psikologi yang menentukan.",
  "Belajar logika, bukan menghafal pola. Pattern trader akan diganti AI.",
  "Jangan lawan order flow. 90% trader bangkrut karena melawan arah market maker.",
  "Nothing good comes from breaking your own rules.",
  "Judge performa di akhir bulan, bukan per-trade. Probability over outcome.",
  "Time is more important than price.",
  "Kesabaran adalah edge — entry jarang tapi presisi.",
  "Terima loss sebagai bagian trading. Yang bilang tak pernah loss itu bohong.",
  "Yang salah gue, bukan market. Jangan bermental korban.",
  "Trading for living, bukan living to trade. Slow and steady wins the race.",
  "Market itu Rajanya — stay humble. Kita bukan market maker.",
  "Amankan risiko dulu, baru cari profit.",
];
