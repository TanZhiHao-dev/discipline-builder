"use server";

import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tradeJournal, tradeScreenshot } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { autoResultR } from "@/lib/trade";

const NOTE = z.string().max(8000).default("");
const PRICE = z.number().finite().nullable().optional();

// SOP steps a screenshot can be attached to.
const STEP_KEYS = [
  "topDownAnalysis",
  "marketStructure",
  "quarterlyTheory",
  "pdArray",
  "entry",
  "notes",
] as const;

const SaveSchema = z.object({
  id: z.string().min(1).optional(), // present = update
  asset: z.enum(["XAUUSD", "NAS100", "BTCUSD", "ETHUSD", "SOLUSD"]),
  mode: z.enum(["live", "backtest", "paper"]).default("live"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  method: z.string().max(100).default(""),
  topDownAnalysis: NOTE,
  dailyBias: z.enum(["Bullish", "Bearish", "Neutral"]).default("Neutral"),
  marketStructure: NOTE,
  quarterlyTheory: NOTE,
  pdArray: NOTE,
  entryPrice: PRICE,
  stopLoss: PRICE,
  takeProfit: PRICE,
  exitPrice: PRICE,
  status: z.enum(["Running", "Win", "Loss", "Break Even"]).default("Running"),
  resultR: z.number().finite().nullable().optional(),
  notes: NOTE,
  grade: z.enum(["A", "B", "C", "D", "F"]).nullable().optional(),
  tags: z.string().max(400).default(""),
  playbookId: z.string().nullable().optional(),
  // Per-SOP-step screenshots (full set — the save replaces any existing ones).
  screenshots: z
    .array(
      z.object({
        stepKey: z.enum(STEP_KEYS),
        image: z.string().max(6_000_000), // base64 data URL, ~6MB cap
      }),
    )
    .max(24)
    .default([]),
});

export type SaveTradeInput = z.input<typeof SaveSchema>;

const revalidate = () => {
  revalidatePath("/journal");
  revalidatePath("/backtest");
  revalidatePath("/paper");
};

export async function saveTrade(input: SaveTradeInput) {
  const user = await requireUser();
  const data = SaveSchema.parse(input);

  // Derive R from status when the user didn't provide one explicitly.
  const resultRManual = data.resultR != null;
  const resultR = resultRManual ? data.resultR! : autoResultR(data.status);

  const values = {
    asset: data.asset,
    mode: data.mode,
    date: data.date ?? null,
    method: data.method,
    topDownAnalysis: data.topDownAnalysis,
    dailyBias: data.dailyBias,
    marketStructure: data.marketStructure,
    quarterlyTheory: data.quarterlyTheory,
    pdArray: data.pdArray,
    entryPrice: data.entryPrice ?? null,
    stopLoss: data.stopLoss ?? null,
    takeProfit: data.takeProfit ?? null,
    exitPrice: data.exitPrice ?? null,
    status: data.status,
    resultR,
    resultRManual,
    notes: data.notes,
    grade: data.grade ?? null,
    tags: data.tags,
    playbookId: data.playbookId ?? null,
  };

  let tradeId = data.id;

  if (tradeId) {
    await db
      .update(tradeJournal)
      .set(values)
      .where(and(eq(tradeJournal.id, tradeId), eq(tradeJournal.userId, user.id)));
  } else {
    tradeId = crypto.randomUUID();
    await db.insert(tradeJournal).values({ id: tradeId, userId: user.id, ...values });
  }

  // Full-replace the screenshot set (form always sends the complete list).
  await db
    .delete(tradeScreenshot)
    .where(
      and(
        eq(tradeScreenshot.tradeId, tradeId),
        eq(tradeScreenshot.userId, user.id),
      ),
    );
  if (data.screenshots.length) {
    await db.insert(tradeScreenshot).values(
      data.screenshots.map((s, i) => ({
        id: crypto.randomUUID(),
        tradeId: tradeId!,
        userId: user.id,
        stepKey: s.stepKey,
        image: s.image,
        sortOrder: i,
      })),
    );
  }

  revalidate();
  return { id: tradeId };
}

// Local YYYY-MM-DD of a timestamp (matches todayStr()'s local convention).
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Full detail for one trade (scoped) — row + its screenshots, plus that day's
 *  pre-market analysis for the same asset (so the detail view can fill in SOP
 *  steps 1–5 even when the trade was logged before/without the day's prep). */
export async function getTradeDetail(id: string) {
  const user = await requireUser();
  const tradeId = z.string().min(1).parse(id);
  const [row] = await db
    .select()
    .from(tradeJournal)
    .where(and(eq(tradeJournal.id, tradeId), eq(tradeJournal.userId, user.id)));
  if (!row) return null;
  const shots = await db
    .select()
    .from(tradeScreenshot)
    .where(
      and(
        eq(tradeScreenshot.tradeId, tradeId),
        eq(tradeScreenshot.userId, user.id),
      ),
    )
    .orderBy(asc(tradeScreenshot.sortOrder));

  // Same-day analysis: live & paper share the daily pre-market; backtest has
  // its own stream.
  let plan: { row: typeof row; shots: typeof shots } | null = null;
  if (row.mode === "live" || row.mode === "paper" || row.mode === "backtest") {
    const planMode = row.mode === "backtest" ? "bt-premarket" : "premarket";
    const dateStr = row.date ?? localDateStr(new Date(row.createdAt));
    const [p] = await db
      .select()
      .from(tradeJournal)
      .where(
        and(
          eq(tradeJournal.userId, user.id),
          eq(tradeJournal.mode, planMode),
          eq(tradeJournal.date, dateStr),
          eq(tradeJournal.asset, row.asset),
        ),
      );
    if (p) {
      const pShots = await db
        .select()
        .from(tradeScreenshot)
        .where(
          and(
            eq(tradeScreenshot.tradeId, p.id),
            eq(tradeScreenshot.userId, user.id),
          ),
        )
        .orderBy(asc(tradeScreenshot.sortOrder));
      plan = { row: p, shots: pShots };
    }
  }

  return { row, shots, plan };
}

const IdSchema = z.string().min(1);

export async function updateTradeStatus(id: string, status: string) {
  const user = await requireUser();
  const parsedId = IdSchema.parse(id);
  const parsedStatus = z
    .enum(["Running", "Win", "Loss", "Break Even"])
    .parse(status);

  // Read the row (scoped) so we can respect a manually-set R.
  const [row] = await db
    .select()
    .from(tradeJournal)
    .where(
      and(eq(tradeJournal.id, parsedId), eq(tradeJournal.userId, user.id)),
    );
  if (!row) return { ok: false };

  const resultR = row.resultRManual ? row.resultR : autoResultR(parsedStatus);

  await db
    .update(tradeJournal)
    .set({ status: parsedStatus, resultR })
    .where(
      and(eq(tradeJournal.id, parsedId), eq(tradeJournal.userId, user.id)),
    );
  revalidate();
  return { ok: true };
}

export async function updateTradeResultR(id: string, resultR: number | null) {
  const user = await requireUser();
  const parsedId = IdSchema.parse(id);
  const r = z.number().finite().nullable().parse(resultR);

  await db
    .update(tradeJournal)
    .set({ resultR: r, resultRManual: r != null })
    .where(
      and(eq(tradeJournal.id, parsedId), eq(tradeJournal.userId, user.id)),
    );
  revalidate();
  return { ok: true };
}

export async function deleteTrade(id: string) {
  const user = await requireUser();
  const parsedId = IdSchema.parse(id);
  await db
    .delete(tradeJournal)
    .where(
      and(eq(tradeJournal.id, parsedId), eq(tradeJournal.userId, user.id)),
    );
  revalidate();
  return { ok: true };
}
