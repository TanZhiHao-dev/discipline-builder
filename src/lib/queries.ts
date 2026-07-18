// Server-only read helpers (imported by server components). All scoped to the
// current user. Never import this from a client component.
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { habit, checkIn, routineStack } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { rangeStats, sumStats, todayStr, type CheckStatus } from "@/lib/streak";
import { toHabitConfig } from "@/lib/habit-utils";

export async function getHabits() {
  const user = await requireUser();
  return db
    .select()
    .from(habit)
    .where(and(eq(habit.userId, user.id), eq(habit.archived, false)))
    .orderBy(asc(habit.sortOrder), asc(habit.createdAt));
}

export async function getStacks() {
  const user = await requireUser();
  return db
    .select()
    .from(routineStack)
    .where(eq(routineStack.userId, user.id))
    .orderBy(asc(routineStack.sortOrder));
}

/** All check-ins for the user within an inclusive date range. */
export async function getCheckIns(from: string, to: string) {
  const user = await requireUser();
  return db
    .select()
    .from(checkIn)
    .where(
      and(
        eq(checkIn.userId, user.id),
        gte(checkIn.date, from),
        lte(checkIn.date, to),
      ),
    );
}

/**
 * Habit adherence over [from, to] as a 0–100 % (done ÷ scheduled across all
 * active habits). Feeds the "rule adherence" leg of the trading Discipline
 * Score — the thing that ties trading discipline back to the habit routine.
 */
export async function getHabitAdherence(from: string, to: string): Promise<number> {
  const user = await requireUser();
  const habits = await getHabits();
  if (habits.length === 0) return 0;
  const checks = await getCheckIns(from, to);
  const today = todayStr();
  const byHabit = new Map<string, { date: string; status: CheckStatus }[]>();
  for (const c of checks) {
    const arr = byHabit.get(c.habitId) ?? [];
    arr.push({ date: c.date, status: c.status as CheckStatus });
    byHabit.set(c.habitId, arr);
  }
  const stats = habits.map((h) =>
    rangeStats(toHabitConfig(h), byHabit.get(h.id) ?? [], from, to, today),
  );
  const total = sumStats(stats);
  return total.scheduled > 0
    ? Math.round((total.done / total.scheduled) * 100)
    : 0;
}

/** Check-ins for specific habits within a range (insights). */
export async function getCheckInsForHabits(
  habitIds: string[],
  from: string,
  to: string,
) {
  const user = await requireUser();
  if (habitIds.length === 0) return [];
  return db
    .select()
    .from(checkIn)
    .where(
      and(
        eq(checkIn.userId, user.id),
        inArray(checkIn.habitId, habitIds),
        gte(checkIn.date, from),
        lte(checkIn.date, to),
      ),
    );
}
