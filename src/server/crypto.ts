"use server";

import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cryptoNarrative, coinScore } from "@/db/schema";
import { requireUser } from "@/lib/session";
import type { CryptoNarrativeRow, CoinScoreRow } from "@/db/schema";

// ── Narratives ───────────────────────────────────────────────────────────────
const NarrativeSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(60),
  quarter: z.string().max(12).default(""),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  durationMonths: z.number().int().min(1).max(24).nullable().optional(),
  thesis: z.string().max(4000).default(""),
  coins: z.string().max(400).default(""),
  status: z.enum(["watching", "active", "exited"]).default("watching"),
});
export type SaveNarrativeInput = z.input<typeof NarrativeSchema>;

export async function getNarratives(): Promise<CryptoNarrativeRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(cryptoNarrative)
    .where(eq(cryptoNarrative.userId, user.id))
    .orderBy(desc(cryptoNarrative.createdAt));
}

export async function saveNarrative(input: SaveNarrativeInput) {
  const user = await requireUser();
  const d = NarrativeSchema.parse(input);
  const values = {
    name: d.name,
    quarter: d.quarter,
    startDate: d.startDate ?? null,
    durationMonths: d.durationMonths ?? null,
    thesis: d.thesis,
    coins: d.coins,
    status: d.status,
  };
  if (d.id) {
    await db
      .update(cryptoNarrative)
      .set(values)
      .where(
        and(eq(cryptoNarrative.id, d.id), eq(cryptoNarrative.userId, user.id)),
      );
  } else {
    await db
      .insert(cryptoNarrative)
      .values({ id: crypto.randomUUID(), userId: user.id, ...values });
  }
  revalidatePath("/crypto");
  return { ok: true };
}

export async function deleteNarrative(id: string) {
  const user = await requireUser();
  const nid = z.string().min(1).parse(id);
  await db
    .delete(cryptoNarrative)
    .where(
      and(eq(cryptoNarrative.id, nid), eq(cryptoNarrative.userId, user.id)),
    );
  revalidatePath("/crypto");
  return { ok: true };
}

// ── Coin scores ──────────────────────────────────────────────────────────────
const ScoreSchema = z.object({
  id: z.string().min(1).optional(),
  coin: z.string().min(1).max(30),
  scores: z.record(z.string(), z.number().min(0).max(10)).default({}),
  conviction: z.number().int().min(0).max(20).default(0),
  note: z.string().max(2000).default(""),
});
export type SaveCoinScoreInput = z.input<typeof ScoreSchema>;

export async function getCoinScores(): Promise<CoinScoreRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(coinScore)
    .where(eq(coinScore.userId, user.id))
    .orderBy(desc(coinScore.createdAt));
}

export async function saveCoinScore(input: SaveCoinScoreInput) {
  const user = await requireUser();
  const d = ScoreSchema.parse(input);
  const values = {
    coin: d.coin,
    scores: JSON.stringify(d.scores),
    conviction: d.conviction,
    note: d.note,
  };
  if (d.id) {
    await db
      .update(coinScore)
      .set(values)
      .where(and(eq(coinScore.id, d.id), eq(coinScore.userId, user.id)));
  } else {
    await db
      .insert(coinScore)
      .values({ id: crypto.randomUUID(), userId: user.id, ...values });
  }
  revalidatePath("/crypto");
  return { ok: true };
}

export async function deleteCoinScore(id: string) {
  const user = await requireUser();
  const cid = z.string().min(1).parse(id);
  await db
    .delete(coinScore)
    .where(and(eq(coinScore.id, cid), eq(coinScore.userId, user.id)));
  revalidatePath("/crypto");
  return { ok: true };
}
