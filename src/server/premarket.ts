"use server";

import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tradeJournal, tradeScreenshot } from "@/db/schema";
import { requireUser } from "@/lib/session";

const NOTE = z.string().max(8000).default("");

const STEP_KEYS = [
  "topDownAnalysis",
  "marketStructure",
  "quarterlyTheory",
  "pdArray",
  "notes",
] as const;

// Analysis stream, one per journal type so panels never mix: 'live' → daily
// pre-market for real trades (mode 'premarket'); 'backtest' → replayed setups
// ('bt-premarket'); 'paper' → simulated real-time trades ('paper-premarket').
const MODE_OF = {
  live: "premarket",
  backtest: "bt-premarket",
  paper: "paper-premarket",
} as const;
const PREMARKET_MODES = ["premarket", "bt-premarket", "paper-premarket"] as const;

const SaveSchema = z.object({
  id: z.string().min(1).optional(),
  variant: z.enum(["live", "backtest", "paper"]).default("live"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  asset: z.enum(["XAUUSD", "NAS100", "BTCUSD", "ETHUSD", "SOLUSD"]),
  method: z.string().max(100).default(""),
  dailyBias: z.enum(["Bullish", "Bearish", "Neutral"]).default("Neutral"),
  topDownAnalysis: NOTE,
  marketStructure: NOTE,
  quarterlyTheory: NOTE,
  pdArray: NOTE,
  notes: NOTE,
  screenshots: z
    .array(
      z.object({
        stepKey: z.enum(STEP_KEYS),
        image: z.string().max(6_000_000),
      }),
    )
    .max(20)
    .default([]),
});

export type SavePremarketInput = z.input<typeof SaveSchema>;

const revalidate = () => {
  revalidatePath("/journal");
  revalidatePath("/backtest");
  revalidatePath("/paper");
};

// One pre-market analysis per user / date / asset. Stored as a tradeJournal row
// with mode='premarket' so it's excluded from trade lists, stats, and equity.
export async function savePremarket(input: SavePremarketInput) {
  const user = await requireUser();
  const d = SaveSchema.parse(input);
  const storedMode = MODE_OF[d.variant];

  const values = {
    asset: d.asset,
    mode: storedMode,
    method: d.method,
    date: d.date,
    dailyBias: d.dailyBias,
    topDownAnalysis: d.topDownAnalysis,
    marketStructure: d.marketStructure,
    quarterlyTheory: d.quarterlyTheory,
    pdArray: d.pdArray,
    notes: d.notes,
  };

  // Resolve the target row: explicit id, else the existing analysis for this
  // (date, asset), else a fresh insert — so re-saving the same day updates it.
  let id = d.id;
  if (!id) {
    const [existing] = await db
      .select({ id: tradeJournal.id })
      .from(tradeJournal)
      .where(
        and(
          eq(tradeJournal.userId, user.id),
          eq(tradeJournal.mode, storedMode),
          eq(tradeJournal.date, d.date),
          eq(tradeJournal.asset, d.asset),
        ),
      );
    id = existing?.id;
  }

  if (id) {
    await db
      .update(tradeJournal)
      .set(values)
      .where(and(eq(tradeJournal.id, id), eq(tradeJournal.userId, user.id)));
  } else {
    id = crypto.randomUUID();
    await db.insert(tradeJournal).values({ id, userId: user.id, ...values });
  }

  // Full-replace screenshots.
  await db
    .delete(tradeScreenshot)
    .where(
      and(eq(tradeScreenshot.tradeId, id), eq(tradeScreenshot.userId, user.id)),
    );
  if (d.screenshots.length) {
    await db.insert(tradeScreenshot).values(
      d.screenshots.map((s, i) => ({
        id: crypto.randomUUID(),
        tradeId: id!,
        userId: user.id,
        stepKey: s.stepKey,
        image: s.image,
        sortOrder: i,
      })),
    );
  }

  revalidate();
  return { id };
}

export async function deletePremarket(id: string) {
  const user = await requireUser();
  const pid = z.string().min(1).parse(id);
  await db
    .delete(tradeJournal)
    .where(
      and(
        eq(tradeJournal.id, pid),
        eq(tradeJournal.userId, user.id),
        inArray(tradeJournal.mode, [...PREMARKET_MODES]),
      ),
    );
  revalidate();
  return { ok: true };
}
