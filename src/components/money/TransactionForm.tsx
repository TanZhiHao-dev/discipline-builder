"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveTransaction, deleteTransaction } from "@/server/money";
import { categoriesFor, formatMoney, type TxnType } from "@/lib/finance";
import { todayStr } from "@/lib/streak";
import type { MoneyTransactionRow, WalletRow } from "@/db/schema";
import { cn } from "@/lib/utils";

export function TransactionForm({
  open,
  onOpenChange,
  wallets,
  editing,
  defaultType = "expense",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  wallets: Pick<WalletRow, "id" | "name">[];
  editing?: MoneyTransactionRow | null;
  defaultType?: TxnType;
}) {
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<TxnType>((editing?.type as TxnType) ?? defaultType);
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [category, setCategory] = useState(
    editing?.category ?? categoriesFor((editing?.type as TxnType) ?? defaultType)[0].key,
  );
  const [walletId, setWalletId] = useState(editing?.walletId ?? wallets[0]?.id ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(editing?.date ?? todayStr());

  const cats = categoriesFor(type);
  const amountNum = Number(amount) || 0;

  function switchType(t: TxnType) {
    setType(t);
    // keep a valid category for the new type
    if (!categoriesFor(t).some((c) => c.key === category)) {
      setCategory(categoriesFor(t)[0].key);
    }
  }

  function submit() {
    if (amountNum <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (!walletId) {
      toast.error("Add a wallet first");
      return;
    }
    startTransition(async () => {
      try {
        await saveTransaction({
          id: editing?.id,
          walletId,
          type,
          amount: amountNum,
          category,
          note,
          date,
        });
        toast.success(editing ? "Updated" : type === "income" ? "Income added 💰" : "Expense added");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save — try again");
      }
    });
  }

  function remove() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await deleteTransaction(editing.id);
        toast.success("Deleted");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {editing ? "Edit transaction" : "New transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as TxnType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize transition-colors",
                  type === t
                    ? t === "income"
                      ? "border-done bg-done/10 text-done"
                      : "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="pl-9 text-lg font-semibold tnum"
              />
            </div>
            {amountNum > 0 ? (
              <p className="text-[11px] text-muted-foreground">{formatMoney(amountNum)}</p>
            ) : null}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    category === c.key
                      ? "border-ink bg-ink text-white"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet + date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Wallet</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Note</Label>
            <Input
              placeholder="Optional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {editing ? (
            <Button variant="ghost" onClick={remove} disabled={pending} className="text-destructive hover:text-destructive">
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={submit}
            disabled={pending}
            className="bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Saving…" : editing ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
