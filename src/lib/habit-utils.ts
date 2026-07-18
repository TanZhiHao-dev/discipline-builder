// Shared pure helpers + display config for habits (safe for client & server).
import type { HabitRow } from "@/db/schema";
import type { HabitConfig } from "@/lib/streak";

export const TIME_OF_DAY = [
  { key: "morning", label: "Morning", emoji: "🌅" },
  { key: "afternoon", label: "Afternoon", emoji: "☀️" },
  { key: "evening", label: "Evening", emoji: "🌙" },
  { key: "anytime", label: "Anytime", emoji: "⏳" },
] as const;
export type TimeOfDay = (typeof TIME_OF_DAY)[number]["key"];

export const WEEKDAYS = [
  { n: 1, short: "Mon" },
  { n: 2, short: "Tue" },
  { n: 3, short: "Wed" },
  { n: 4, short: "Thu" },
  { n: 5, short: "Fri" },
  { n: 6, short: "Sat" },
  { n: 0, short: "Sun" },
] as const;

// Pastel accent palette (keys map to --color-cat-* tokens in globals.css).
export const HABIT_COLORS: Record<
  string,
  { label: string; dot: string; soft: string; text: string; ring: string }
> = {
  lavender: { label: "Lavender", dot: "bg-cat-lavender", soft: "bg-cat-lavender/12", text: "text-cat-lavender", ring: "ring-cat-lavender/40" },
  pink: { label: "Pink", dot: "bg-cat-pink", soft: "bg-cat-pink/12", text: "text-cat-pink", ring: "ring-cat-pink/40" },
  green: { label: "Green", dot: "bg-cat-green", soft: "bg-cat-green/12", text: "text-cat-green", ring: "ring-cat-green/40" },
  blue: { label: "Blue", dot: "bg-cat-blue", soft: "bg-cat-blue/12", text: "text-cat-blue", ring: "ring-cat-blue/40" },
  amber: { label: "Amber", dot: "bg-cat-amber", soft: "bg-cat-amber/12", text: "text-cat-amber", ring: "ring-cat-amber/40" },
  teal: { label: "Teal", dot: "bg-cat-teal", soft: "bg-cat-teal/12", text: "text-cat-teal", ring: "ring-cat-teal/40" },
};
export const COLOR_KEYS = Object.keys(HABIT_COLORS);
export const habitColor = (key: string) =>
  HABIT_COLORS[key] ?? HABIT_COLORS.lavender;

export const HABIT_ICONS = [
  "✅", "💧", "🏃", "🧘", "📚", "🥗", "😴", "🚭", "💪", "✍️",
  "🧠", "☕", "🎯", "🌱", "🎸", "💊", "🦷", "📵", "🚶", "🧊",
];

export function parseScheduleDays(csv: string): number[] {
  return csv
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

export function toHabitConfig(row: Pick<HabitRow, "scheduleDays" | "restCreditsPerWeek">): HabitConfig {
  return {
    scheduleDays: parseScheduleDays(row.scheduleDays),
    restCreditsPerWeek: row.restCreditsPerWeek,
  };
}

export function scheduleLabel(csv: string): string {
  const days = parseScheduleDays(csv);
  if (days.length === 7) return "Every day";
  const isWeekdays = [1, 2, 3, 4, 5].every((d) => days.includes(d)) && days.length === 5;
  if (isWeekdays) return "Weekdays";
  const isWeekend = days.length === 2 && days.includes(0) && days.includes(6);
  if (isWeekend) return "Weekends";
  return days
    .map((d) => WEEKDAYS.find((w) => w.n === d)?.short)
    .filter(Boolean)
    .join(" · ");
}
