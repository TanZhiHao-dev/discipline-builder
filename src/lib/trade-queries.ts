// Server-only read helpers for the Journal / Backtest features. Scoped to the
// current user. Never import from a client component.
// (Pure stats math lives in @/lib/trade so client components can use it without
// dragging next/headers into the client bundle.)
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tradeJournal, playbook, periodicReview } from "@/db/schema";
import { requireUser } from "@/lib/session";
import type {
  TradeJournalRow,
  PlaybookRow,
  PeriodicReviewRow,
} from "@/db/schema";

export type TradeMode = "live" | "backtest" | "paper";

/** The user's playbooks (named setups), ordered. */
export async function getPlaybooks(): Promise<PlaybookRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(playbook)
    .where(eq(playbook.userId, user.id))
    .orderBy(asc(playbook.sortOrder), asc(playbook.createdAt));
}

/** All journal/backtest entries for the current user, newest first. */
export async function getTrades(mode: TradeMode): Promise<TradeJournalRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(tradeJournal)
    .where(and(eq(tradeJournal.userId, user.id), eq(tradeJournal.mode, mode)))
    .orderBy(desc(tradeJournal.createdAt));
}

/** Pre-market analyses for the current user, newest day first.
 *  variant 'live' → daily prep (mode 'premarket'); 'backtest' → analysis for
 *  replayed setups (mode 'bt-premarket'). */
export async function getPremarkets(
  variant: "live" | "backtest" | "paper" = "live",
): Promise<TradeJournalRow[]> {
  const user = await requireUser();
  const mode =
    variant === "backtest"
      ? "bt-premarket"
      : variant === "paper"
        ? "paper-premarket"
        : "premarket";
  return db
    .select()
    .from(tradeJournal)
    .where(and(eq(tradeJournal.userId, user.id), eq(tradeJournal.mode, mode)))
    .orderBy(desc(tradeJournal.date), desc(tradeJournal.createdAt));
}

/** All periodic reviews (weekly/monthly/yearly) for the current user. */
export async function getReviews(): Promise<PeriodicReviewRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(periodicReview)
    .where(eq(periodicReview.userId, user.id));
}
