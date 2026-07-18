// Server-only reads for the money tracker. Scoped to the current user.
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { wallet, moneyTransaction, budget } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { findCategory } from "@/lib/finance";
import type {
  WalletRow,
  MoneyTransactionRow,
  BudgetRow,
} from "@/db/schema";

export type WalletWithBalance = WalletRow & { balance: number };

/** Wallets with balance = initialBalance + income − expense. */
export async function getWallets(): Promise<WalletWithBalance[]> {
  const user = await requireUser();
  const wallets = await db
    .select()
    .from(wallet)
    .where(and(eq(wallet.userId, user.id), eq(wallet.archived, false)))
    .orderBy(wallet.sortOrder);
  const txns = await db
    .select()
    .from(moneyTransaction)
    .where(eq(moneyTransaction.userId, user.id));

  const delta = new Map<string, number>();
  for (const t of txns) {
    const cur = delta.get(t.walletId) ?? 0;
    delta.set(t.walletId, cur + (t.type === "income" ? t.amount : -t.amount));
  }
  return wallets.map((w) => ({
    ...w,
    balance: w.initialBalance + (delta.get(w.id) ?? 0),
  }));
}

export async function getBudgets(): Promise<BudgetRow[]> {
  const user = await requireUser();
  return db.select().from(budget).where(eq(budget.userId, user.id));
}

/** Transactions within [from, to] (inclusive), newest first. */
export async function getTransactions(
  from: string,
  to: string,
): Promise<MoneyTransactionRow[]> {
  const user = await requireUser();
  return db
    .select()
    .from(moneyTransaction)
    .where(
      and(
        eq(moneyTransaction.userId, user.id),
        gte(moneyTransaction.date, from),
        lte(moneyTransaction.date, to),
      ),
    )
    .orderBy(desc(moneyTransaction.date), desc(moneyTransaction.createdAt));
}

export type CategorySlice = {
  key: string;
  label: string;
  emoji: string;
  color: string;
  amount: number;
  pct: number;
};

export type MonthSummary = {
  month: string; // 'YYYY-MM'
  income: number;
  expense: number;
  net: number;
  txCount: number;
  byCategory: CategorySlice[]; // expense breakdown, biggest first
  daily: { day: number; expense: number; income: number }[];
  avgMonthlyExpense: number; // trailing avg for the freedom calc
};

/** Aggregate a month's transactions (also computes trailing avg expense). */
export async function getMonthSummary(month: string): Promise<MonthSummary> {
  const user = await requireUser();
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const from = `${month}-01`;
  const to = `${month}-${String(daysInMonth).padStart(2, "0")}`;

  const rows = await db
    .select()
    .from(moneyTransaction)
    .where(
      and(
        eq(moneyTransaction.userId, user.id),
        gte(moneyTransaction.date, from),
        lte(moneyTransaction.date, to),
      ),
    );

  let income = 0;
  let expense = 0;
  const catMap = new Map<string, number>();
  const daily = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    expense: 0,
    income: 0,
  }));

  for (const r of rows) {
    const day = Number(r.date.slice(8, 10));
    if (r.type === "income") {
      income += r.amount;
      if (daily[day - 1]) daily[day - 1].income += r.amount;
    } else {
      expense += r.amount;
      if (daily[day - 1]) daily[day - 1].expense += r.amount;
      catMap.set(r.category, (catMap.get(r.category) ?? 0) + r.amount);
    }
  }

  const byCategory: CategorySlice[] = [...catMap.entries()]
    .map(([key, amount]) => {
      const c = findCategory("expense", key);
      return {
        key,
        label: c.label,
        emoji: c.emoji,
        color: c.color,
        amount,
        pct: expense > 0 ? Math.round((amount / expense) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Trailing average monthly expense over the last 3 months (incl. this one),
  // so the freedom target isn't skewed by a single spike/quiet month.
  const avgFrom = (() => {
    const d = new Date(y, m - 1 - 2, 1); // 2 months before this month's start
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  })();
  const priorRows = await db
    .select()
    .from(moneyTransaction)
    .where(
      and(
        eq(moneyTransaction.userId, user.id),
        eq(moneyTransaction.type, "expense"),
        gte(moneyTransaction.date, avgFrom),
        lte(moneyTransaction.date, to),
      ),
    );
  const monthsSpanned = 3;
  const totalExpense3mo = priorRows.reduce((s, r) => s + r.amount, 0);
  const avgMonthlyExpense =
    totalExpense3mo > 0 ? totalExpense3mo / monthsSpanned : expense;

  return {
    month,
    income,
    expense,
    net: income - expense,
    txCount: rows.length,
    byCategory,
    daily,
    avgMonthlyExpense,
  };
}
