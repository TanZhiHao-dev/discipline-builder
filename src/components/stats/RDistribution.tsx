import { cn } from "@/lib/utils";

// Vertical bar histogram of the R-multiple distribution (7 buckets).
// Buckets left of 0R are losing outcomes (bear), right are winning (bull).
export function RDistribution({ dist }: { dist: { key: string; count: number }[] }) {
  const max = Math.max(1, ...dist.map((d) => d.count));
  const isLoss = (key: string) => key.startsWith("≤") || key === "-2..-1R" || key === "-1..0R";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-bold text-ink">R-multiple distribution</h2>
      <div className="flex h-40 items-end gap-2">
        {dist.map((d) => {
          const loss = isLoss(d.key);
          const h = (d.count / max) * 100;
          return (
            <div key={d.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="mono-nums text-[11px] font-bold tabular-nums text-ink">
                {d.count}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t",
                    d.count === 0 ? "bg-muted" : loss ? "bg-bear" : "bg-bull",
                  )}
                  style={{ height: `${Math.max(d.count === 0 ? 2 : 4, h)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {dist.map((d) => (
          <div
            key={d.key}
            className="min-w-0 flex-1 text-center text-[10px] leading-tight text-muted-foreground"
          >
            {d.key}
          </div>
        ))}
      </div>
    </div>
  );
}
