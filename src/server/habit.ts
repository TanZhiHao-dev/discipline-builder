"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { habit } from "@/db/schema";
import { requireUser } from "@/lib/session";

const HabitSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().min(1).max(8).default("✅"),
  color: z.string().max(20).default("lavender"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
  scheduleDays: z.array(z.number().int().min(0).max(6)).min(1).default([0, 1, 2, 3, 4, 5, 6]),
  stackId: z.string().nullable().optional(),
  restCreditsPerWeek: z.number().int().min(0).max(7).default(1),
});
export type HabitInput = z.input<typeof HabitSchema>;

function revalidate() {
  revalidatePath("/dashboard");
  revalidatePath("/habits");
  revalidatePath("/insights");
}

export async function createHabit(input: HabitInput) {
  const user = await requireUser();
  const data = HabitSchema.parse(input);

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${habit.sortOrder}), 0)` })
    .from(habit)
    .where(eq(habit.userId, user.id));

  const id = crypto.randomUUID();
  await db.insert(habit).values({
    id,
    userId: user.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    timeOfDay: data.timeOfDay,
    scheduleDays: data.scheduleDays.join(","),
    stackId: data.stackId ?? null,
    restCreditsPerWeek: data.restCreditsPerWeek,
    sortOrder: (max ?? 0) + 1,
  });
  revalidate();
  return { id };
}

export async function updateHabit(id: string, input: HabitInput) {
  const user = await requireUser();
  const vid = z.string().min(1).parse(id);
  const data = HabitSchema.parse(input);
  await db
    .update(habit)
    .set({
      name: data.name,
      icon: data.icon,
      color: data.color,
      timeOfDay: data.timeOfDay,
      scheduleDays: data.scheduleDays.join(","),
      stackId: data.stackId ?? null,
      restCreditsPerWeek: data.restCreditsPerWeek,
    })
    .where(and(eq(habit.id, vid), eq(habit.userId, user.id)));
  revalidate();
}

export async function archiveHabit(id: string) {
  const user = await requireUser();
  const vid = z.string().min(1).parse(id);
  await db
    .update(habit)
    .set({ archived: true })
    .where(and(eq(habit.id, vid), eq(habit.userId, user.id)));
  revalidate();
}

export async function deleteHabit(id: string) {
  const user = await requireUser();
  const vid = z.string().min(1).parse(id);
  await db
    .delete(habit)
    .where(and(eq(habit.id, vid), eq(habit.userId, user.id)));
  revalidate();
}

export async function reorderHabits(orderedIds: string[]) {
  const user = await requireUser();
  const ids = z.array(z.string().min(1)).parse(orderedIds);
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(habit)
      .set({ sortOrder: i })
      .where(and(eq(habit.id, ids[i]), eq(habit.userId, user.id)));
  }
  revalidate();
}
