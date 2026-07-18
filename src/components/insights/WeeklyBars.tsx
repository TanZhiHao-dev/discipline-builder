import { cn } from "@/lib/utils";

export function WeeklyBars({
  weeks,
}: {
  weeks: { label: string; pct: number }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold">Weekly consistency</div>
      <div className="flex items-end justify-between gap-2" style={{ height: 130 }}>
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-md transition-all",
                  w.pct >= 80 ? "bg-done" : w.pct >= 50 ? "bg-streak" : "bg-primary/60",
                )}
                style={{ height: `${Math.max(4, w.pct)}%` }}
                title={`${w.pct}%`}
              />
            </div>
            <span className="tnum text-[10px] font-medium text-muted-foreground">
              {w.pct}%
            </span>
            <span className="text-[10px] text-muted-foreground/70">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
