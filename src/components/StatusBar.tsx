"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import {
  ACCENT_BG,
  ACCENT_TEXT,
  fmtCountdown,
  getSessionState,
  type SessionState,
} from "@/lib/sessions";
import { openTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

function clock(now: Date, tz?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

// Bottom terminal status bar: live session state + multi-timezone clocks.
export function StatusBar() {
  const [now, setNow] = useState<Date | null>(null);
  const [ses, setSes] = useState<SessionState | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d);
      setSes(getSessionState(d));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mono-nums flex h-7 shrink-0 items-center gap-3 border-t border-border bg-background px-3 text-[11px] text-muted-foreground">
      {/* Session state */}
      <button
        onClick={() => openTool("sessions")}
        className="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-accent"
        title="Open Killzones"
      >
        {ses?.active ? (
          <>
            <span
              className={cn(
                "h-1.5 w-1.5 animate-pulse rounded-full",
                ACCENT_BG[ses.active.accent],
              )}
            />
            <span className={cn("font-semibold", ACCENT_TEXT[ses.active.accent])}>
              {ses.active.label}
            </span>
            {ses.secRemaining != null ? (
              <span className="text-muted-foreground">
                · {fmtCountdown(ses.secRemaining)} left
              </span>
            ) : null}
          </>
        ) : ses ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            <span>No killzone</span>
            <span className="text-muted-foreground/70">
              · {ses.next.short} in {fmtCountdown(ses.secToNext)}
            </span>
          </>
        ) : (
          <span>—</span>
        )}
      </button>

      <div className="ml-auto flex items-center gap-3">
        {now ? (
          <>
            <span>
              <span className="text-muted-foreground/60">NY</span>{" "}
              {clock(now, "America/New_York")}
            </span>
            <span className="hidden sm:inline">
              <span className="text-muted-foreground/60">LDN</span>{" "}
              {clock(now, "Europe/London")}
            </span>
            <span>
              <span className="text-muted-foreground/60">UTC</span>{" "}
              {clock(now, "UTC")}
            </span>
            <span className="hidden md:inline">
              <span className="text-muted-foreground/60">LOCAL</span>{" "}
              {clock(now)}
            </span>
          </>
        ) : null}
        <span className="flex items-center gap-1 text-bull">
          <Radio className="h-3 w-3" />
          LIVE
        </span>
      </div>
    </footer>
  );
}
