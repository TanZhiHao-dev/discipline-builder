// Crypto "Kitab" — the AC Protocol distilled into structured, actionable data.
// Own-words synthesis of a crypto trading course (personal study notes), used by
// the /crypto workspace: Flow-Pause-Grab SOP, fundamental scoring, conviction
// rules, narrative durations, and allocation rules. Pure data — client-safe.

// ── 1. Flow-Pause-Grab SOP (7 steps, mirrors the ICDT kitab shape) ───────────
export type CryptoSopStep = {
  key: string;
  n: number;
  label: string;
  hint: string;
  cari: string[]; // "Cari ini" — what to look for at this step
};

export const CRYPTO_SOP: CryptoSopStep[] = [
  {
    key: "macro",
    n: 1,
    label: "Macro & Cycle",
    hint: "Di fase siklus mana kita sekarang? BTC.D & TOTAL3 ke mana?",
    cari: [
      "Fase halving: akumulasi / markup / euforia / bear? (cek Cycle Compass)",
      "BTC Dominance turun + TOTAL3 naik = lampu hijau altseason.",
      "Konfluensi monthly: RSI ≥90 = zona bahaya; DXY turun = BTC cenderung naik.",
      "Aset alpha (BTC/ETH) = time-in-market; altcoin = wajib timing + TP.",
    ],
  },
  {
    key: "narrative",
    n: 2,
    label: "Narrative",
    hint: "Narasi apa yang lagi hot & masih awal? Umur berapa?",
    cari: [
      "Narasi masih 'dibicarakan orang pintar' atau sudah jadi headline semua orang?",
      "Umur narasi: sudah lewat 2-4 bulan? Kalau ya, siapkan exit.",
      "Bridging Web2→Web3: ada langkah raksasa (Apple/Microsoft/BlackRock) yang seirama?",
      "Beli LEADER sektor, bukan koin ke-7 di narasi yang sama.",
    ],
  },
  {
    key: "fundamental",
    n: 3,
    label: "Fundamental score",
    hint: "Skor 6 metrik >50/100? (pakai Coin Scorer)",
    cari: [
      "Value: solve real problem? Money model bukan ponzinomics?",
      "Supply: MC rendah + ~90% beredar = hidden gem; float 10% + FDV raksasa = jebakan.",
      "Cek unlock (tokenunlocks) — jangan beli tepat sebelum unlock besar.",
      "VC backers kuat (Pantera/Coinbase/Binance Labs) + komunitas loyal?",
    ],
  },
  {
    key: "flow",
    n: 4,
    label: "Flow & Box",
    hint: "Flow ke mana? Tandai area Pause (box) konsolidasi.",
    cari: [
      "Tidak ada 'trend' — baca liquidity & order flow. Sideways = pause, bukan trend.",
      "Tandai box konsolidasi (Pandora): demand/supply area.",
      "Timeframe besar (weekly/daily) = valid; lower TF = noise.",
      "Big wick = jejak big player ('unfinished business').",
    ],
  },
  {
    key: "grab",
    n: 5,
    label: "The Grab",
    hint: "Sudah ada liquidity sweep di dalam box?",
    cari: [
      "Harga menjambret SL retail di level obvious (support psikologis, double bottom)?",
      "Bullish grab = V (turun-naik); bearish grab = Λ (naik-turun).",
      "Grab setelah pause = ~70-80% flow lanjut; tanpa grab hanya ~40%.",
      "JANGAN entry sebelum trap/grab terlihat — sabar = edge.",
    ],
  },
  {
    key: "trigger",
    n: 6,
    label: "Entry on Reclaim + Trigger",
    hint: "Masuk saat harga reclaim area; konfirmasi quant.",
    cari: [
      "Entry saat harga RECLAIM area (bukan break pertama); verifikasi pakai line chart.",
      "Fib: main di 0.5, bukan golden pocket 0.618 (retail nongkrong di situ = trap).",
      "Quant (Coinglass): CVD divergence, OI mendukung, funding tidak ekstrem lawan posisi.",
      "RR plan ≥ 2 sebelum pencet.",
    ],
  },
  {
    key: "manage",
    n: 7,
    label: "Size & Manage",
    hint: "Sizing sesuai rules, TP ladder, exit sesuai plan.",
    cari: [
      "Size dari risk % (max 10% porto/koin alt, split 4 entry); leverage cuma angka.",
      "TP berjenjang ('kenceng awal, kendor akhir') — jual saat hype memuncak.",
      "Max 3 posisi futures, never average down; 2 loss beruntun = istirahat.",
      "Catat actual exit → nilai disiplin TP (sesuai plan / fear-TP / runner).",
    ],
  },
];

export const CRYPTO_METHOD = "Flow-Pause-Grab";

// ── 2. Fundamental scoring — 6 metrics, each 0-10 → % (layak jika ≥50%) ──────
export type ScoreMetric = {
  key: string;
  emoji: string;
  label: string;
  guide: string; // what a 10 looks like
};

export const SCORE_METRICS: ScoreMetric[] = [
  {
    key: "value",
    emoji: "💎",
    label: "The Value",
    guide: "Solve real problem yang jelas & terukur; bukan sekadar hype/branding.",
  },
  {
    key: "money",
    emoji: "🏦",
    label: "Money Model",
    guide: "Fee-taking / utility-demand nyata; BUKAN ponzinomics (naik cuma karena investor baru).",
  },
  {
    key: "supply",
    emoji: "🧾",
    label: "Supply & Unlock",
    guide: "MC rendah + ~90% beredar; distribusi sehat (dev ≤20%, VC ≤30%, komunitas ≥50%); no unlock besar dekat.",
  },
  {
    key: "founder",
    emoji: "🧑‍💼",
    label: "Founders",
    guide: "Tim punya track record & direct contribution; invest in people, bukan cuma project.",
  },
  {
    key: "vc",
    emoji: "🐋",
    label: "VC / Big Players",
    guide: "Di-back VC top (Pantera + Coinbase + Binance Labs = 'digendong 3 orang kekar').",
  },
  {
    key: "crowd",
    emoji: "👥",
    label: "The Crowd",
    guide: "Komunitas loyal: chat aktif harian, DAO hidup, active user naik, tetap dibeli saat -40-50%.",
  },
];

// ── 3. Five Conviction Rules (min 5 alasan sebelum beli) ─────────────────────
export const CONVICTION_RULES: string[] = [
  "Testing / hold di weekly support",
  "Struktur bullish (Flow-Pause-Grab terkonfirmasi)",
  "Oscillator di area beli (RSI/Stoch oversold)",
  "Narasi sektornya sedang hot & masih awal",
  "Narasi dipilih perusahaan besar (mis. RWA di-back BlackRock)",
  "Di-endorse tokoh/founder penting",
  "Business model segar & masuk akal",
  "Didukung banyak VC besar",
  "On-chain data hijau (DAU/revenue naik)",
  "Tokenomics bagus (~100% beredar, no unlock dekat)",
  "Roadmap penuh event/katalis",
  "Fundamental score >50/100 (Coin Scorer)",
];

export const MIN_CONVICTION = 5;

// ── 4. Narrative durations (untuk age-warning di tracker) ────────────────────
export const NARRATIVE_DURATIONS: { name: string; months: number | null }[] = [
  { name: "AI", months: 2 },
  { name: "BRC20", months: 2 },
  { name: "Metaverse", months: 3 },
  { name: "Solana / SOL eco", months: 3 },
  { name: "Chinese narrative", months: 2 },
  { name: "DeFi", months: 4 },
  { name: "GameFi", months: 4 },
  { name: "RWA", months: 4 },
  { name: "DePIN", months: 3 },
  { name: "Memecoin", months: null }, // all-year, tak terprediksi
  { name: "Layer 1 baru", months: null },
];
export const DEFAULT_NARRATIVE_MONTHS = 3; // asumsi kalau tak dikenali

// ── 5. Allocation rules ──────────────────────────────────────────────────────
export const ALLOCATION_RULES = {
  spotPct: 70,
  cashPct: 30,
  maxPerCoinPct: 10,
  entryGrid: 4,
  coreSplit: { btc: 60, eth: 40 }, // untuk porto konservatif BTC/ETH
  capFormation: [
    { tier: "Big cap", count: 2, note: "aman, 200-300% saat altseason" },
    { tier: "Mid cap", count: 1, note: "stabil, 500-1000%" },
    { tier: "Low cap", count: 2, note: "gamble, 2000-3000%" },
  ],
  fun: [
    { label: "Spot core", pct: 70 },
    { label: "Meme", pct: 10 },
    { label: "NFT", pct: 10 },
    { label: "Airdrop", pct: 10 },
  ],
};

export type RptScenario = {
  key: string;
  label: string;
  who: string;
  rpt: number; // %
  accuracy: number; // %
  rr: number; // reward:risk
  tradesPerMonth: number;
  monthlyReturn: string;
};

export const RPT_SCENARIOS: RptScenario[] = [
  {
    key: "pro",
    label: "Profesional (sibuk)",
    who: "Kerja fixed-income, waktu layar terbatas",
    rpt: 1,
    accuracy: 70,
    rr: 3,
    tradesPerMonth: 20,
    monthlyReturn: "±36R",
  },
  {
    key: "student",
    label: "Mahasiswa (banyak waktu)",
    who: "Fleksibel, bisa pantau market",
    rpt: 2,
    accuracy: 70,
    rr: 2,
    tradesPerMonth: 40,
    monthlyReturn: "±88%",
  },
  {
    key: "fulltime",
    label: "Full-timer (modal besar)",
    who: "Beban mental ekstrem — bukan untuk semua",
    rpt: 5,
    accuracy: 60,
    rr: 1.5,
    tradesPerMonth: 120,
    monthlyReturn: "±300%",
  },
];

// ── 6. AC Protocol pillars (upgraded Crypto Desk playbook) ───────────────────
export type ProtocolPillar = {
  emoji: string;
  title: string;
  tagline: string;
  points: string[];
};

export const AC_PROTOCOL: ProtocolPillar[] = [
  {
    emoji: "⚖️",
    title: "Bobot Riset: 50 / 30 / 20",
    tagline: "Narrative 50% · Technical 30% · Fundamental 20%",
    points: [
      "~80% kenaikan aset digerakkan NARASI — itu sebabnya bobotnya terbesar.",
      "Technical (Flow-Pause-Grab) untuk timing entry; fundamental untuk conviction & pilih pemenang.",
      "Urutan kerja: makro → narasi → fundamental → technical → positioning → eksekusi.",
    ],
  },
  {
    emoji: "🌍",
    title: "Makro & Siklus",
    tagline: "Tentukan mode sebelum apa pun.",
    points: [
      "Aset alpha (BTC/ETH/indeks) struktural naik (M2 printing) — time-in-market menang.",
      "Altcoin: ~95% menuju nol → wajib TP, hold max ±4 bulan per narasi.",
      "Urutan entry alt: BTC.D turun → TOTAL3 naik → baru positioning.",
      "Konfluensi siklus: RSI monthly ≥90, Pi Cycle Top, risk level 0.9-1.0, DXY kebalikan BTC.",
    ],
  },
  {
    emoji: "📖",
    title: "Narrative Research (50%)",
    tagline: "Market = cerita; narasi = mata uang baru.",
    points: [
      "Anatomi narasi = problem → solution; umur 2-4 bulan, WAJIB exit.",
      "Narrative Calendar: prediksi narasi/kuartal dari berita+riset tahun lalu.",
      "Bridging Web2→Web3 & narrative rhyming (AI tiap Q1; DeFi→meme; ETH upgrade→L2).",
      "Baca rotasi kontra-intuitif: narasi undervalued = kandidat pump; yang jenuh = rawan dump.",
    ],
  },
  {
    emoji: "🔬",
    title: "Fundamental ala VC",
    tagline: "6 metrik, skor >50/100 = layak.",
    points: [
      "Value · Money Model (anti-ponzinomics) · Supply+Unlock · Founders · VC · Community.",
      "Hidden gem = MC rendah + ~90% beredar; jebakan = float 10% + FDV raksasa.",
      "Follow smart money (ChainBroker); filter 'digendong 3 VC kekar'.",
      "Kamu yang TP, atau founder yang TP? Jangan jadi bag holder.",
    ],
  },
  {
    emoji: "📈",
    title: "Alpha Technical (Flow-Pause-Grab)",
    tagline: "Tidak ada trend — yang ada liquidity & order flow.",
    points: [
      "Siklus: Flow → Pause (box) → tunggu THE GRAB → entry on reclaim.",
      "Grab setelah pause = ~70-80% lanjut; tanpa grab ~40%. Jangan entry sebelum trap.",
      "Anti-fakeout: line chart; Fib main di 0.5 bukan 0.618.",
      "Konfirmasi: CVD / Open Interest / Funding (Coinglass). It's all about the grab.",
    ],
  },
  {
    emoji: "🧩",
    title: "Positioning & Alokasi",
    tagline: "70/30, formasi 2 big + 1 mid + 2 low.",
    points: [
      "70% porto / 30% cash; max 10% per koin; 4 entry grid; five conviction rules.",
      "Diversifikasi Narrative · Cap · Time; TP ladder 'kenceng awal, kendor akhir'.",
      "BTC/ETH konsentrasi OK (60/40); DILARANG konsentrasi di 1 altcoin.",
      "Pemula: fokus BTC/ETH/safe bets — kalau tak gesit rotasi, alt kalah dari BTC.",
    ],
  },
  {
    emoji: "🧠",
    title: "Eksekusi & Mental",
    tagline: "EI > financial literacy.",
    points: [
      "RPT sesuai profil hidup; max 3 posisi futures; never average down.",
      "4 rules cek-diri: yakin <3 menit · riset <5 scroll · cek HP ≤2x/jam · sistem berhasil >10x.",
      "Hedging long+short = losing game; pisahkan akun spot (invest) vs derivatif (trade).",
      "Setelah loss: istirahat sampai mental pulih. Sabar & disiplin > analisa.",
    ],
  },
];

export const CRYPTO_WISDOM: string[] = [
  "Bull market bikin merasa pintar; bear market menunjukkan siapa yang benar-benar belajar.",
  "Take profit bukan pengkhianatan terhadap koin — itu alasan kamu masuk market.",
  "Kalau kamu tidak tahu siapa exit liquidity di sebuah pump, kemungkinan besar itu kamu.",
  "Survive dulu, kaya belakangan. Yang bertahan 2 siklus penuh hampir selalu menang.",
  "It's all about the grab — jangan entry sebelum trap terlihat.",
  "Narasi berganti tiap siklus, emosi manusia tidak pernah — di situ edge-nya.",
];
