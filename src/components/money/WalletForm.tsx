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
import { saveWallet, deleteWallet } from "@/server/money";
import {
  WALLET_COLORS,
  WALLET_KINDS,
  catColorClasses,
  formatMoney,
} from "@/lib/finance";
import type { WalletRow } from "@/db/schema";
import { cn } from "@/lib/utils";

export function WalletForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: WalletRow | null;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(editing?.name ?? "");
  const [kind, setKind] = useState(editing?.kind ?? "cash");
  const [color, setColor] = useState(editing?.color ?? "green");
  const [initialBalance, setInit] = useState(
    editing ? String(editing.initialBalance) : "",
  );

  const initNum = Number(initialBalance) || 0;

  function submit() {
    if (!name.trim()) {
      toast.error("Name your wallet");
      return;
    }
    startTransition(async () => {
      try {
        await saveWallet({
          id: editing?.id,
          name: name.trim(),
          kind: kind as "cash",
          color,
          initialBalance: initNum,
        });
        toast.success(editing ? "Wallet updated" : "Wallet added");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function remove() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await deleteWallet(editing.id);
        toast.success("Wallet deleted");
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
            {editing ? "Edit wallet" : "New wallet"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Name</Label>
            <Input
              placeholder="e.g. BCA, Cash, GoPay"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {WALLET_KINDS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setKind(k.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    kind === k.key
                      ? "border-ink bg-ink text-white"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{k.emoji}</span> {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-2 transition-all",
                    catColorClasses(c).dot,
                    color === c && "ring-2 ring-ink",
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {editing ? "Starting balance" : "Current balance"}
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <Input
                inputMode="numeric"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInit(e.target.value.replace(/[^\d.]/g, ""))}
                className="pl-9 tnum"
              />
            </div>
            {initNum > 0 ? (
              <p className="text-[11px] text-muted-foreground">{formatMoney(initNum)}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {editing ? (
            <Button
              variant="ghost"
              onClick={remove}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={submit} disabled={pending} className="bg-brand text-white hover:bg-brand/90">
            {pending ? "Saving…" : editing ? "Save" : "Add wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
