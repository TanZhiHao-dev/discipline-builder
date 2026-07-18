// Pure trading-analytics engine (Tradezella-style). Client-safe, no DB imports.
import type { TradeJournalRow } from "@/db/schema";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round2 = (n: number) => Math.round(n * 100) / 100;
const pad = (n: number) => String(n).padStart(2, "0");

/** Local YYYY-MM-DD for a trade — the user-set `date` when present, else the
 *  createdAt timestamp. */
export function tradeDate(r: TradeJournalRow): string {
  if (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) return r.date;
  const d = new Date(r.createdAt);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Effective date in ms (user `date` or createdAt) — for sorting/day-of-week. */
function effectiveMs(r: TradeJournalRow): number {
  if (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
    const t = Date.parse(r.date + "T00:00:00");
    if (Number.isFinite(t)) return t;
  }
  return new Date(r.createdAt).getTime();
}

export function parseTags(csv: string): string[] {
  return (csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A trade counts toward performance once it's closed with a recorded R. */
export function isMeasured(r: TradeJournalRow): boolean {
  return r.status !== "Running" && r.resultR != null;
}

export type Advanced = {
  count: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number; // % over win+loss
  netR: number;
  grossProfitR: number;
  grossLossR: number; // positive magnitude
  profitFactor: number | null; // null = no losses yet
  expectancy: number; // avg R per measured trade
  avgWinR: number;
  avgLossR: number; // negative
  maxWinStreak: number;
  maxLossStreak: number;
  maxDrawdownR: number; // positive magnitude of largest peak→trough on cum-R
  bestDay: { date: string; r: number } | null;
  worstDay: { date: string; r: number } | null;
  greenDays: number;
  totalDays: number;
};

function chrono(rows: TradeJournalRow[]): TradeJournalRow[] {
  return [...rows].sort((a, b) => effectiveMs(a) - effectiveMs(b));
}

export function computeAdvanced(all: TradeJournalRow[]): Advanced {
  const rows = chrono(all.filter(isMeasured));
  let wins = 0,
    losses = 0,
    breakEven = 0,
    grossProfit = 0,
    grossLoss = 0,
    netR = 0;
  let winStreak = 0,
    lossStreak = 0,
    maxWinStreak = 0,
    maxLossStreak = 0;

  // cumulative-R drawdown
  let cum = 0,
    peak = 0,
    maxDD = 0;
  const dayMap = new Map<string, number>();

  for (const r of rows) {
    const v = r.resultR ?? 0;
    netR += v;
    if (r.status === "Win") {
      wins++;
      grossProfit += Math.max(0, v);
      winStreak++;
      lossStreak = 0;
    } else if (r.status === "Loss") {
      losses++;
      grossLoss += Math.abs(Math.min(0, v));
      lossStreak++;
      winStreak = 0;
    } else {
      breakEven++;
      winStreak = 0;
      lossStreak = 0;
    }
    maxWinStreak = Math.max(maxWinStreak, winStreak);
    maxLossStreak = Math.max(maxLossStreak, lossStreak);

    cum += v;
    peak = Math.max(peak, cum);
    maxDD = Math.max(maxDD, peak - cum);

    const dk = tradeDate(r);
    dayMap.set(dk, (dayMap.get(dk) ?? 0) + v);
  }

  const decisive = wins + losses;
  const count = rows.length;
  let bestDay: Advanced["bestDay"] = null;
  let worstDay: Advanced["worstDay"] = null;
  let greenDays = 0;
  for (const [date, r] of dayMap) {
    if (r > 0) greenDays++;
    if (!bestDay || r > bestDay.r) bestDay = { date, r: round2(r) };
    if (!worstDay || r < worstDay.r) worstDay = { date, r: round2(r) };
  }

  return {
    count,
    wins,
    losses,
    breakEven,
    winRate: decisive ? Math.round((wins / decisive) * 100) : 0,
    netR: round2(netR),
    grossProfitR: round2(grossProfit),
    grossLossR: round2(grossLoss),
    profitFactor: grossLoss > 0 ? round2(grossProfit / grossLoss) : null,
    expectancy: count ? round2(netR / count) : 0,
    avgWinR: wins ? round2(grossProfit / wins) : 0,
    avgLossR: losses ? round2(-grossLoss / losses) : 0,
    maxWinStreak,
    maxLossStreak,
    maxDrawdownR: round2(maxDD),
    bestDay,
    worstDay,
    greenDays,
    totalDays: dayMap.size,
  };
}

// R-multiple distribution histogram.
export const R_BUCKETS = [
  { key: "≤-2R", min: -Infinity, max: -2 },
  { key: "-2..-1R", min: -2, max: -1 },
  { key: "-1..0R", min: -1, max: 0 },
  { key: "0..1R", min: 0, max: 1 },
  { key: "1..2R", min: 1, max: 2 },
  { key: "2..3R", min: 2, max: 3 },
  { key: "≥3R", min: 3, max: Infinity },
] as const;

export function rDistribution(all: TradeJournalRow[]): { key: string; count: number }[] {
  const rows = all.filter(isMeasured);
  return R_BUCKETS.map((b) => ({
    key: b.key,
    count: rows.filter((r) => {
      const v = r.resultR ?? 0;
      return v >= b.min && (b.max === Infinity ? true : v < b.max);
    }).length,
  }));
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function byDayOfWeek(
  all: TradeJournalRow[],
): { day: string; trades: number; netR: number; winRate: number }[] {
  const rows = all.filter(isMeasured);
  return DOW.map((day, i) => {
    const dr = rows.filter((r) => new Date(effectiveMs(r)).getDay() === i);
    const wins = dr.filter((r) => r.status === "Win").length;
    const losses = dr.filter((r) => r.status === "Loss").length;
    return {
      day,
      trades: dr.length,
      netR: round2(dr.reduce((s, r) => s + (r.resultR ?? 0), 0)),
      winRate: wins + losses ? Math.round((wins / (wins + losses)) * 100) : 0,
    };
  }).filter((d) => d.trades > 0);
}

export type GroupStat = {
  key: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  netR: number;
  expectancy: number;
};

/** Generic breakdown by any key extractor (asset, method, grade, tag, playbook). */
export function groupBy(
  all: TradeJournalRow[],
  keyFn: (r: TradeJournalRow) => string[] | string,
): GroupStat[] {
  const rows = all.filter(isMeasured);
  const map = new Map<string, TradeJournalRow[]>();
  for (const r of rows) {
    const keys = keyFn(r);
    const list = Array.isArray(keys) ? keys : [keys];
    for (const k of list) {
      if (!k) continue;
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
  }
  return [...map.entries()]
    .map(([key, list]) => {
      const wins = list.filter((r) => r.status === "Win").length;
      const losses = list.filter((r) => r.status === "Loss").length;
      const netR = list.reduce((s, r) => s + (r.resultR ?? 0), 0);
      return {
        key,
        trades: list.length,
        wins,
        losses,
        winRate: wins + losses ? Math.round((wins / (wins + losses)) * 100) : 0,
        netR: round2(netR),
        expectancy: list.length ? round2(netR / list.length) : 0,
      };
    })
    .sort((a, b) => b.netR - a.netR);
}

// ---- Discipline Score (0–100 composite) ----
export type ScoreBreakdown = {
  overall: number;
  parts: { key: string; label: string; score: number; weight: number }[];
};

/**
 * Blends trading performance with rule/habit adherence — the thing that makes
 * this a *discipline* score, not just a P&L score. `habitAdherence` is the
 * user's habit completion rate this period (0–100); pass null if unknown.
 */
export function disciplineScore(
  adv: Advanced,
  habitAdherence: number | null,
): ScoreBreakdown {
  const winRateScore = clamp(adv.winRate);
  const pfScore =
    adv.profitFactor == null
      ? adv.count > 0
        ? 100 // all wins, no losses
        : 0
      : clamp((adv.profitFactor / 2) * 100); // PF 2.0 → 100
  const expScore = clamp(50 + adv.expectancy * 40); // +1.25R → 100, −1.25R → 0
  const riskScore = clamp(100 - adv.maxDrawdownR * 10); // DD 10R → 0
  const consistency = adv.totalDays
    ? clamp((adv.greenDays / adv.totalDays) * 100)
    : 0;
  const adherence = habitAdherence == null ? null : clamp(habitAdherence);

  const parts = [
    { key: "winRate", label: "Win rate", score: Math.round(winRateScore), weight: 15 },
    { key: "pf", label: "Profit factor", score: Math.round(pfScore), weight: 20 },
    { key: "expectancy", label: "Expectancy", score: Math.round(expScore), weight: 20 },
    { key: "risk", label: "Risk control", score: Math.round(riskScore), weight: 15 },
    { key: "consistency", label: "Consistency", score: Math.round(consistency), weight: 15 },
    ...(adherence != null
      ? [{ key: "adherence", label: "Rule adherence", score: Math.round(adherence), weight: 15 }]
      : []),
  ];

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0);
  const overall =
    adv.count === 0
      ? 0
      : Math.round(parts.reduce((s, p) => s + p.score * p.weight, 0) / totalWeight);

  return { overall, parts };
}

export function scoreLabel(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: "Elite", tone: "text-done" };
  if (score >= 65) return { label: "Disciplined", tone: "text-done" };
  if (score >= 50) return { label: "Developing", tone: "text-warn" };
  if (score >= 30) return { label: "Inconsistent", tone: "text-warn" };
  return { label: "Needs work", tone: "text-destructive" };
}

// ---- P&L calendar ----
export type CalendarDay = {
  day: number;
  date: string;
  netR: number;
  trades: number;
  wins: number;
  losses: number;
};

export function calendarData(all: TradeJournalRow[], month: string): CalendarDay[] {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const rows = all.filter(isMeasured);
  const out: CalendarDay[] = [];
  for (let d = 1; d <= days; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const dr = rows.filter((r) => tradeDate(r) === date);
    out.push({
      day: d,
      date,
      netR: round2(dr.reduce((s, r) => s + (r.resultR ?? 0), 0)),
      trades: dr.length,
      wins: dr.filter((r) => r.status === "Win").length,
      losses: dr.filter((r) => r.status === "Loss").length,
    });
  }
  return out;
}
