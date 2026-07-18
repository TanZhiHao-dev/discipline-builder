// ICT killzones / trading sessions, defined in New York local time (the ICT
// reference), so they stay correct across DST automatically.

export type SessionAccent = "bull" | "bear" | "warn" | "primary";

export type Session = {
  key: string;
  label: string;
  short: string;
  start: number; // minutes from NY midnight
  end: number;
  accent: SessionAccent;
};

export const SESSIONS: Session[] = [
  { key: "asia", label: "Asian Range", short: "ASIA", start: 20 * 60, end: 24 * 60, accent: "warn" },
  { key: "london", label: "London KZ", short: "LDN", start: 2 * 60, end: 5 * 60, accent: "bull" },
  { key: "nyam", label: "New York AM", short: "NY AM", start: 8 * 60 + 30, end: 11 * 60, accent: "primary" },
  { key: "nypm", label: "New York PM", short: "NY PM", start: 13 * 60 + 30, end: 16 * 60, accent: "bear" },
];

/** Seconds since NY midnight for `now` (DST-correct). */
export function nySecondsOfDay(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const h = get("hour") % 24;
  return h * 3600 + get("minute") * 60 + get("second");
}

export type SessionState = {
  active: Session | null;
  next: Session;
  secToNext: number;
  secRemaining: number | null;
};

export function getSessionState(now: Date): SessionState {
  const cur = nySecondsOfDay(now);
  const active =
    SESSIONS.find((s) => cur >= s.start * 60 && cur < s.end * 60) ?? null;

  let next = SESSIONS[0];
  let secToNext = Infinity;
  for (const s of SESSIONS) {
    let delta = s.start * 60 - cur;
    if (delta <= 0) delta += 86400;
    if (delta < secToNext) {
      secToNext = delta;
      next = s;
    }
  }

  const secRemaining = active ? active.end * 60 - cur : null;
  return { active, next, secToNext, secRemaining };
}

/** "1h 23m" / "12m" / "45s" */
export function fmtCountdown(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2, "0")}s`;
  return `${sec}s`;
}

export const ACCENT_TEXT: Record<SessionAccent, string> = {
  bull: "text-bull",
  bear: "text-bear",
  warn: "text-warn",
  primary: "text-primary",
};
export const ACCENT_BG: Record<SessionAccent, string> = {
  bull: "bg-bull",
  bear: "bg-bear",
  warn: "bg-warn",
  primary: "bg-primary",
};
