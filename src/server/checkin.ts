"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { checkIn, habit } from "@/db/schema";
import { requireUser } from "@/lib/session";

const StatusSchema = z.enum(["done", "rest", "sick", "travel", "pause"]);
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function revalidate() {
  revalidatePath("/dashboard");
  revalidatePath("/insights");
}

/** Upsert a check-in for (habit, date). Verifies habit ownership. */
export async function setCheckIn(
  habitId: string,
  date: string,
  status: string,
) {
  const user = await requireUser();
  const hid = z.string().min(1).parse(habitId);
  const vdate = DateSchema.parse(date);
  const vstatus = StatusSchema.parse(status);

  // ownership check on the habit
  const owned = await db
    .select({ id: habit.id })
    .from(habit)
    .where(and(eq(habit.id, hid), eq(habit.userId, user.id)))
    .limit(1);
  if (!owned.length) return;

  const completedAt = vstatus === "done" ? new Date() : null;
  await db
    .insert(checkIn)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      habitId: hid,
      date: vdate,
      status: vstatus,
      completedAt,
    })
    .onConflictDoUpdate({
      target: [checkIn.habitId, checkIn.date],
      set: { status: vstatus, completedAt },
    });
  revalidate();
}

export async function removeCheckIn(habitId: string, date: string) {
  const user = await requireUser();
  const hid = z.string().min(1).parse(habitId);
  const vdate = DateSchema.parse(date);
  await db
    .delete(checkIn)
    .where(
      and(
        eq(checkIn.userId, user.id),
        eq(checkIn.habitId, hid),
        eq(checkIn.date, vdate),
      ),
    );
  revalidate();
}
