// Trading metadata + helpers for the Journal / Backtest features.
// Mirrors the trading-sop app so the two feel like one workflow.
// Pure — safe to import from client components.
import type { TradeJournalRow } from "@/db/schema";

export const ASSETS = {
  XAUUSD: { key: "XAUUSD", name: "Gold", emoji: "🥇" },
  NAS100: { key: "NAS100", name: "Nasdaq 100", emoji: "📈" },
  BTCUSD: { key: "BTCUSD", name: "Bitcoin", emoji: "₿" },
  ETHUSD: { key: "ETHUSD", name: "Ethereum", emoji: "🔷" },
  SOLUSD: { key: "SOLUSD", name: "Solana", emoji: "🟣" },
} as const;

export type AssetKey = keyof typeof ASSETS;
export const ASSET_KEYS = Object.keys(ASSETS) as AssetKey[];

export const METHODS = [
  "ICDT",
  "Flow-Pause-Grab",
  "Swing Failure Pattern",
  "Spot / Invest",
  "Other",
] as const;

export const DEFAULT_METHOD: Record<AssetKey, string> = {
  XAUUSD: "ICDT",
  NAS100: "Swing Failure Pattern",
  BTCUSD: "Flow-Pause-Grab",
  ETHUSD: "Flow-Pause-Grab",
  SOLUSD: "Flow-Pause-Grab",
};

export const BIAS = ["Bullish", "Bearish", "Neutral"] as const;
export type Bias = (typeof BIAS)[number];

export const STATUSES = ["Running", "Win", "Loss", "Break Even"] as const;
export type TradeStatus = (typeof STATUSES)[number];

// The 7-step SOP — field key + label + hint, drives the form and detail view.
export const SOP_STEPS = [
  {
    key: "topDownAnalysis",
    n: 1,
    label: "Top-down analysis",
    hint: "HTF context — monthly/weekly/daily read.",
  },
  {
    key: "dailyBias",
    n: 2,
    label: "Daily bias",
    hint: "Bullish, bearish, or neutral for the session.",
  },
  {
    key: "marketStructure",
    n: 3,
    label: "Advanced market structure",
    hint: "BOS / CHoCH / MSS, ranges, liquidity & key swing points.",
  },
  {
    key: "quarterlyTheory",
    n: 4,
    label: "Quarterly theory",
    hint: "Accumulation → manipulation → distribution phase.",
  },
  {
    key: "pdArray",
    n: 5,
    label: "PD array",
    hint: "FVG, OB, breaker — the array you're trading from.",
  },
] as const;

export type SopStepKey = (typeof SOP_STEPS)[number]["key"];

// Tailwind class hints per status (uses habitline tokens).
export function statusClasses(status: string): {
  dot: string;
  text: string;
  soft: string;
} {
  switch (status) {
    case "Win":
      return { dot: "bg-done", text: "text-done", soft: "bg-done/10" };
    case "Loss":
      return {
        dot: "bg-destructive",
        text: "text-destructive",
        soft: "bg-destructive/10",
      };
    case "Break Even":
      return {
        dot: "bg-muted-foreground",
        text: "text-muted-foreground",
        soft: "bg-muted",
      };
    default: // Running
      return { dot: "bg-brand", text: "text-brand", soft: "bg-brand/10" };
  }
}

export function biasClasses(bias: string): string {
  if (bias === "Bullish") return "text-done";
  if (bias === "Bearish") return "text-destructive";
  return "text-muted-foreground";
}

/** Planned reward:risk from entry / SL / TP, or null if incomputable. */
export function plannedRR(row: {
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
}): number | null {
  if (row.entryPrice == null || row.stopLoss == null || row.takeProfit == null)
    return null;
  const risk = Math.abs(row.entryPrice - row.stopLoss);
  const reward = Math.abs(row.takeProfit - row.entryPrice);
  if (risk === 0) return null;
  return reward / risk;
}

/** A trade's effective date in ms: the user-set `date` (YYYY-MM-DD, local) when
 *  present, else the createdAt timestamp. Used for display, grouping, stats. */
export function tradeDateMs(row: {
  date?: string | null;
  createdAt: Date | string | number;
}): number {
  if (row.date) {
    const t = Date.parse(row.date + "T00:00:00");
    if (Number.isFinite(t)) return t;
  }
  return new Date(row.createdAt).getTime();
}

/** Direction-agnostic realized R from prices: (exit-entry)/(entry-SL).
 *  Positive when the exit is on the profit side for either direction. */
export function actualR(
  entry: number | null,
  sl: number | null,
  exit: number | null,
): number | null {
  if (entry == null || sl == null || exit == null) return null;
  const risk = entry - sl;
  if (risk === 0) return null;
  return (exit - entry) / risk;
}

export type ExitJudgment = {
  capture: number; // fraction of the planned move captured (1 = exact TP)
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
};

/** Compare the actual exit against the PLANNED take-profit (and stop):
 *  did the trade follow the plan, TP early out of fear, or run past target? */
export function judgeExit(row: {
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  exitPrice: number | null;
}): ExitJudgment | null {
  const { entryPrice: e, stopLoss: sl, takeProfit: tp, exitPrice: x } = row;
  if (e == null || tp == null || x == null || tp === e) return null;
  const capture = (x - e) / (tp - e); // direction-agnostic
  const pct = Math.round(capture * 100);

  if (capture >= 0.98 && capture <= 1.05)
    return { capture, label: "🎯 Exit di target — sesuai plan", tone: "good" };
  if (capture > 1.05)
    return { capture, label: `🚀 Runner — ${pct}% dari target (lewat plan)`, tone: "good" };
  if (capture >= 0.5)
    return { capture, label: `⚠️ TP duluan — ${pct}% dari target`, tone: "warn" };
  if (capture > 0)
    return { capture, label: `😨 TP kepagian (fear?) — cuma ${pct}% dari target`, tone: "bad" };

  // Exit on the losing side — was the stop respected?
  if (sl != null && sl !== e) {
    const lossCapture = (x - e) / (sl - e);
    if (lossCapture > 1.1)
      return { capture, label: "🚨 Exit LEBIH DALAM dari stop — SL tidak dihormati", tone: "bad" };
    if (lossCapture >= 0.9)
      return { capture, label: "🛡️ Kena stop sesuai plan — rugi terkontrol", tone: "neutral" };
    return { capture, label: "✂️ Cut cepat sebelum stop — rugi kecil, tapi cek alasannya", tone: "neutral" };
  }
  return { capture, label: "🛑 Exit di sisi rugi", tone: "bad" };
}

/** Format a planned RR ratio like "1 : 2.5" / "1 : 1.13" (max 2 decimals). */
export function formatRR(rr: number): string {
  return `1 : ${rr.toFixed(2).replace(/\.?0+$/, "")}`;
}

/** Format an R multiple like "+2.5R" / "-1R" / "0R". */
export function formatR(r: number | null | undefined): string {
  if (r == null) return "—";
  const sign = r > 0 ? "+" : "";
  const num = Number.isInteger(r) ? r.toString() : r.toFixed(2).replace(/0$/, "");
  return `${sign}${num}R`;
}

/** Default resultR auto-derived from status when the user hasn't set one. */
export function autoResultR(status: string): number | null {
  if (status === "Loss") return -1;
  if (status === "Break Even") return 0;
  return null; // Win → let the user enter the actual R; Running → none
}

export type TradeStats = {
  total: number;
  closed: number;
  wins: number;
  losses: number;
  breakEven: number;
  running: number;
  winRate: number; // 0..100 over closed decisive trades (win/loss)
  totalR: number;
  avgR: number; // over closed trades with a resultR
};

/** Aggregate stats for a set of trade rows (pure — takes rows already fetched). */
export function computeTradeStats(rows: TradeJournalRow[]): TradeStats {
  let wins = 0,
    losses = 0,
    breakEven = 0,
    running = 0,
    totalR = 0,
    rCount = 0;

  for (const r of rows) {
    if (r.status === "Win") wins++;
    else if (r.status === "Loss") losses++;
    else if (r.status === "Break Even") breakEven++;
    else running++;

    if (r.status !== "Running" && r.resultR != null) {
      totalR += r.resultR;
      rCount++;
    }
  }

  const decisive = wins + losses;
  const closed = wins + losses + breakEven;
  return {
    total: rows.length,
    closed,
    wins,
    losses,
    breakEven,
    running,
    winRate: decisive ? Math.round((wins / decisive) * 100) : 0,
    totalR: Math.round(totalR * 100) / 100,
    avgR: rCount ? Math.round((totalR / rCount) * 100) / 100 : 0,
  };
}
