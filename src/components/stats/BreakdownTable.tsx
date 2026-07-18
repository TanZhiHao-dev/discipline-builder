import { cn } from "@/lib/utils";
import { formatR } from "@/lib/trade";
import type { GroupStat } from "@/lib/trade-analytics";

// Shared breakdown table for by-playbook / asset / grade / tag / method.
export function BreakdownTable({
  title,
  keyLabel,
  rows,
}: {
  title: string;
  keyLabel: string;
  rows: GroupStat[];
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-ink">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">{keyLabel}</th>
              <th className="px-4 py-2 text-right font-medium">Trades</th>
              <th className="px-4 py-2 text-right font-medium">W / L</th>
              <th className="px-4 py-2 text-right font-medium">Win %</th>
              <th className="px-4 py-2 text-right font-medium">Net R</th>
              <th className="px-4 py-2 text-right font-medium">Expectancy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.key} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-ink">{g.key}</td>
                <td className="mono-nums px-4 py-2.5 text-right tabular-nums">
                  {g.trades}
                </td>
                <td className="mono-nums px-4 py-2.5 text-right tabular-nums">
                  <span className="text-bull">{g.wins}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-bear">{g.losses}</span>
                </td>
                <td className="mono-nums px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                  {g.wins + g.losses ? `${g.winRate}%` : "—"}
                </td>
                <td
                  className={cn(
                    "mono-nums px-4 py-2.5 text-right font-semibold tabular-nums",
                    g.netR > 0 ? "text-bull" : g.netR < 0 ? "text-bear" : "",
                  )}
                >
                  {formatR(g.netR)}
                </td>
                <td
                  className={cn(
                    "mono-nums px-4 py-2.5 text-right tabular-nums",
                    g.expectancy > 0
                      ? "text-bull"
                      : g.expectancy < 0
                        ? "text-bear"
                        : "text-muted-foreground",
                  )}
                >
                  {formatR(g.expectancy)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
