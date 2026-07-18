import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getHabits, getStacks, getCheckIns } from "@/lib/queries";
import {
  addDays,
  computeStreaks,
  dow,
  rangeStats,
  sumStats,
  todayStr,
  type CheckStatus,
} from "@/lib/streak";
import { toHabitConfig } from "@/lib/habit-utils";
import { DashboardBoard } from "@/components/dashboard/DashboardBoard";

const DOW_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = (user.name || user.email).split(" ")[0].split("@")[0];

  const habits = await getHabits();
  if (habits.length === 0) redirect("/onboarding");
  const stacks = await getStacks();

  const today = todayStr();
  const monthStart = `${today.slice(0, 7)}-01`;
  const weekStart = addDays(today, -dow(today)); // Sunday of this week
  const rangeFrom = addDays(today, -400); // enough history for streaks
  const rows = await getCheckIns(rangeFrom, today);

  // group check-ins by habit → { date: status }
  const byHabit: Record<string, Record<string, CheckStatus>> = {};
  for (const c of rows) {
    (byHabit[c.habitId] ??= {})[c.date] = c.status as CheckStatus;
  }

  const enriched = habits.map((h) => {
    const config = toHabitConfig(h);
    const map = byHabit[h.id] ?? {};
    const streaks = computeStreaks(config, map, today);
    const month = rangeStats(config, map, monthStart, today, today);
    const week = rangeStats(config, map, weekStart, today, today);
    return { h, config, map, streaks, month, week };
  });

  const monthRing = sumStats(enriched.map((e) => e.month));
  const weekAgg = sumStats(enriched.map((e) => e.week));

  // today
  const dowToday = dow(today);
  const scheduledToday = enriched.filter((e) =>
    e.config.scheduleDays.includes(dowToday),
  );
  const doneToday = scheduledToday.filter((e) => e.map[today] === "done").length;
  const todayPct = scheduledToday.length
    ? Math.round((doneToday / scheduledToday.length) * 100)
    : 0;

  // week strip (Sun..Sat)
  const weekStrip = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i);
    const isFuture = date > today;
    const d = dow(date);
    const sched = enriched.filter((e) => e.config.scheduleDays.includes(d));
    let state: "done" | "partial" | "none" | "future" = "none";
    if (isFuture) state = "future";
    else if (sched.length === 0) state = "none";
    else {
      const done = sched.filter((e) => e.map[date] === "done").length;
      state = done === sched.length ? "done" : done > 0 ? "partial" : "none";
    }
    return { date, dayNum: Number(date.slice(8)), dow: DOW_LABEL[d], isToday: date === today, isFuture, state };
  });

  const todayHabits = scheduledToday.map((e) => ({
    id: e.h.id,
    name: e.h.name,
    icon: e.h.icon,
    color: e.h.color,
    timeOfDay: e.h.timeOfDay,
    stackId: e.h.stackId,
    status: (e.map[today] ?? null) as CheckStatus | null,
    streak: e.streaks.current,
  }));

  return (
    <DashboardBoard
      name={firstName}
      today={today}
      weekStrip={weekStrip}
      monthRing={monthRing}
      todayPct={todayPct}
      weekPct={weekAgg.pct}
      todayHabits={todayHabits}
      stacks={stacks.map((s) => ({ id: s.id, name: s.name, timeOfDay: s.timeOfDay }))}
      totalHabits={habits.length}
    />
  );
}
