"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { routineStack, habit } from "@/db/schema";
import { requireUser } from "@/lib/session";

const StackSchema = z.object({
  name: z.string().min(1).max(60),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
});

function revalidate() {
  revalidatePath("/dashboard");
  revalidatePath("/habits");
}

export async function createStack(input: z.input<typeof StackSchema>) {
  const user = await requireUser();
  const data = StackSchema.parse(input);
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${routineStack.sortOrder}), 0)` })
    .from(routineStack)
    .where(eq(routineStack.userId, user.id));
  const id = crypto.randomUUID();
  await db.insert(routineStack).values({
    id,
    userId: user.id,
    name: data.name,
    timeOfDay: data.timeOfDay,
    sortOrder: (max ?? 0) + 1,
  });
  revalidate();
  return { id };
}

export async function updateStack(id: string, input: z.input<typeof StackSchema>) {
  const user = await requireUser();
  const vid = z.string().min(1).parse(id);
  const data = StackSchema.parse(input);
  await db
    .update(routineStack)
    .set({ name: data.name, timeOfDay: data.timeOfDay })
    .where(and(eq(routineStack.id, vid), eq(routineStack.userId, user.id)));
  revalidate();
}

export async function deleteStack(id: string) {
  const user = await requireUser();
  const vid = z.string().min(1).parse(id);
  // detach habits, then delete the stack
  await db
    .update(habit)
    .set({ stackId: null })
    .where(and(eq(habit.stackId, vid), eq(habit.userId, user.id)));
  await db
    .delete(routineStack)
    .where(and(eq(routineStack.id, vid), eq(routineStack.userId, user.id)));
  revalidate();
}
