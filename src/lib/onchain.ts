// CryptoQuant on-chain metrics — specs + interpretation.
//
// Pure module (no secrets, no fetching): the API route uses `path`/`params`/
// `field` to call CryptoQuant server-side; the UI uses `interpret()` to turn a
// raw number into a readable read. The API key NEVER reaches this module.
//
// Endpoints/fields verified against CryptoQuant's published API catalog
// (base https://api.cryptoquant.com/v1, auth: Authorization: Bearer <key>).

export type Tone = "good" | "warn" | "bad" | "neutral";

export type OnchainRead = { label: string; tone: Tone; advice: string };

export type OnchainMetric = {
  key: string;
  label: string;
  emoji: string;
  path: string;
  params: Record<string, string>;
  field: string;
  /** Formats the raw number for display. */
  format: (v: number) => string;
  /** What the metric is, in one line. */
  hint: string;
  interpret: (v: number) => OnchainRead;
};

const btc = (v: number) =>
  `${v > 0 ? "+" : ""}${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} BTC`;
const num = (d: number) => (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v: number) => `${(v * 100).toFixed(4)}%`;
const usdShort = (v: number) =>
  v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${v.toFixed(0)}`;

export const ONCHAIN_METRICS: OnchainMetric[] = [
  {
    key: "netflow",
    label: "Exchange netflow (24j)",
    emoji: "🏦",
    path: "/btc/exchange-flows/netflow",
    params: { exchange: "all_exchange", window: "day" },
    field: "netflow_total",
    format: btc,
    hint: "Selisih BTC masuk vs keluar exchange. Masuk = calon tekanan jual; keluar = ditarik ke custody/akumulasi.",
    interpret: (v) =>
      v > 2000
        ? { label: "Inflow besar", tone: "bad", advice: "Banyak BTC masuk exchange — potensi tekanan jual. Hati-hati posisi long." }
        : v > 0
          ? { label: "Inflow ringan", tone: "warn", advice: "Sedikit BTC masuk exchange — waspada, belum tentu jual besar." }
          : v < -2000
            ? { label: "Outflow besar", tone: "good", advice: "BTC ditarik keluar exchange — tanda akumulasi/hold, suplai jual menipis." }
            : { label: "Outflow ringan", tone: "good", advice: "Sedikit BTC keluar exchange — netral condong akumulasi." },
  },
  {
    key: "whaleRatio",
    label: "Exchange whale ratio",
    emoji: "🐋",
    path: "/btc/flow-indicator/exchange-whale-ratio",
    params: { exchange: "all_exchange", window: "day" },
    field: "exchange_whale_ratio",
    format: num(2),
    hint: "Porsi 10 inflow terbesar terhadap total inflow. Tinggi = paus yang kirim ke exchange (sering jelang jual).",
    interpret: (v) =>
      v > 0.85
        ? { label: "Paus aktif", tone: "bad", advice: "Inflow didominasi paus (>0.85) — historis rawan koreksi. Kurangi agresivitas." }
        : v > 0.5
          ? { label: "Normal", tone: "neutral", advice: "Campuran ritel & paus — tidak ada sinyal ekstrem." }
          : { label: "Tenang", tone: "good", advice: "Inflow didominasi ritel kecil — tekanan jual paus rendah." },
  },
  {
    key: "elr",
    label: "Estimated leverage ratio",
    emoji: "⚠️",
    path: "/btc/market-indicator/estimated-leverage-ratio",
    params: { exchange: "binance", window: "day" },
    field: "estimated_leverage_ratio",
    format: num(3),
    hint: "Open interest ÷ cadangan BTC exchange. Tinggi = rata-rata user pakai leverage besar → rawan liquidation cascade.",
    interpret: (v) =>
      v > 0.25
        ? { label: "Leverage tinggi", tone: "bad", advice: "Pasar penuh leverage — rawan efek berantai likuidasi (long & short sama-sama bisa disapu)." }
        : v > 0.15
          ? { label: "Agak panas", tone: "warn", advice: "Leverage mulai menumpuk — perkecil size, jangan lawan arus." }
          : { label: "Sehat", tone: "good", advice: "Leverage relatif rendah — risiko cascade lebih kecil." },
  },
  {
    key: "funding",
    label: "Funding rate (Binance)",
    emoji: "💸",
    path: "/btc/market-data/funding-rates",
    params: { exchange: "binance", window: "hour" },
    field: "funding_rates",
    format: pct,
    hint: "Positif = long bayar short (mayoritas taruhan naik). Negatif = short bayar long. Ekstrem = pasar crowded.",
    interpret: (v) =>
      v > 0.0005
        ? { label: "Long crowded", tone: "bad", advice: "Long ramai & bayar mahal — bahan bakar long squeeze." }
        : v > 0.0001
          ? { label: "Bullish ringan", tone: "neutral", advice: "Sentimen condong long, masih wajar." }
          : v < -0.0001
            ? { label: "Short crowded", tone: "warn", advice: "Short ramai — rawan short squeeze ke atas." }
            : { label: "Netral", tone: "good", advice: "Funding mendekati nol — pasar tidak crowded." },
  },
  {
    key: "openInterest",
    label: "Open interest (Binance)",
    emoji: "📊",
    path: "/btc/market-data/open-interest",
    params: { exchange: "binance", window: "hour" },
    field: "open_interest",
    format: usdShort,
    hint: "Total posisi derivatif terbuka. Naik cepat + harga sideways = leverage menumpuk.",
    interpret: () => ({
      label: "Konteks",
      tone: "neutral",
      advice: "Baca bareng funding & ELR: OI naik + funding tinggi = leverage menumpuk.",
    }),
  },
  {
    key: "mvrv",
    label: "MVRV",
    emoji: "🧮",
    path: "/btc/market-indicator/mvrv",
    params: { window: "day" },
    field: "mvrv",
    format: num(2),
    hint: "Market cap ÷ realized cap. Seberapa jauh harga di atas ongkos rata-rata holder.",
    interpret: (v) =>
      v > 3.7
        ? { label: "Overheated", tone: "bad", advice: "Historis zona puncak — waktunya ambil profit bertahap, bukan menambah." }
        : v > 1
          ? { label: "Wajar", tone: "neutral", advice: "Di antara ekstrem — ikuti tren & plan." }
          : { label: "Undervalue", tone: "good", advice: "Rata-rata holder rugi — historis zona akumulasi jangka panjang." },
  },
  {
    key: "sopr",
    label: "SOPR",
    emoji: "🔁",
    path: "/btc/market-indicator/sopr",
    params: { window: "day" },
    field: "sopr",
    format: num(3),
    hint: "Rasio profit koin yang dipindah. >1 = rata-rata dijual untung; <1 = dijual rugi (capitulation).",
    interpret: (v) =>
      v > 1.02
        ? { label: "Ambil profit", tone: "warn", advice: "Holder merealisasi untung — sering jadi rem kenaikan." }
        : v < 0.98
          ? { label: "Capitulation", tone: "good", advice: "Dijual rugi — historis dekat area bottom lokal." }
          : { label: "Netral", tone: "neutral", advice: "Sekitar 1.0 — titik impas, sering jadi support/resistance." },
  },
  {
    key: "puell",
    label: "Puell multiple",
    emoji: "⛏️",
    path: "/btc/network-indicator/puell-multiple",
    params: { window: "day" },
    field: "puell_multiple",
    format: num(2),
    hint: "Pendapatan miner ÷ rata-rata 365 hari. Menandai posisi siklus dari sisi tekanan jual miner.",
    interpret: (v) =>
      v > 4
        ? { label: "Zona puncak", tone: "bad", advice: "Miner sangat untung — historis area distribusi/top siklus." }
        : v < 0.5
          ? { label: "Zona dasar", tone: "good", advice: "Miner tertekan — historis area bottom siklus, bagus untuk cicil." }
          : { label: "Tengah", tone: "neutral", advice: "Di antara ekstrem siklus." },
  },
];

export function toneClass(t: Tone): string {
  return t === "good"
    ? "text-done"
    : t === "bad"
      ? "text-destructive"
      : t === "warn"
        ? "text-warn"
        : "text-muted-foreground";
}
