// Crypto trading + investing knowledge base for the Terminal's Crypto Desk.
// Original write-up of widely-known market concepts (cycles, halving, BTC
// dominance, tokenomics, risk, security) — pure data + pure helpers, safe to
// import from client components.

// ---- Bitcoin halving anchors (public facts) ----
export const HALVINGS: { date: string; block: number; label: string }[] = [
  { date: "2012-11-28", block: 210_000, label: "Halving I" },
  { date: "2016-07-09", block: 420_000, label: "Halving II" },
  { date: "2020-05-11", block: 630_000, label: "Halving III" },
  { date: "2024-04-19", block: 840_000, label: "Halving IV" },
];
// Estimated (block-time drift makes the exact date move a bit).
export const NEXT_HALVING_EST = "2028-04-01";

export type CyclePhase = {
  key: "accumulation" | "markup" | "euphoria" | "cooldown";
  name: string;
  emoji: string;
  daysSinceHalving: number;
  daysToNextHalving: number;
  summary: string;
  playbook: string[];
};

/** Where "today" sits relative to the last halving, mapped to the historical
 *  4-phase cycle pattern. Heuristic from past cycles — a compass, not a law. */
export function cyclePhase(now: Date): CyclePhase {
  const last = new Date(HALVINGS[HALVINGS.length - 1].date + "T00:00:00");
  const next = new Date(NEXT_HALVING_EST + "T00:00:00");
  const days = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  const toNext = Math.max(
    0,
    Math.ceil((next.getTime() - now.getTime()) / 86_400_000),
  );

  // Historical rhythm: past cycle tops printed ~520–580 hari pasca-halving
  // (Des 2017 ≈ 525 hari, Nov 2021 ≈ 546 hari). Sesudahnya bear ±1 tahun,
  // lalu akumulasi menjelang halving berikutnya.
  if (days < 180) {
    return {
      key: "markup",
      name: "Early expansion",
      emoji: "🌱",
      daysSinceHalving: days,
      daysToNextHalving: toNext,
      summary:
        "Fase awal pasca-halving: supply baru terpangkas, market biasanya masih ragu. Historis: pondasi bull run dibangun di sini.",
      playbook: [
        "Fokus akumulasi BTC/ETH core — DCA disiplin, jangan all-in sekali entry.",
        "Altcoin besar boleh dicicil, hindari FOMO ke koin mikro dulu.",
        "Set target & rencana TP SEKARANG, sebelum euphoria mengaburkan pikiran.",
      ],
    };
  }
  if (days < 450) {
    return {
      key: "markup",
      name: "Bull markup",
      emoji: "🚀",
      daysSinceHalving: days,
      daysToNextHalving: toNext,
      summary:
        "Jendela markup historis: tren naik ditopang narasi & likuiditas. Koreksi 20–30% adalah NORMAL di dalam bull.",
      playbook: [
        "Ride the trend — tapi mulai pindahkan sebagian profit alt ke BTC/stablecoin secara bertahap.",
        "Rotasi sektor: perhatikan narasi yang lagi dialiri volume (bukan yang sudah pumped).",
        "Jangan tambah leverage saat sudah profit — itu cara klasik mengembalikan semua keuntungan.",
      ],
    };
  }
  if (days < 650) {
    return {
      key: "euphoria",
      name: "Euphoria / distribusi",
      emoji: "🎆",
      daysSinceHalving: days,
      daysToNextHalving: toNext,
      summary:
        "Zona puncak historis (~520–580 hari pasca-halving). Saat semua orang merasa jenius, smart money justru keluar diam-diam.",
      playbook: [
        "Eksekusi take-profit ladder yang sudah direncanakan — TANPA nego.",
        "Sinyal bahaya: ojek/keluarga mulai tanya koin, funding rate ekstrem, alt mikro pump ratusan persen.",
        "Naikkan porsi stablecoin. Yang menyelamatkan portofolio di sini adalah disiplin, bukan analisa.",
      ],
    };
  }
  if (days < 1050) {
    return {
      key: "cooldown",
      name: "Cooldown / bear",
      emoji: "🐻",
      daysSinceHalving: days,
      daysToNextHalving: toNext,
      summary:
        "Fase pendinginan historis: drawdown BTC bisa 60–80%, altcoin lebih dalam. Cash & kesabaran = posisi terbaik.",
      playbook: [
        "Jangan menangkap pisau jatuh dengan seluruh modal — DCA pelan dengan jadwal, bukan emosi.",
        "Alt yang mati di bear kebanyakan tidak pernah balik ATH — seleksi ulang portofolio tanpa baper.",
        "Gunakan waktu sepi untuk belajar + backtest. Bear market membangun skill, bull market membayarnya.",
      ],
    };
  }
  return {
    key: "accumulation",
    name: "Akumulasi pra-halving",
    emoji: "🧲",
    daysSinceHalving: days,
    daysToNextHalving: toNext,
    summary:
      "Mendekati halving berikutnya: pesimisme masih tebal, tapi historis inilah zona akumulasi terbaik satu siklus penuh.",
    playbook: [
      "DCA agresif ke BTC/ETH core selagi tidak ada yang peduli crypto.",
      "Susun watchlist narasi untuk siklus berikutnya dari proyek yang TETAP dibangun selama bear.",
      "Review jurnal siklus lalu: kesalahan apa yang tidak boleh diulang?",
    ],
  };
}

// ---- Fear & Greed interpretation ----
export function fngTone(value: number): {
  label: string;
  advice: string;
  cls: string;
} {
  if (value <= 25)
    return {
      label: "Extreme Fear",
      advice: "Historis: zona menarik untuk DCA/akumulasi — bukan untuk panic sell.",
      cls: "text-done",
    };
  if (value <= 45)
    return {
      label: "Fear",
      advice: "Market takut. Cek plan — biasanya peluang lebih banyak daripada risiko.",
      cls: "text-done",
    };
  if (value <= 55)
    return { label: "Neutral", advice: "Tidak ada edge dari sentimen. Ikuti SOP saja.", cls: "text-muted-foreground" };
  if (value <= 75)
    return {
      label: "Greed",
      advice: "Mulai disiplin TP bertahap; jangan menambah risiko baru yang besar.",
      cls: "text-warn",
    };
  return {
    label: "Extreme Greed",
    advice: "Zona distribusi historis. Kurangi leverage, amankan profit, jangan FOMO.",
    cls: "text-destructive",
  };
}

// ---- The Crypto Playbook (pillars) ----
export type CryptoPillar = {
  emoji: string;
  title: string;
  tagline: string;
  points: string[];
};

export const CRYPTO_PILLARS: CryptoPillar[] = [
  {
    emoji: "🔄",
    title: "Siklus 4 Tahun & Halving",
    tagline: "Peta besar market — semua strategi menempel di sini.",
    points: [
      "Halving memangkas supply BTC baru 50% tiap ±4 tahun → sejarahnya memicu siklus: akumulasi → markup → euphoria → bear.",
      "Puncak siklus historis muncul ±520–580 hari pasca-halving (2017 & 2021). Pola bisa bergeser — pakai sebagai kompas, bukan jadwal pasti.",
      "Keputusan terpenting bukan 'koin apa', tapi 'sekarang fase apa'. Strategi bull dipakai di bear = bakar modal.",
      "Institusi & ETF membuat siklus makin dipengaruhi likuiditas makro (suku bunga, DXY, M2) — pantau keduanya.",
    ],
  },
  {
    emoji: "👑",
    title: "BTC Dominance & Altseason",
    tagline: "Uang berputar: BTC dulu, baru mengalir ke alt.",
    points: [
      "BTC.D naik = uang lari ke BTC (risk-off di dalam crypto). BTC.D turun saat market naik = sinyal altseason.",
      "Urutan rotasi klasik: BTC → ETH → large cap → mid cap → micro/meme. Makin ke kanan, makin cepat & makin berbahaya.",
      "ETH/BTC adalah termometer altseason paling sederhana: selama pair ini lemah, altseason penuh belum dimulai.",
      "Altseason itu SINGKAT (mingguan, bukan tahunan). Rencana keluar harus sudah ada sebelum masuk.",
    ],
  },
  {
    emoji: "📖",
    title: "Narasi & Rotasi Sektor",
    tagline: "Di crypto, cerita menggerakkan harga sebelum fundamental.",
    points: [
      "Tiap siklus punya narasi juara (DeFi 2020, NFT/L1 2021, AI/RWA/meme 2024...). Uang mengejar cerita yang mudah dijual.",
      "Masuk saat narasi masih 'dibicarakan orang pintar', keluar saat sudah jadi headline semua orang.",
      "Cara scan: sektor apa yang volumenya naik konsisten + dapat listing/berita besar + charts leader-nya kuat?",
      "Satu narasi = beli LEADER-nya (bukan koin ke-7 di sektor itu). Leader naik duluan, turun belakangan.",
    ],
  },
  {
    emoji: "🧾",
    title: "Tokenomics Due Diligence",
    tagline: "Checklist sebelum beli koin apa pun selain BTC/ETH.",
    points: [
      "Supply: berapa % sudah beredar? FDV vs Market Cap — FDV 10x MC artinya dilusi besar sedang menunggu.",
      "Unlock/vesting: cek jadwal unlock team & VC. Unlock besar = tekanan jual terjadwal — jangan beli tepat sebelumnya.",
      "Utility & revenue: token dipakai untuk apa? Ada pendapatan protokol nyata, atau harga murni ditopang emisi?",
      "Distribusi: top holder wallet %, alokasi team vs komunitas. Terlalu terpusat = bisa di-dump kapan saja.",
      "Red flags: APY tidak masuk akal, tim anonim tanpa track record, audit tidak ada, listing hanya di DEX kecil.",
    ],
  },
  {
    emoji: "⛓️",
    title: "On-chain & Sentimen",
    tagline: "Data di blockchain tidak bisa berbohong — harga bisa.",
    points: [
      "Exchange inflow besar = potensi jual; outflow besar (ke cold wallet) = akumulasi. Arus BTC/ETH ke exchange layak dipantau.",
      "Funding rate perpetual: positif ekstrem = long crowded (rawan long squeeze); negatif ekstrem sebaliknya.",
      "Fear & Greed Index: alat kontra-emosi — extreme fear historis = zona beli, extreme greed = zona jual bertahap.",
      "Stablecoin supply naik = amunisi kering siap masuk; turun = likuiditas keluar dari crypto.",
    ],
  },
  {
    emoji: "🛡️",
    title: "Risk Management Crypto",
    tagline: "Volatilitas 3–5x forex — aturan mainnya harus lebih ketat.",
    points: [
      "Risk per trade tetap 1–2% dari akun — TAPI ingat crypto bisa gap & wick liar; stop-loss wajib, mental stop tidak dihitung.",
      "Leverage: kalau belum konsisten profit spot, leverage hanya mempercepat kebangkrutan. Max 2–3x pun sudah agresif.",
      "Position size alt mikro ≤ 1–2% portofolio per koin. Anggap uangnya sudah hilang saat masuk.",
      "Take-profit ladder: jual bertahap (mis. 25% di 2x, 25% di 3x...) — tidak ada yang bangkrut karena take profit.",
      "Selalu pegang stablecoin reserve. Peluang terbaik datang justru saat orang lain tidak punya peluru.",
    ],
  },
  {
    emoji: "💰",
    title: "Investing & DCA",
    tagline: "Untuk uang jangka panjang — beda rekening, beda aturan dari trading.",
    points: [
      "Pisahkan tegas: porto INVEST (BTC/ETH core, horizon multi-tahun) vs porto TRADING (aktif). Jangan saling pinjam.",
      "Struktur klasik: 50–70% BTC, 20–30% ETH, sisanya alt terseleksi. Makin kecil pengalaman, makin besar porsi BTC.",
      "DCA jadwal tetap (mingguan/bulanan) mengalahkan mayoritas usaha timing market — otomatiskan kalau bisa.",
      "Rebalancing berkala: alt yang tumbuh melebihi target % dipangkas kembali ke BTC/stable — memaksa jual mahal.",
      "Exit plan invest pun perlu: jual bertahap di zona euphoria siklus, bukan 'hodl selamanya' tanpa rencana.",
    ],
  },
  {
    emoji: "🔐",
    title: "Security & Self-Custody",
    tagline: "Di crypto, kamu adalah bank-nya — sekaligus satpam-nya.",
    points: [
      "Not your keys, not your coins: dana jangka panjang di hardware wallet, bukan menginap di exchange.",
      "Seed phrase: tulis fisik, simpan terpisah, JANGAN pernah difoto/di-cloud/diketik ke situs mana pun.",
      "Approval hygiene: revoke izin kontrak lama secara berkala (revoke.cash) — banyak wallet terkuras dari approval usang.",
      "Anti-phishing: bookmark situs resmi, jangan klik link dari DM/airdrop random, cek domain huruf per huruf.",
      "Uji tarik dana kecil dulu setiap pakai jalur/exchange/bridge baru.",
    ],
  },
];

// ---- Pre-entry checklist (crypto) ----
export const CRYPTO_CHECKLIST: { title: string; items: string[] }[] = [
  {
    title: "Sebelum BELI (invest)",
    items: [
      "Fase siklus sekarang mendukung beli? (cek Cycle Compass)",
      "Tokenomics lolos DD? (FDV, unlock, utility, distribusi)",
      "Narasi/sektornya masih awal atau sudah euphoria?",
      "Ukuran posisi sesuai bucket porto? (core vs satellite)",
      "Exit plan tertulis: TP ladder + kondisi cut?",
    ],
  },
  {
    title: "Sebelum ENTRY (trade)",
    items: [
      "Analisa SOP steps 1–5 sudah dibuat di pre-market hari ini?",
      "RR plan ≥ 2? Stop-loss di harga, bukan di kepala?",
      "Funding rate / sentimen tidak lagi ekstrem melawan posisi?",
      "Tidak ada unlock/berita besar terjadwal dalam waktu dekat?",
      "Size sudah dihitung dari risk %, bukan dari keyakinan?",
    ],
  },
];

export const CRYPTO_WISDOM: string[] = [
  "Bull market membuatmu merasa pintar; bear market menunjukkan siapa yang benar-benar belajar.",
  "Take profit itu bukan pengkhianatan terhadap koin — itu alasan kamu masuk market.",
  "Kalau kamu tidak tahu siapa yang jadi likuiditas exit di sebuah pump, kemungkinan besar itu kamu.",
  "Survive dulu, kaya belakangan. Yang bertahan 2 siklus penuh hampir selalu menang.",
  "Narasi berganti tiap siklus, tapi emosi manusia tidak pernah — di situlah edge-nya.",
];
