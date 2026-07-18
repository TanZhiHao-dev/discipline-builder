import { Flame, Trophy } from "lucide-react";
import { getHabits, getCheckIns } from "@/lib/queries";
import {
  addDays,
  computeStreaks,
  dow,
  rangeStats,
  sumStats,
  todayStr,
  type CheckStatus,
} from "@/lib/streak";
import { habitColor, toHabitConfig } from "@/lib/habit-utils";
import { StreakRing } from "@/components/StreakRing";
import { MonthHeatmap, type DayState } from "@/components/insights/MonthHeatmap";
import { WeeklyBars } from "@/components/insights/WeeklyBars";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PROTECT = new Set(["rest", "sick", "travel", "pause"]);
const pad2 = (n: number) => String(n).padStart(2, "0");

export default async function InsightsPage() {
  const habits = await getHabits();
  const today = todayStr();
  const from = addDays(today, -100);
  const rows = await getCheckIns(from, today);

  const byHabit: Record<string, Record<string, CheckStatus>> = {};
  for (const c of rows) (byHabit[c.habitId] ??= {})[c.date] = c.status as CheckStatus;

  const [yStr, mStr] = today.split("-");
  const year = Number(yStr);
  const month = Number(mStr); // 1-based
  const monthStart = `${yStr}-${mStr}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();

  const enriched = habits.map((h) => {
    const config = toHabitConfig(h);
    const map = byHabit[h.id] ?? {};
    return {
      h,
      config,
      map,
      streaks: computeStreaks(config, map, today),
      month: rangeStats(config, map, monthStart, today, today),
    };
  });

  const overall = sumStats(enriched.map((e) => e.month));
  const longestCurrent = Math.max(0, ...enriched.map((e) => e.streaks.current));
  const bestEver = Math.max(0, ...enriched.map((e) => e.streaks.best));

  // Month heatmap (aggregate across habits)
  const heatDays: { day: number; state: DayState }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${yStr}-${mStr}-${pad2(day)}`;
    let state: DayState;
    if (date > today) state = "future";
    else {
      const sched = enriched.filter((e) => e.config.scheduleDays.includes(dow(date)));
      if (sched.length === 0) state = "none";
      else {
        const done = sched.filter((e) => e.map[date] === "done").length;
        const prot = sched.filter((e) => PROTECT.has(e.map[date])).length;
        state = done === sched.length ? "done" : done > 0 ? "partial" : prot > 0 ? "rest" : "miss";
      }
    }
    heatDays.push({ day, state });
  }

  // Weekly bars — last 8 weeks (Sun..Sat)
  const thisSunday = addDays(today, -dow(today));
  const weeks: { label: string; pct: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const wStart = addDays(thisSunday, -7 * i);
    const wEnd = addDays(wStart, 6);
    const to = wEnd > today ? today : wEnd;
    const agg = sumStats(enriched.map((e) => rangeStats(e.config, e.map, wStart, to, today)));
    weeks.push({ label: `${Number(wStart.slice(5, 7))}/${Number(wStart.slice(8))}`, pct: agg.pct });
  }

  const summary = [
    { label: "This month", value: `${overall.pct}%`, icon: null },
    { label: "Longest active", value: `${longestCurrent}`, icon: Flame, tone: "text-streak" },
    { label: "Best ever", value: `${bestEver}`, icon: Trophy, tone: "text-primary" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-5 py-6">
      <div className="mb-1">
        <h1 className="text-xl font-bold tracking-tight">Weekly reflection</h1>
        <p className="text-sm text-muted-foreground">
          A clear summary of what improved and what needs adjusting.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className={cn("mt-1 flex items-center gap-1 text-2xl font-extrabold tnum", s.tone)}>
              {s.icon ? <s.icon className="h-5 w-5" /> : null}
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <MonthHeatmap
        monthLabel={`${MONTHS[month - 1]} ${year}`}
        firstDow={dow(monthStart)}
        days={heatDays}
      />

      <WeeklyBars weeks={weeks} />

      {/* Per-habit */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold">By habit</div>
        {enriched.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No habits yet.
          </p>
        ) : (
          <div className="space-y-1">
            {enriched.map((e) => {
              const color = habitColor(e.h.color);
              return (
                <div key={e.h.id} className="flex items-center gap-3 py-2">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-base", color.soft)}>
                    {e.h.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{e.h.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5 text-streak">
                        <Flame className="h-3 w-3" /> {e.streaks.current}
                      </span>
                      <span>· best {e.streaks.best}</span>
                    </div>
                  </div>
                  <StreakRing pct={e.month.pct} size={40} stroke={5} color={color.text}>
                    <span className="tnum text-[10px] font-bold">{e.month.pct}</span>
                  </StreakRing>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
