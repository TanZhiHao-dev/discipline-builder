import { cn } from "@/lib/utils";

// Cumulative-R equity curve. Pure SVG (no client JS). `points` is the running
// sum of R after each closed trade, oldest → newest.
export function EquityCurve({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Need at least 2 closed trades to draw an equity curve.
      </div>
    );
  }

  const W = 800;
  const H = 200;
  const pad = 10;
  const series = [0, ...points]; // start from 0R baseline
  const min = Math.min(0, ...series);
  const max = Math.max(0, ...series);
  const range = max - min || 1;

  const x = (i: number) => pad + (i / (series.length - 1)) * (W - 2 * pad);
  const y = (v: number) => H - pad - ((v - min) / range) * (H - 2 * pad);

  const linePts = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${y(min)} ${linePts} ${x(series.length - 1)},${y(min)}`;
  const last = points[points.length - 1];
  const up = last >= 0;
  const zeroY = y(0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Equity Curve · Cumulative R
        </span>
        <span
          className={cn(
            "mono-nums text-sm font-bold tabular-nums",
            up ? "text-bull" : "text-bear",
          )}
        >
          {last > 0 ? "+" : ""}
          {last.toFixed(2)}R
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={cn("h-[180px] w-full", up ? "text-bull" : "text-bear")}
      >
        <defs>
          <linearGradient id="eqfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* zero baseline */}
        <line
          x1={pad}
          x2={W - pad}
          y1={zeroY}
          y2={zeroY}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <polygon points={areaPts} fill="url(#eqfill)" />
        <polyline
          points={linePts}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={x(series.length - 1)} cy={y(last)} r="3.5" fill="currentColor" />
      </svg>
    </div>
  );
}
