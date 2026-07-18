import { cn } from "@/lib/utils";
import { scoreLabel, type ScoreBreakdown } from "@/lib/trade-analytics";

// Color a 0–100 sub-score: green when strong, amber mid, red weak.
function toneClass(score: number): string {
  if (score >= 65) return "text-bull";
  if (score >= 40) return "text-warn";
  return "text-bear";
}
function barBg(score: number): string {
  if (score >= 65) return "bg-bull";
  if (score >= 40) return "bg-warn";
  return "bg-bear";
}

// Discipline Score hero — big gauge + a breakdown of the weighted legs.
export function DisciplineScoreCard({ score }: { score: ScoreBreakdown }) {
  const { label, tone } = scoreLabel(score.overall);
  const size = 132;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score.overall));
  const offset = c - (clamped / 100) * c;
  const ringColor = toneClass(score.overall);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Gauge */}
        <div className="flex shrink-0 items-center gap-4">
          <div
            className={cn("relative inline-flex items-center justify-center", ringColor)}
            style={{ width: size, height: size }}
          >
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                className="opacity-15"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="mono-nums text-4xl font-bold leading-none tabular-nums text-ink">
                {score.overall}
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                / 100
              </span>
            </div>
          </div>
          <div className="sm:hidden">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Discipline Score
            </div>
            <div className={cn("font-headline text-xl font-medium", tone)}>{label}</div>
          </div>
        </div>

        {/* Legs */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 hidden sm:block">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Discipline Score
            </div>
            <div className={cn("font-headline text-2xl font-medium", tone)}>{label}</div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {score.parts.map((p) => (
              <div key={p.key}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-ink">{p.label}</span>
                  <span className="mono-nums tabular-nums text-muted-foreground">
                    <span className={toneClass(p.score)}>{p.score}</span>
                    <span className="opacity-50"> · {p.weight}%</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", barBg(p.score))}
                    style={{ width: `${Math.max(0, Math.min(100, p.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Blends win rate, profit factor, expectancy, risk control, and consistency
        with your habit &ldquo;rule adherence&rdquo; — discipline, not just P&amp;L.
      </p>
    </div>
  );
}
