// Central config for the two markets the trader follows and the four
// timeframes shown in the multi-chart grid. Change symbols here if you
// prefer a different data provider (broker) on TradingView.

export const ASSETS = {
  XAUUSD: { key: "XAUUSD", name: "Gold", symbol: "FOREXCOM:XAUUSD" },
  NAS100: { key: "NAS100", name: "Nasdaq 100", symbol: "FOREXCOM:NAS100" },
  BTCUSD: { key: "BTCUSD", name: "Bitcoin", symbol: "BINANCE:BTCUSDT" },
  ETHUSD: { key: "ETHUSD", name: "Ethereum", symbol: "BINANCE:ETHUSDT" },
  SOLUSD: { key: "SOLUSD", name: "Solana", symbol: "BINANCE:SOLUSDT" },
} as const;

// Assets that belong to the crypto desk (24/7 market, cycle tools apply).
export const CRYPTO_KEYS = ["BTCUSD", "ETHUSD", "SOLUSD"] as const;
export function isCryptoAsset(key: string): boolean {
  return (CRYPTO_KEYS as readonly string[]).includes(key);
}

export type AssetKey = keyof typeof ASSETS;
export const ASSET_KEYS = Object.keys(ASSETS) as AssetKey[];

// Position-sizing metadata. `valuePerPoint` = $ P/L for a 1.00 price move on
// 1 unit (1 lot / 1 contract). XAUUSD: 1 lot = 100oz → $100 per $1 move.
// NAS100/NQ: 1 E-mini contract = $20 per index point (editable in the calc for
// micro $2 or CFD $1). `decimals` = price precision.
export const TRADE_META: Record<
  AssetKey,
  { unit: string; valuePerPoint: number; decimals: number; pointName: string }
> = {
  XAUUSD: { unit: "lot", valuePerPoint: 100, decimals: 2, pointName: "$" },
  NAS100: { unit: "contract", valuePerPoint: 20, decimals: 2, pointName: "pt" },
  // Crypto spot: 1 coin → $1 P/L per $1 move. Size output = coins.
  BTCUSD: { unit: "coin", valuePerPoint: 1, decimals: 0, pointName: "$" },
  ETHUSD: { unit: "coin", valuePerPoint: 1, decimals: 1, pointName: "$" },
  SOLUSD: { unit: "coin", valuePerPoint: 1, decimals: 2, pointName: "$" },
};

// Symbols shown in the top ticker tape (context for gold + index trading).
export const TICKER_SYMBOLS: { proName: string; title: string }[] = [
  { proName: "FOREXCOM:XAUUSD", title: "Gold" },
  { proName: "FOREXCOM:NAS100", title: "NAS100" },
  { proName: "TVC:DXY", title: "DXY" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "BINANCE:BTCUSDT", title: "BTC" },
  { proName: "BINANCE:ETHUSDT", title: "ETH" },
  { proName: "BINANCE:SOLUSDT", title: "SOL" },
  { proName: "CRYPTOCAP:BTC.D", title: "BTC.D" },
  { proName: "CRYPTOCAP:TOTAL", title: "TOTAL" },
];

// TradingView interval codes: M=monthly, W=weekly, D=daily, 60=1-hour.
export const TIMEFRAMES = [
  { interval: "M", label: "Monthly" },
  { interval: "W", label: "Weekly" },
  { interval: "D", label: "Daily" },
  { interval: "60", label: "Hourly" },
] as const;

export const DAILY_BIAS = ["Bullish", "Bearish", "Neutral"] as const;
export type DailyBias = (typeof DAILY_BIAS)[number];

// Trading methods. Each asset has a default method that's pre-filled in the SOP
// form; the list below is what the method picker offers.
export const METHODS = ["ICDT", "Flow-Pause-Grab", "Swing Failure Pattern"] as const;

export const DEFAULT_METHOD: Record<AssetKey, string> = {
  XAUUSD: "ICDT",
  NAS100: "Swing Failure Pattern",
  BTCUSD: "Flow-Pause-Grab",
  ETHUSD: "Flow-Pause-Grab",
  SOLUSD: "Flow-Pause-Grab",
};

export const TRADE_STATUS = ["Running", "Win", "Loss", "Break Even"] as const;
export type TradeStatus = (typeof TRADE_STATUS)[number];

// ---- Chart template (saved layout config for the TradingView widget) ----

// TradingView advanced-chart `style` codes.
export const CHART_STYLES = [
  { value: "1", label: "Candles" },
  { value: "8", label: "Heikin Ashi" },
  { value: "9", label: "Hollow Candles" },
  { value: "0", label: "Bars" },
  { value: "2", label: "Line" },
  { value: "3", label: "Area" },
] as const;

// Built-in studies the widget can auto-load (embed uses the @tv-basicstudies ids).
export const BUILTIN_STUDIES = [
  { id: "Volume@tv-basicstudies", label: "Volume" },
  { id: "MASimple@tv-basicstudies", label: "MA (SMA)" },
  { id: "MAExp@tv-basicstudies", label: "EMA" },
  { id: "RSI@tv-basicstudies", label: "RSI" },
  { id: "MACD@tv-basicstudies", label: "MACD" },
  { id: "BB@tv-basicstudies", label: "Bollinger Bands" },
  { id: "VWAP@tv-basicstudies", label: "VWAP" },
  { id: "IchimokuCloud@tv-basicstudies", label: "Ichimoku" },
  { id: "PivotPointsStandard@tv-basicstudies", label: "Pivot Points" },
] as const;

export type CandleColors = { up: string; down: string };

export type ChartConfig = {
  candles: CandleColors;
  style: string; // one of CHART_STYLES value
  studies: string[]; // BUILTIN_STUDIES ids
};

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  candles: { up: "#26a69a", down: "#ef5350" },
  style: "1",
  studies: [],
};
