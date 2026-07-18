"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { habit, routineStack } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { TEMPLATE_PACKS } from "@/lib/habit-templates";

const ApplyTemplatesSchema = z.object({
  selections: z
    .array(
      z.object({
        packKey: z.string().min(1),
        habitNames: z.array(z.string().min(1).max(80)),
      }),
    )
    .min(1)
    .refine((sels) => sels.some((s) => s.habitNames.length > 0), {
      message: "Pick at least one habit",
    }),
});
export type ApplyTemplatesInput = z.input<typeof ApplyTemplatesSchema>;

/**
 * Onboarding: create a routine stack per selected focus pack and the chosen
 * habits inside it. Habits the user already has (by name, case-insensitive,
 * active only) are skipped. Returns { created, skipped }.
 */
export async function applyTemplates(input: ApplyTemplatesInput) {
  const user = await requireUser();
  const data = ApplyTemplatesSchema.parse(input);

  // Existing active habit names — duplicates get skipped, not re-created.
  const existing = await db
    .select({ name: habit.name })
    .from(habit)
    .where(and(eq(habit.userId, user.id), eq(habit.archived, false)));
  const existingNames = new Set(existing.map((h) => h.name.toLowerCase()));

  const [{ max: maxHabitSort }] = await db
    .select({ max: sql<number>`coalesce(max(${habit.sortOrder}), 0)` })
    .from(habit)
    .where(eq(habit.userId, user.id));

  const [{ count: stackCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(routineStack)
    .where(eq(routineStack.userId, user.id));

  let created = 0;
  let skipped = 0;
  let habitSort = maxHabitSort ?? 0;
  let stackSort = stackCount ?? 0;

  for (const selection of data.selections) {
    const pack = TEMPLATE_PACKS.find((p) => p.key === selection.packKey);
    if (!pack) throw new Error(`Unknown focus pack: ${selection.packKey}`);

    const wanted = new Set(selection.habitNames.map((n) => n.toLowerCase()));
    const picked = pack.habits.filter((h) => wanted.has(h.name.toLowerCase()));
    const fresh = picked.filter((h) => !existingNames.has(h.name.toLowerCase()));
    skipped += picked.length - fresh.length;
    if (fresh.length === 0) continue;

    const stackId = crypto.randomUUID();
    await db.insert(routineStack).values({
      id: stackId,
      userId: user.id,
      name: pack.title,
      timeOfDay: "anytime",
      sortOrder: stackSort,
    });
    stackSort += 1;

    await db.insert(habit).values(
      fresh.map((h) => {
        habitSort += 1;
        // Guard against the same name being created twice in one request.
        existingNames.add(h.name.toLowerCase());
        return {
          id: crypto.randomUUID(),
          userId: user.id,
          name: h.name,
          icon: h.icon,
          color: h.color,
          timeOfDay: h.timeOfDay,
          scheduleDays: h.scheduleDays,
          stackId,
          restCreditsPerWeek: h.restCreditsPerWeek,
          sortOrder: habitSort,
        };
      }),
    );
    created += fresh.length;
  }

  revalidatePath("/dashboard");
  revalidatePath("/habits");
  return { created, skipped };
}
