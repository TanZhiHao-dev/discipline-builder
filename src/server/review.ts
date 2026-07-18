"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { periodicReview } from "@/db/schema";
import { requireUser } from "@/lib/session";

const TEXT = z.string().max(8000).default("");

const SaveSchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]),
  periodKey: z.string().min(1).max(20),
  wentWell: TEXT,
  wentWrong: TEXT,
  improvements: TEXT,
  notes: TEXT,
});

export type SaveReviewInput = z.input<typeof SaveSchema>;

// One review per user / period / periodKey — re-saving updates it.
export async function saveReview(input: SaveReviewInput) {
  const user = await requireUser();
  const d = SaveSchema.parse(input);

  const [existing] = await db
    .select({ id: periodicReview.id })
    .from(periodicReview)
    .where(
      and(
        eq(periodicReview.userId, user.id),
        eq(periodicReview.period, d.period),
        eq(periodicReview.periodKey, d.periodKey),
      ),
    );

  const fields = {
    wentWell: d.wentWell,
    wentWrong: d.wentWrong,
    improvements: d.improvements,
    notes: d.notes,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(periodicReview)
      .set(fields)
      .where(
        and(
          eq(periodicReview.id, existing.id),
          eq(periodicReview.userId, user.id),
        ),
      );
  } else {
    await db.insert(periodicReview).values({
      id: crypto.randomUUID(),
      userId: user.id,
      period: d.period,
      periodKey: d.periodKey,
      ...fields,
    });
  }

  revalidatePath("/review");
  return { ok: true };
}
