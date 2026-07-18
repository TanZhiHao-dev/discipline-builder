// Pure period helpers for weekly / monthly / yearly trading reviews.
// No DB, no browser APIs — safe to import from client or server.

export type Period = "weekly" | "monthly" | "yearly";

export const PERIODS: { key: Period; label: string; noun: string }[] = [
  { key: "weekly", label: "This week", noun: "week" },
  { key: "monthly", label: "This month", noun: "month" },
  { key: "yearly", label: "This year", noun: "year" },
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ISO-8601 week number + its week-year (Mon-based; week 1 holds the year's first
// Thursday). Uses the date's local Y/M/D.
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { year: d.getUTCFullYear(), week };
}

/** The period key a given date falls in. */
export function periodKeyOf(period: Period, date: Date): string {
  if (period === "weekly") {
    const { year, week } = isoWeek(date);
    return `${year}-W${pad2(week)}`;
  }
  if (period === "monthly") {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  }
  return `${date.getFullYear()}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Human label for a period key, e.g. "Week 29 · 2026" / "July 2026" / "2026". */
export function periodLabel(period: Period, key: string): string {
  if (period === "weekly") {
    const [y, w] = key.split("-W");
    return `Week ${Number(w)} · ${y}`;
  }
  if (period === "monthly") {
    const [y, m] = key.split("-");
    return `${MONTH_NAMES[Number(m) - 1] ?? m} ${y}`;
  }
  return key;
}
