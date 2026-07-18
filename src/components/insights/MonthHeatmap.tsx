import { cn } from "@/lib/utils";

export type DayState = "done" | "partial" | "miss" | "rest" | "none" | "future";

const STATE_CLASS: Record<DayState, string> = {
  done: "bg-done text-white",
  partial: "bg-streak/70 text-white",
  miss: "bg-miss/25 text-miss",
  rest: "bg-muted-foreground/25 text-muted-foreground",
  none: "bg-secondary text-muted-foreground/60",
  future: "border border-dashed border-border text-muted-foreground/40",
};

export function MonthHeatmap({
  monthLabel,
  firstDow,
  days,
}: {
  monthLabel: string;
  firstDow: number; // weekday of the 1st (0=Sun)
  days: { day: number; state: DayState }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{monthLabel}</span>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-done" /> done
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-streak/70" /> partial
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2.5 w-2.5 rounded-sm bg-miss/25" /> miss
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground/60">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((d) => (
          <div
            key={d.day}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-[11px] font-medium tnum",
              STATE_CLASS[d.state],
            )}
          >
            {d.day}
          </div>
        ))}
      </div>
    </div>
  );
}
