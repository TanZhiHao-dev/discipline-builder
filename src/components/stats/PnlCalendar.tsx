import { cn } from "@/lib/utils";
import { formatR } from "@/lib/trade";
import type { CalendarDay } from "@/lib/trade-analytics";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Month grid of daily net-R — green tint on up days, red on down days.
export function PnlCalendar({
  days,
  month,
}: {
  days: CalendarDay[];
  month: string; // 'YYYY-MM'
}) {
  const [y, m] = month.split("-").map(Number);
  const title = `${MONTHS[m - 1]} ${y}`;
  // Weekday (0=Sun) of the 1st → number of leading blanks.
  const leading = new Date(y, m - 1, 1).getDay();
  const blanks = Array.from({ length: leading });

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-bold text-ink">{title} · P&amp;L calendar</h2>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((d) => {
          const up = d.trades > 0 && d.netR > 0;
          const down = d.trades > 0 && d.netR < 0;
          const flat = d.trades > 0 && d.netR === 0;
          return (
            <div
              key={d.date}
              className={cn(
                "flex aspect-square flex-col justify-between rounded-md border p-1.5",
                up && "border-transparent bg-bull/15 text-bull",
                down && "border-transparent bg-bear/15 text-bear",
                flat && "border-border bg-muted text-muted-foreground",
                d.trades === 0 && "border-border/50 text-muted-foreground/60",
              )}
            >
              <span className="text-[10px] font-medium leading-none">{d.day}</span>
              {d.trades > 0 ? (
                <span className="min-w-0">
                  <span className="mono-nums block truncate text-[11px] font-bold leading-tight tabular-nums">
                    {formatR(d.netR)}
                  </span>
                  <span className="block text-[9px] leading-none opacity-70">
                    {d.trades} {d.trades === 1 ? "trade" : "trades"}
                  </span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
