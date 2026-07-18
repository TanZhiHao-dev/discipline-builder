"use client";

import { useEffect, useState } from "react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  fmtCountdown,
  getSessionState,
  nySecondsOfDay,
  SESSIONS,
  type SessionState,
} from "@/lib/sessions";
import { cn } from "@/lib/utils";

const pad = (n: number) => n.toString().padStart(2, "0");
const hm = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;

// Full killzone view: a 24h NY-time timeline with session blocks + a live "now"
// marker, plus a per-session status list.
export function KillzoneBoard() {
  const [ses, setSes] = useState<SessionState | null>(null);
  const [nowSec, setNowSec] = useState(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setSes(getSessionState(d));
      setNowSec(nySecondsOfDay(d));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const nowPct = (nowSec / 86400) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Timeline · New York</span>
          <span className="mono-nums">{hm(Math.floor(nowSec / 60))} NY</span>
        </div>
        {/* 24h timeline */}
        <div className="relative h-9 overflow-hidden rounded-md border border-border bg-muted/40">
          {SESSIONS.map((s) => (
            <div
              key={s.key}
              className={cn(
                "absolute top-0 h-full opacity-70",
                ACCENT_BG[s.accent],
              )}
              style={{
                left: `${(s.start / 1440) * 100}%`,
                width: `${((s.end - s.start) / 1440) * 100}%`,
              }}
              title={`${s.label} ${hm(s.start)}–${hm(s.end)}`}
            />
          ))}
          {/* now marker */}
          <div
            className="absolute top-0 h-full w-px bg-foreground"
            style={{ left: `${nowPct}%` }}
          >
            <div className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-foreground" />
          </div>
        </div>
        <div className="mono-nums mt-1 flex justify-between text-[9px] text-muted-foreground/60">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {SESSIONS.map((s) => {
          const isActive = ses?.active?.key === s.key;
          const isNext = !ses?.active && ses?.next.key === s.key;
          return (
            <div
              key={s.key}
              className={cn(
                "flex items-center gap-2.5 rounded-md border px-3 py-2",
                isActive
                  ? "border-border bg-accent"
                  : "border-transparent bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  ACCENT_BG[s.accent],
                  isActive && "animate-pulse",
                )}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="mono-nums text-[11px] text-muted-foreground">
                  {hm(s.start)}–{hm(s.end)} NY
                </div>
              </div>
              <div className="ml-auto text-right text-xs">
                {isActive ? (
                  <span className={cn("font-semibold", ACCENT_TEXT[s.accent])}>
                    ACTIVE · {fmtCountdown(ses!.secRemaining ?? 0)} left
                  </span>
                ) : isNext ? (
                  <span className="text-muted-foreground">
                    starts in {fmtCountdown(ses!.secToNext)}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
