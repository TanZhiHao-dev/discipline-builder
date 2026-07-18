import Link from "next/link";
import { getTrades, getPlaybooks } from "@/lib/trade-queries";
import { getHabitAdherence } from "@/lib/queries";
import type { TradeJournalRow } from "@/db/schema";
import { StatCard, type StatTone } from "@/components/StatCard";
import { EquityCurve } from "@/components/EquityCurve";
import { DisciplineScoreCard } from "@/components/stats/DisciplineScoreCard";
import { PnlCalendar } from "@/components/stats/PnlCalendar";
import { RDistribution } from "@/components/stats/RDistribution";
import { BreakdownTable } from "@/components/stats/BreakdownTable";
import {
  computeAdvanced,
  calendarData,
  rDistribution,
  byDayOfWeek,
  disciplineScore,
  groupBy,
  parseTags,
} from "@/lib/trade-analytics";
import { formatR, tradeDateMs } from "@/lib/trade";
import { todayStr } from "@/lib/streak";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIODS: { key: Period; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function bucketOf(
  date: Date,
  period: Period,
): { key: string; label: string; sortTs: number } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  if (period === "yearly") {
    return { key: `${y}`, label: `${y}`, sortTs: new Date(y, 0, 1).getTime() };
  }
  if (period === "monthly") {
    return {
      key: `${y}-${m}`,
      label: `${MONTHS[m]} ${y}`,
      sortTs: new Date(y, m, 1).getTime(),
    };
  }
  if (period === "weekly") {
    const dt = new Date(y, m, d);
    const dow = (dt.getDay() + 6) % 7; // 0 = Monday
    dt.setDate(dt.getDate() - dow);
    return {
      key: `w-${dt.getTime()}`,
      label: `Week of ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`,
      sortTs: dt.getTime(),
    };
  }
  return {
    key: `${y}-${m}-${d}`,
    label: `${d} ${MONTHS[m]} ${y}`,
    sortTs: new Date(y, m, d).getTime(),
  };
}

type Agg = {
  trades: number;
  wins: number;
  losses: number;
  plusR: number;
  minusR: number;
  netR: number;
};

const emptyAgg = (): Agg => ({
  trades: 0,
  wins: 0,
  losses: 0,
  plusR: 0,
  minusR: 0,
  netR: 0,
});

function accumulate(agg: Agg, row: TradeJournalRow) {
  if (row.resultR == null) return;
  agg.trades += 1;
  if (row.status === "Win") agg.wins += 1;
  if (row.status === "Loss") agg.losses += 1;
  const r = row.resultR;
  agg.netR += r;
  if (r > 0) agg.plusR += r;
  if (r < 0) agg.minusR += r;
}

const fmtR = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}R`;
const winRate = (a: Agg) => {
  const closed = a.wins + a.losses;
  return closed ? Math.round((a.wins / closed) * 100) : null;
};

const GRADE_ORDER = ["A", "B", "C", "D", "F"];
const gradeRank = (k: string) => {
  const i = GRADE_ORDER.indexOf(k);
  return i === -1 ? GRADE_ORDER.length : i;
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const rows = await getTrades("live");
  const sp = await searchParams;
  const period = (PERIODS.find((p) => p.key === sp.period)?.key ??
    "monthly") as Period;

  // ---- Advanced analytics (Tradezella-style) ----
  const month = todayStr().slice(0, 7); // 'YYYY-MM'
  const [my, mm] = month.split("-").map(Number);
  const lastDay = new Date(my, mm, 0).getDate();

  const adv = computeAdvanced(rows);
  const calendar = calendarData(rows, month);
  const dist = rDistribution(rows);
  const dow = byDayOfWeek(rows);
  const adherence = await getHabitAdherence(
    `${month}-01`,
    `${month}-${String(lastDay).padStart(2, "0")}`,
  );
  const score = disciplineScore(adv, adherence);

  const playbooks = await getPlaybooks();
  const pbName = new Map(playbooks.map((p) => [p.id, p.name] as const));
  const byPlaybook = groupBy(rows, (r) => {
    const n = pbName.get(r.playbookId ?? "");
    return n ? n : "—";
  });
  const byAsset = groupBy(rows, (r) => r.asset);
  const byGrade = groupBy(rows, (r) => r.grade ?? "—").sort(
    (a, b) => gradeRank(a.key) - gradeRank(b.key),
  );
  const byTag = groupBy(rows, (r) => parseTags(r.tags));
  const byMethod = groupBy(rows, (r) => r.method || "—");

  const empty = adv.count === 0;

  // ---- Existing period / method aggregation (kept) ----
  const closed = rows.filter(
    (r) =>
      r.status === "Win" || r.status === "Loss" || r.status === "Break Even",
  );

  const bucketMap = new Map<string, Agg & { label: string; sortTs: number }>();
  for (const r of closed) {
    const b = bucketOf(new Date(tradeDateMs(r)), period);
    let entry = bucketMap.get(b.key);
    if (!entry) {
      entry = { ...emptyAgg(), label: b.label, sortTs: b.sortTs };
      bucketMap.set(b.key, entry);
    }
    accumulate(entry, r);
  }
  const buckets = [...bucketMap.values()].sort((a, b) => b.sortTs - a.sortTs);

  // Equity curve — cumulative R over measured trades (oldest → newest).
  const eqPoints: number[] = [];
  let run = 0;
  for (const r of [...closed].reverse()) {
    if (r.resultR == null) continue;
    run += r.resultR;
    eqPoints.push(run);
  }

  const metricCards: {
    label: string;
    value: string | number;
    tone?: StatTone;
    hint?: string;
  }[] = [
    {
      label: "Net R",
      value: fmtR(adv.netR),
      tone: adv.netR > 0 ? "bull" : adv.netR < 0 ? "bear" : "neutral",
    },
    {
      label: "Profit factor",
      value: adv.profitFactor == null ? "∞" : adv.profitFactor.toFixed(2),
      tone:
        adv.profitFactor == null || adv.profitFactor >= 1.5
          ? "bull"
          : adv.profitFactor >= 1
            ? "neutral"
            : "bear",
    },
    {
      label: "Expectancy",
      value: formatR(adv.expectancy),
      tone: adv.expectancy > 0 ? "bull" : adv.expectancy < 0 ? "bear" : "neutral",
      hint: "per trade",
    },
    {
      label: "Max drawdown",
      value: formatR(-adv.maxDrawdownR),
      tone: "bear",
    },
    {
      label: "Win streak",
      value: adv.maxWinStreak,
      tone: "bull",
      hint: "best",
    },
    {
      label: "Avg win / loss",
      value: `${formatR(adv.avgWinR)} / ${formatR(adv.avgLossR)}`,
    },
  ];

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-headline text-3xl font-medium text-ink">
            Trading stats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discipline, R performance, and setup edge — from your journal.
          </p>
        </div>

        {/* Discipline Score hero */}
        <div className="mb-6">
          <DisciplineScoreCard score={score} />
        </div>

        {empty ? (
          <div className="mb-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            No closed trades yet — mark Win/Loss in the{" "}
            <Link href="/journal" className="font-medium text-brand underline">
              Journal
            </Link>
            .
          </div>
        ) : (
          <>
            {/* Advanced metric cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {metricCards.map((s) => (
                <StatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  tone={s.tone}
                  hint={s.hint}
                />
              ))}
            </div>

            {/* P&L calendar */}
            <div className="mb-6">
              <PnlCalendar days={calendar} month={month} />
            </div>

            {/* R-distribution + day of week */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <RDistribution dist={dist} />
              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="mb-3 text-sm font-bold text-ink">By day of week</h2>
                <div className="space-y-2">
                  {dow.map((d) => {
                    const maxAbs = Math.max(
                      1,
                      ...dow.map((x) => Math.abs(x.netR)),
                    );
                    const pct = (Math.abs(d.netR) / maxAbs) * 100;
                    const up = d.netR > 0;
                    return (
                      <div key={d.day} className="flex items-center gap-3 text-xs">
                        <span className="w-9 shrink-0 font-medium text-ink">
                          {d.day}
                        </span>
                        <div className="flex h-2 flex-1 items-center">
                          <div className="h-full w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                up ? "bg-bull" : d.netR < 0 ? "bg-bear" : "bg-muted",
                              )}
                              style={{ width: `${Math.max(2, pct)}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-14 shrink-0 text-right text-muted-foreground">
                          {d.trades}t · {d.winRate}%
                        </span>
                        <span
                          className={cn(
                            "mono-nums w-16 shrink-0 text-right font-semibold tabular-nums",
                            up ? "text-bull" : d.netR < 0 ? "text-bear" : "",
                          )}
                        >
                          {formatR(d.netR)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Equity curve */}
        <div className="mb-6">
          <EquityCurve points={eqPoints} />
        </div>

        {/* Period toggle */}
        <div className="mb-3 inline-flex rounded-md border border-border p-0.5">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`/stats?period=${p.key}`}
              className={cn(
                "rounded px-3 py-1 text-xs font-semibold transition-colors",
                period === p.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {/* Period table */}
        <div className="mb-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Period</th>
                <th className="px-4 py-2 text-right font-medium">Trades</th>
                <th className="px-4 py-2 text-right font-medium">W / L</th>
                <th className="px-4 py-2 text-right font-medium">Win %</th>
                <th className="px-4 py-2 text-right font-medium">+R</th>
                <th className="px-4 py-2 text-right font-medium">−R</th>
                <th className="px-4 py-2 text-right font-medium">Net R</th>
              </tr>
            </thead>
            <tbody>
              {buckets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No closed trades yet. Mark a Win/Loss in the Journal first.
                  </td>
                </tr>
              ) : (
                buckets.map((b) => (
                  <tr
                    key={b.label}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium">{b.label}</td>
                    <td className="mono-nums px-4 py-2.5 text-right tabular-nums">
                      {b.trades}
                    </td>
                    <td className="mono-nums px-4 py-2.5 text-right tabular-nums">
                      <span className="text-bull">{b.wins}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-bear">{b.losses}</span>
                    </td>
                    <td className="mono-nums px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {winRate(b) === null ? "—" : `${winRate(b)}%`}
                    </td>
                    <td className="mono-nums px-4 py-2.5 text-right tabular-nums text-bull">
                      {b.plusR ? fmtR(b.plusR) : "—"}
                    </td>
                    <td className="mono-nums px-4 py-2.5 text-right tabular-nums text-bear">
                      {b.minusR ? fmtR(b.minusR) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-semibold tabular-nums",
                        b.netR > 0 ? "text-bull" : b.netR < 0 ? "text-bear" : "",
                      )}
                    >
                      {fmtR(b.netR)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Breakdowns */}
        <div className="space-y-8">
          <BreakdownTable title="By playbook" keyLabel="Playbook" rows={byPlaybook} />
          <BreakdownTable title="By asset" keyLabel="Asset" rows={byAsset} />
          <BreakdownTable title="By setup grade" keyLabel="Grade" rows={byGrade} />
          <BreakdownTable title="By tag" keyLabel="Tag" rows={byTag} />
          <BreakdownTable title="By method" keyLabel="Method" rows={byMethod} />
        </div>
      </div>
    </div>
  );
}
