"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { wallet, moneyTransaction, budget } from "@/db/schema";
import { requireUser } from "@/lib/session";

const revalidate = () => revalidatePath("/money");

// ---- Wallets ----
const WalletSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(60),
  kind: z.enum(["cash", "bank", "ewallet", "card", "savings", "investment"]).default("cash"),
  color: z.string().max(20).default("green"),
  initialBalance: z.number().finite().default(0),
});

export async function saveWallet(input: z.input<typeof WalletSchema>) {
  const user = await requireUser();
  const d = WalletSchema.parse(input);
  if (d.id) {
    await db
      .update(wallet)
      .set({ name: d.name, kind: d.kind, color: d.color, initialBalance: d.initialBalance })
      .where(and(eq(wallet.id, d.id), eq(wallet.userId, user.id)));
    revalidate();
    return { id: d.id };
  }
  const id = crypto.randomUUID();
  const count = (
    await db.select({ id: wallet.id }).from(wallet).where(eq(wallet.userId, user.id))
  ).length;
  await db.insert(wallet).values({
    id,
    userId: user.id,
    name: d.name,
    kind: d.kind,
    color: d.color,
    initialBalance: d.initialBalance,
    sortOrder: count,
  });
  revalidate();
  return { id };
}

export async function deleteWallet(id: string) {
  const user = await requireUser();
  const wid = z.string().min(1).parse(id);
  await db.delete(wallet).where(and(eq(wallet.id, wid), eq(wallet.userId, user.id)));
  revalidate();
  return { ok: true };
}

// ---- Transactions ----
const TxnSchema = z.object({
  id: z.string().min(1).optional(),
  walletId: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amount: z.number().finite().positive(),
  category: z.string().min(1).max(40),
  note: z.string().max(280).default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function saveTransaction(input: z.input<typeof TxnSchema>) {
  const user = await requireUser();
  const d = TxnSchema.parse(input);
  // Verify the wallet belongs to the user.
  const [w] = await db
    .select({ id: wallet.id })
    .from(wallet)
    .where(and(eq(wallet.id, d.walletId), eq(wallet.userId, user.id)));
  if (!w) throw new Error("wallet not found");

  const values = {
    walletId: d.walletId,
    type: d.type,
    amount: d.amount,
    category: d.category,
    note: d.note,
    date: d.date,
  };
  if (d.id) {
    await db
      .update(moneyTransaction)
      .set(values)
      .where(and(eq(moneyTransaction.id, d.id), eq(moneyTransaction.userId, user.id)));
    revalidate();
    return { id: d.id };
  }
  const id = crypto.randomUUID();
  await db.insert(moneyTransaction).values({ id, userId: user.id, ...values });
  revalidate();
  return { id };
}

export async function deleteTransaction(id: string) {
  const user = await requireUser();
  const tid = z.string().min(1).parse(id);
  await db
    .delete(moneyTransaction)
    .where(and(eq(moneyTransaction.id, tid), eq(moneyTransaction.userId, user.id)));
  revalidate();
  return { ok: true };
}

// ---- Budgets ----
const BudgetSchema = z.object({
  category: z.string().min(1).max(40),
  amount: z.number().finite().nonnegative(),
});

export async function setBudget(input: z.input<typeof BudgetSchema>) {
  const user = await requireUser();
  const d = BudgetSchema.parse(input);
  if (d.amount === 0) {
    await db
      .delete(budget)
      .where(and(eq(budget.userId, user.id), eq(budget.category, d.category)));
    revalidate();
    return { ok: true };
  }
  await db
    .insert(budget)
    .values({ id: crypto.randomUUID(), userId: user.id, category: d.category, amount: d.amount })
    .onConflictDoUpdate({
      target: [budget.userId, budget.category],
      set: { amount: d.amount },
    });
  revalidate();
  return { ok: true };
}
