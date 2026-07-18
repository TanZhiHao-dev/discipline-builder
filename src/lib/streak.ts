// Streak engine — the single source of truth for all habit streak / consistency
// math. Pure & self-contained (no imports) so it can be unit-tested with
// `node --test`. Works on local 'YYYY-MM-DD' date strings to avoid TZ drift.

export type CheckStatus = "done" | "rest" | "sick" | "travel" | "pause";
export const CHECK_STATUSES: CheckStatus[] = [
  "done",
  "rest",
  "sick",
  "travel",
  "pause",
];
// Statuses that PROTECT a streak (preserve, don't increment). `rest` is capped
// by the habit's weekly allowance; the rest are user self-reports (uncapped).
const PROTECTIVE = new Set<CheckStatus>(["rest", "sick", "travel", "pause"]);

export type HabitConfig = {
  scheduleDays: number[]; // 0=Sun … 6=Sat
  restCreditsPerWeek: number;
};

export type StreakResult = {
  current: number;
  best: number;
  lastDoneDate: string | null;
};

// ---- date helpers (local, string-based) -----------------------------------

export function toStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}
export function dow(s: string): number {
  return parse(s).getDay();
}
export function todayStr(): string {
  return toStr(new Date());
}

/** ISO-8601 week key like "2026-W28" — used to bucket rest-day credits. */
export function isoWeekKey(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ---- core -----------------------------------------------------------------

type CheckMap = Record<string, CheckStatus>;

function toMap(
  checkIns: CheckMap | { date: string; status: CheckStatus }[],
): CheckMap {
  if (Array.isArray(checkIns)) {
    const m: CheckMap = {};
    for (const c of checkIns) m[c.date] = c.status;
    return m;
  }
  return checkIns;
}

function isScheduled(config: HabitConfig, date: string): boolean {
  return config.scheduleDays.includes(dow(date));
}

/**
 * Precompute which `rest` days are within the weekly allowance. Within each ISO
 * week the earliest N rest days (N = restCreditsPerWeek) are "allowed"
 * (protective); any beyond that are treated as a miss.
 */
function allowedRestDays(config: HabitConfig, map: CheckMap): Set<string> {
  const byWeek: Record<string, string[]> = {};
  for (const [date, status] of Object.entries(map)) {
    if (status === "rest") (byWeek[isoWeekKey(date)] ??= []).push(date);
  }
  const allowed = new Set<string>();
  for (const dates of Object.values(byWeek)) {
    dates.sort();
    for (let i = 0; i < Math.min(config.restCreditsPerWeek, dates.length); i++) {
      allowed.add(dates[i]);
    }
  }
  return allowed;
}

type DayKind = "count" | "protect" | "miss" | "neutral";

function classify(
  config: HabitConfig,
  map: CheckMap,
  allowedRest: Set<string>,
  date: string,
  today: string,
): DayKind {
  if (!isScheduled(config, date)) return "neutral";
  const status = map[date];
  if (status === "done") return "count";
  if (status && PROTECTIVE.has(status)) {
    if (status === "rest") return allowedRest.has(date) ? "protect" : "miss";
    return "protect";
  }
  // scheduled + no qualifying record: today is still "open", past is a miss
  return date === today ? "neutral" : "miss";
}

export function computeStreaks(
  config: HabitConfig,
  checkIns: CheckMap | { date: string; status: CheckStatus }[],
  today: string = todayStr(),
): StreakResult {
  const map = toMap(checkIns);
  const allowedRest = allowedRestDays(config, map);

  // current streak: walk backward from today until a miss.
  let current = 0;
  let cursor = today;
  for (let i = 0; i < 800; i++) {
    const kind = classify(config, map, allowedRest, cursor, today);
    if (kind === "miss") break;
    if (kind === "count") current++;
    cursor = addDays(cursor, -1);
  }

  // best streak + lastDone: scan forward from earliest record to today.
  const dates = Object.keys(map).sort();
  let lastDoneDate: string | null = null;
  let best = 0;
  if (dates.length) {
    let run = 0;
    let d = dates[0];
    while (d <= today) {
      const kind = classify(config, map, allowedRest, d, today);
      if (kind === "count") {
        run++;
        best = Math.max(best, run);
        lastDoneDate = d;
      } else if (kind === "miss") {
        run = 0;
      }
      // protect / neutral keep the run alive without incrementing
      d = addDays(d, 1);
    }
  }
  best = Math.max(best, current);

  return { current, best, lastDoneDate };
}

export type RangeStats = {
  done: number;
  scheduled: number;
  protectedCount: number;
  missed: number;
  pct: number; // done / scheduled (0-100)
};

/** Aggregate stats over an inclusive date range — used for month/week rings. */
export function rangeStats(
  config: HabitConfig,
  checkIns: CheckMap | { date: string; status: CheckStatus }[],
  from: string,
  to: string,
  today: string = todayStr(),
): RangeStats {
  const map = toMap(checkIns);
  const allowedRest = allowedRestDays(config, map);
  let done = 0;
  let scheduled = 0;
  let protectedCount = 0;
  let missed = 0;
  let d = from;
  for (let i = 0; i < 800 && d <= to; i++) {
    if (isScheduled(config, d)) {
      scheduled++;
      const kind = classify(config, map, allowedRest, d, today);
      if (kind === "count") done++;
      else if (kind === "protect") protectedCount++;
      else if (kind === "miss") missed++;
    }
    d = addDays(d, 1);
  }
  const pct = scheduled ? Math.round((done / scheduled) * 100) : 0;
  return { done, scheduled, protectedCount, missed, pct };
}

/** Sum RangeStats (across habits). */
export function sumStats(list: RangeStats[]): RangeStats {
  const acc = { done: 0, scheduled: 0, protectedCount: 0, missed: 0, pct: 0 };
  for (const s of list) {
    acc.done += s.done;
    acc.scheduled += s.scheduled;
    acc.protectedCount += s.protectedCount;
    acc.missed += s.missed;
  }
  acc.pct = acc.scheduled ? Math.round((acc.done / acc.scheduled) * 100) : 0;
  return acc;
}
