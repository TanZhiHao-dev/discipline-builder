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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setBudget } from "@/server/money";
import { EXPENSE_CATEGORIES, formatMoney } from "@/lib/finance";
import type { BudgetRow } from "@/db/schema";
import { cn } from "@/lib/utils";

export function BudgetForm({
  open,
  onOpenChange,
  budgets,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  budgets: BudgetRow[];
}) {
  const [pending, startTransition] = useTransition();
  const existing = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].key);
  const [amount, setAmount] = useState(
    existing[EXPENSE_CATEGORIES[0].key] ? String(existing[EXPENSE_CATEGORIES[0].key]) : "",
  );

  function pick(key: string) {
    setCategory(key);
    setAmount(existing[key] ? String(existing[key]) : "");
  }

  const amountNum = Number(amount) || 0;

  function submit() {
    startTransition(async () => {
      try {
        await setBudget({ category, amount: amountNum });
        toast.success(amountNum === 0 ? "Budget removed" : "Budget saved");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Set monthly budget</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pick(c.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    category === c.key
                      ? "border-ink bg-ink text-white"
                      : "border-border text-muted-foreground hover:text-foreground",
                    existing[c.key] && category !== c.key && "border-brand/40",
                  )}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Monthly limit (0 to remove)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="pl-9 tnum"
              />
            </div>
            {amountNum > 0 ? (
              <p className="text-[11px] text-muted-foreground">{formatMoney(amountNum)} / month</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="bg-brand text-white hover:bg-brand/90">
            {pending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
