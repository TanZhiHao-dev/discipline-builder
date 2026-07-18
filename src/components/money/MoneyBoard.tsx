"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Plus,
  Target,
  Wallet as WalletIcon,
} from "lucide-react";
import { TransactionForm } from "@/components/money/TransactionForm";
import { WalletForm } from "@/components/money/WalletForm";
import { BudgetForm } from "@/components/money/BudgetForm";
import {
  catColorClasses,
  findCategory,
  formatMoney,
  formatMoneyShort,
  freedomTargets,
  walletKind,
} from "@/lib/finance";
import type { MonthSummary } from "@/lib/money-queries";
import type { WalletWithBalance } from "@/lib/money-queries";
import type { BudgetRow, MoneyTransactionRow } from "@/db/schema";
import { cn } from "@/lib/utils";

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function MoneyBoard({
  wallets,
  summary,
  transactions,
  budgets,
  netWorth,
  monthLabel,
}: {
  wallets: WalletWithBalance[];
  summary: MonthSummary;
  transactions: MoneyTransactionRow[];
  budgets: BudgetRow[];
  netWorth: number;
  monthLabel: string;
}) {
  const [txnOpen, setTxnOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<MoneyTransactionRow | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletWithBalance | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const walletOpts = wallets.map((w) => ({ id: w.id, name: w.name }));
  const walletName = useMemo(
    () => Object.fromEntries(wallets.map((w) => [w.id, w.name])),
    [wallets],
  );

  const freedom = freedomTargets(summary.avgMonthlyExpense);
  const freedomPct =
    freedom.minCapital > 0
      ? Math.min(100, Math.round((netWorth / freedom.minCapital) * 100))
      : 0;

  function openNewTxn() {
    setEditingTxn(null);
    setTxnOpen(true);
  }
  function openEditTxn(t: MoneyTransactionRow) {
    setEditingTxn(t);
    setTxnOpen(true);
  }
  function openNewWallet() {
    setEditingWallet(null);
    setWalletOpen(true);
  }

  // group transactions by date
  const dayGroups = useMemo(() => {
    const map = new Map<string, MoneyTransactionRow[]>();
    for (const t of transactions) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return [...map.entries()];
  }, [transactions]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-medium text-ink">Money</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track cash flow, budgets, and your path to financial freedom.
          </p>
        </div>
        <button
          onClick={openNewTxn}
          className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" /> Add transaction
        </button>
      </div>

      {/* Net worth + wallets */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Net worth
            </div>
            <div className="mt-1 font-headline text-3xl font-semibold text-ink tnum">
              {formatMoney(netWorth)}
            </div>
          </div>
          <WalletIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {wallets.map((w) => {
            const c = catColorClasses(w.color);
            return (
              <button
                key={w.id}
                onClick={() => {
                  setEditingWallet(w);
                  setWalletOpen(true);
                }}
                className="group relative flex min-w-[150px] shrink-0 flex-col rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-ink/30"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                  {walletKind(w.kind).emoji} {w.name}
                </div>
                <div className="mt-1.5 font-semibold text-ink tnum">
                  {formatMoney(w.balance)}
                </div>
                <Pencil className="absolute right-2.5 top-2.5 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
          <button
            onClick={openNewWallet}
            className="flex min-w-[110px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
          >
            <Plus className="h-4 w-4" /> Wallet
          </button>
        </div>
      </div>

      {/* This month: report + freedom */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Report */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink">This month</h2>
            <span className="text-xs text-muted-foreground">{monthLabel}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniFlow label="Income" value={summary.income} tone="text-done" icon={ArrowUpRight} />
            <MiniFlow label="Spent" value={summary.expense} tone="text-destructive" icon={ArrowDownRight} />
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Net
              </div>
              <div
                className={cn(
                  "mt-0.5 text-sm font-bold tnum",
                  summary.net >= 0 ? "text-done" : "text-destructive",
                )}
              >
                {formatMoney(summary.net, { sign: true })}
              </div>
            </div>
          </div>

          {/* Expense by category */}
          <div className="mt-5">
            {summary.byCategory.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No expenses yet this month.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <Donut slices={summary.byCategory} total={summary.expense} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  {summary.byCategory.slice(0, 5).map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-xs">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", catColorClasses(s.color).dot)} />
                      <span className="truncate text-foreground">
                        {s.emoji} {s.label}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground tnum">
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial freedom */}
        <div className="rounded-2xl border border-border bg-ink p-5 text-white">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-brand" />
            <h2 className="font-semibold">Financial freedom</h2>
          </div>
          <p className="text-xs text-white/60">
            Minimum capital = monthly expenses × 12
          </p>
          <div className="mt-2 font-headline text-3xl font-semibold tnum">
            {formatMoney(freedom.minCapital)}
          </div>
          <div className="mt-1 text-xs text-white/50">
            based on {formatMoneyShort(freedom.monthlyExpense)}/mo avg spend
          </div>

          {/* progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Your net worth</span>
              <span className="tnum">{freedomPct}%</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${freedomPct}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-white/50 tnum">
              {formatMoney(netWorth)} / {formatMoney(freedom.minCapital)}
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
            Full independence (4% rule · 25×):{" "}
            <span className="font-semibold text-white tnum">
              {formatMoneyShort(freedom.fireNumber)}
            </span>
          </div>
        </div>
      </div>

      {/* Budgets */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Budgets · {monthLabel}</h2>
          <button
            onClick={() => setBudgetOpen(true)}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Set budget
          </button>
        </div>
        {budgets.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No budgets yet. Set a monthly limit per category to stay on track.
          </p>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const spent =
                summary.byCategory.find((c) => c.key === b.category)?.amount ?? 0;
              const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
              const over = spent > b.amount;
              const cat = findCategory("expense", b.category);
              return (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-foreground">
                      {cat.emoji} {cat.label}
                    </span>
                    <span className={cn("tnum", over ? "text-destructive" : "text-muted-foreground")}>
                      {formatMoney(spent)} / {formatMoney(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-brand")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="mt-6">
        <h2 className="mb-3 font-semibold text-ink">Transactions</h2>
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No transactions this month — add your first one.
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map(([date, list]) => {
              const dayTotal = list.reduce(
                (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
                0,
              );
              return (
                <div key={date}>
                  <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>{DAY_FMT.format(new Date(date + "T00:00:00"))}</span>
                    <span className={cn("tnum", dayTotal >= 0 ? "text-done" : "text-destructive")}>
                      {formatMoney(dayTotal, { sign: true })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {list.map((t) => {
                      const cat = findCategory(t.type as "expense", t.category);
                      const c = catColorClasses(cat.color);
                      return (
                        <button
                          key={t.id}
                          onClick={() => openEditTxn(t)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors hover:border-ink/20"
                        >
                          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base", c.soft)}>
                            {cat.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-ink">
                              {t.note || cat.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {cat.label} · {walletName[t.walletId] ?? "—"}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-sm font-semibold tnum",
                              t.type === "income" ? "text-done" : "text-foreground",
                            )}
                          >
                            {t.type === "income" ? "+" : "−"}
                            {formatMoney(t.amount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {txnOpen ? (
        <TransactionForm
          key={editingTxn?.id ?? "new-txn"}
          open={txnOpen}
          onOpenChange={setTxnOpen}
          wallets={walletOpts}
          editing={editingTxn}
        />
      ) : null}
      {walletOpen ? (
        <WalletForm
          key={editingWallet?.id ?? "new-wallet"}
          open={walletOpen}
          onOpenChange={setWalletOpen}
          editing={editingWallet}
        />
      ) : null}
      {budgetOpen ? (
        <BudgetForm open={budgetOpen} onOpenChange={setBudgetOpen} budgets={budgets} />
      ) : null}
    </div>
  );
}

function MiniFlow({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: typeof ArrowUpRight;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className={cn("h-3 w-3", tone)} /> {label}
      </div>
      <div className={cn("mt-0.5 text-sm font-bold tnum", tone)}>
        {formatMoney(value)}
      </div>
    </div>
  );
}

// Simple SVG donut of expense categories.
function Donut({
  slices,
  total,
}: {
  slices: { key: string; color: string; amount: number }[];
  total: number;
}) {
  const size = 96;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const varMap: Record<string, string> = {
    green: "var(--cat-green)",
    blue: "var(--cat-blue)",
    teal: "var(--cat-teal)",
    amber: "var(--cat-amber)",
    pink: "var(--cat-pink)",
    lavender: "var(--cat-lavender)",
  };
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
        {slices.map((s) => {
          const frac = total > 0 ? s.amount / total : 0;
          const len = frac * c;
          const el = (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={varMap[s.color] ?? "var(--cat-lavender)"}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-muted-foreground">spent</span>
        <span className="text-[11px] font-bold text-ink tnum">
          {formatMoneyShort(total)}
        </span>
      </div>
    </div>
  );
}
