"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/journal/Lightbox";
import { deletePremarket } from "@/server/premarket";
import { ASSETS, SOP_STEPS, biasClasses, type AssetKey } from "@/lib/trade";
import type { TradeJournalRow, TradeScreenshotRow } from "@/db/schema";
import { cn } from "@/lib/utils";

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// The analysis steps this view renders (text lives on the row, images by key).
const STEPS = SOP_STEPS.filter((s) => s.key !== "dailyBias");

export function PremarketDetail({
  open,
  onOpenChange,
  row,
  shots,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: TradeJournalRow | null;
  shots: TradeScreenshotRow[];
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  // Two-tap delete: first tap arms it, second tap actually deletes.
  const [armed, setArmed] = useState(false);
  // In-app zoomable viewer over this analysis' screenshots.
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  if (!row) return null;

  const openImage = (imgId: string) => {
    const i = shots.findIndex((s) => s.id === imgId);
    if (i >= 0) setLbIndex(i);
  };

  function remove() {
    if (!armed) {
      setArmed(true);
      return;
    }
    startTransition(async () => {
      try {
        await deletePremarket(row!.id);
        toast.success("Analysis deleted");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't delete — try again");
      }
    });
  }
  const asset = ASSETS[row.asset as AssetKey];
  const byStep = (k: string) => shots.filter((s) => s.stepKey === k);
  const values: Record<string, string> = {
    topDownAnalysis: row.topDownAnalysis,
    marketStructure: row.marketStructure,
    quarterlyTheory: row.quarterlyTheory,
    pdArray: row.pdArray,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            Pre-market analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Header line */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-lg">
              {asset?.emoji ?? "📈"}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{row.asset}</span>
                <span className={cn("text-xs font-bold", biasClasses(row.dailyBias))}>
                  {row.dailyBias}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {row.date ? DAY_FMT.format(new Date(row.date + "T00:00:00")) : "—"}
              </div>
            </div>
          </div>

          {/* SOP analysis steps 1,3,4,5 */}
          {STEPS.map((s) => {
            const text = values[s.key] ?? "";
            const imgs = byStep(s.key);
            if (!text && !imgs.length) return null;
            return (
              <Section key={s.key} label={`${s.n}. ${s.label}`}>
                {text ? (
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {text}
                  </p>
                ) : null}
                <ImageRow imgs={imgs} onOpen={openImage} />
              </Section>
            );
          })}

          {/* Notes / plan */}
          {row.notes || byStep("notes").length ? (
            <Section label="Notes / bias plan">
              {row.notes ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {row.notes}
                </p>
              ) : null}
              <ImageRow imgs={byStep("notes")} onOpen={openImage} />
            </Section>
          ) : null}

          {STEPS.every((s) => !(values[s.key] ?? "") && !byStep(s.key).length) &&
          !row.notes &&
          !byStep("notes").length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              This analysis is empty.
            </p>
          ) : null}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={remove}
            disabled={pending}
            className={cn(
              "gap-1.5 text-destructive hover:text-destructive",
              armed && "bg-destructive/10 font-semibold",
            )}
          >
            <Trash2 className="h-4 w-4" />
            {pending ? "Deleting…" : armed ? "Tap again to delete" : "Delete"}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={onEdit}
              className="gap-1.5 bg-brand text-white hover:bg-brand/90"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>
        </DialogFooter>

        {lbIndex != null ? (
          <Lightbox
            images={shots.map((s) => s.image)}
            index={lbIndex}
            onClose={() => setLbIndex(null)}
            onIndex={setLbIndex}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ImageRow({
  imgs,
  onOpen,
}: {
  imgs: TradeScreenshotRow[];
  onOpen: (imgId: string) => void;
}) {
  if (!imgs.length) return null;
  const single = imgs.length === 1;
  return (
    <div
      className={cn(
        "mt-2 gap-3",
        single ? "block" : "grid grid-cols-1 sm:grid-cols-2",
      )}
    >
      {imgs.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onOpen(s.id)}
          title="Tap to zoom"
          className="block w-full overflow-hidden rounded-xl border border-border transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt="" className="h-auto w-full" />
        </button>
      ))}
    </div>
  );
}
