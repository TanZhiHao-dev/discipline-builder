"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/journal/Lightbox";
import { getTradeDetail } from "@/server/journal";
import {
  ASSETS,
  biasClasses,
  formatR,
  formatRR,
  judgeExit,
  plannedRR,
  tradeDateMs,
  statusClasses,
  type AssetKey,
} from "@/lib/trade";
import { parseTags } from "@/lib/trade-analytics";
import type { TradeJournalRow, TradeScreenshotRow } from "@/db/schema";
import { cn } from "@/lib/utils";

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

type Detail = {
  row: TradeJournalRow;
  shots: TradeScreenshotRow[];
  // Same-day pre-market analysis for this asset (fills empty SOP steps 1–5).
  plan: { row: TradeJournalRow; shots: TradeScreenshotRow[] } | null;
};

// Read-only, tidy per-SOP-step narrative view of one trade: each step's write-up
// alongside its chart screenshots, so the journal reads like a story.
export function TradeDetail({
  id,
  open,
  onOpenChange,
  onEdit,
  playbooks = [],
}: {
  id: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (row: TradeJournalRow, shots: TradeScreenshotRow[]) => void;
  playbooks?: { id: string; name: string }[];
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  // In-app zoomable viewer over the trade's screenshots (index into shots).
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    let alive = true;
    setLoading(true);
    setDetail(null);
    getTradeDetail(id)
      .then((d) => {
        if (alive) setDetail(d);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, id]);

  const row = detail?.row;
  const shots = detail?.shots ?? [];
  const plan = detail?.plan ?? null;
  const byStep = (key: string) => shots.filter((s) => s.stepKey === key);
  const planByStep = (key: string) =>
    (plan?.shots ?? []).filter((s) => s.stepKey === key);

  // Lightbox spans the trade's own shots + the day-plan's shots.
  const allShots = [...shots, ...(plan?.shots ?? [])];
  const openImage = (imgId: string) => {
    const i = allShots.findIndex((s) => s.id === imgId);
    if (i >= 0) setLbIndex(i);
  };
  const asset = row ? ASSETS[row.asset as AssetKey] : null;
  const sc = row ? statusClasses(row.status) : null;
  const rr = row ? plannedRR(row) : null;
  const tags = row ? parseTags(row.tags) : [];
  const playbookName = row?.playbookId
    ? (playbooks.find((p) => p.id === row.playbookId)?.name ?? null)
    : null;

  // Steps 1–5: use the trade's own write-up; when it's empty, fall back to the
  // same-day pre-market analysis (marked "from pre-market"). Bias stays own.
  const planRow = plan?.row;
  const mergeStep = (key: string, own: string) => {
    const planText =
      planRow && key !== "dailyBias"
        ? ((planRow as unknown as Record<string, string>)[key] ?? "")
        : "";
    const ownShots = byStep(key);
    const pShots = key !== "dailyBias" ? planByStep(key) : [];
    const useTextFromPlan = !own && !!planText;
    const useShotsFromPlan = !ownShots.length && pShots.length > 0;
    return {
      text: own || planText,
      images: ownShots.length ? ownShots : pShots,
      fromPlan: useTextFromPlan || useShotsFromPlan,
    };
  };

  const STEPS: {
    key: string;
    n: number;
    label: string;
    text?: string;
    images: TradeScreenshotRow[];
    fromPlan?: boolean;
  }[] = row
    ? [
        { key: "topDownAnalysis", n: 1, label: "Top-down analysis", ...mergeStep("topDownAnalysis", row.topDownAnalysis) },
        { key: "dailyBias", n: 2, label: "Daily bias", text: row.dailyBias, images: byStep("dailyBias") },
        { key: "marketStructure", n: 3, label: "Advanced market structure", ...mergeStep("marketStructure", row.marketStructure) },
        { key: "quarterlyTheory", n: 4, label: "Quarterly theory", ...mergeStep("quarterlyTheory", row.quarterlyTheory) },
        { key: "pdArray", n: 5, label: "PD array", ...mergeStep("pdArray", row.pdArray) },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {row ? `${asset?.emoji ?? "📈"} ${row.asset}` : "Trade"}
          </DialogTitle>
        </DialogHeader>

        {loading || !row ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              {row.method ? (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                  {row.method}
                </span>
              ) : null}
              {row.grade ? (
                <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">
                  Grade {row.grade}
                </span>
              ) : null}
              <span className={cn("font-medium", biasClasses(row.dailyBias))}>
                {row.dailyBias}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", sc?.soft, sc?.text)}>
                {row.status}
              </span>
              <span
                className={cn(
                  "font-bold",
                  row.resultR == null
                    ? "text-muted-foreground"
                    : row.resultR >= 0
                      ? "text-done"
                      : "text-destructive",
                )}
              >
                {formatR(row.resultR)}
              </span>
              {rr != null ? (
                <span className="text-muted-foreground">RR {formatRR(rr)}</span>
              ) : null}
              <span className="ml-auto text-xs text-muted-foreground">
                {DAY_FMT.format(new Date(tradeDateMs(row)))}
              </span>
            </div>

            {/* Playbook + tags */}
            {playbookName || tags.length ? (
              <div className="-mt-2 flex flex-wrap items-center gap-1.5">
                {playbookName ? (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                    📘 {playbookName}
                  </span>
                ) : null}
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {/* SOP steps 1–5 */}
            {STEPS.map((s) => (
              <StepBlock
                key={s.key}
                n={s.n}
                label={s.label}
                text={s.text}
                images={s.images}
                fromPlan={s.fromPlan}
                onOpen={openImage}
              />
            ))}

            {/* Entry / Stop / Target */}
            <div>
              <StepHeader n={6} label="Entry · Stop · Target · Exit" />
              <div className="mt-1.5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <PriceCell label="Entry" value={row.entryPrice} />
                <PriceCell label="Stop" value={row.stopLoss} tone="text-destructive" />
                <PriceCell label="Target" value={row.takeProfit} tone="text-done" />
                <PriceCell label="Actual exit" value={row.exitPrice} tone="text-brand" />
              </div>
              {(() => {
                const v = judgeExit(row);
                return v ? (
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      v.tone === "good" && "bg-done/10 text-done",
                      v.tone === "warn" && "bg-warn/15 text-foreground",
                      v.tone === "bad" && "bg-destructive/10 text-destructive",
                      v.tone === "neutral" && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {v.label}
                  </div>
                ) : null;
              })()}
              <ImageRow images={byStep("entry")} onOpen={openImage} />
            </div>

            {/* Notes */}
            {(row.notes || byStep("notes").length) ? (
              <div>
                <StepHeader n={7} label="Notes" />
                {row.notes ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">
                    {row.notes}
                  </p>
                ) : null}
                <ImageRow images={byStep("notes")} onOpen={openImage} />
              </div>
            ) : null}

            <div className="flex justify-end border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(row, shots)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
        )}

        {lbIndex != null ? (
          <Lightbox
            images={allShots.map((s) => s.image)}
            index={lbIndex}
            onClose={() => setLbIndex(null)}
            onIndex={setLbIndex}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StepHeader({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
        {n}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
    </div>
  );
}

function StepBlock({
  n,
  label,
  text,
  images,
  fromPlan,
  onOpen,
}: {
  n: number;
  label: string;
  text?: string;
  images: TradeScreenshotRow[];
  fromPlan?: boolean;
  onOpen: (imgId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <StepHeader n={n} label={label} />
        {fromPlan ? (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
            📅 from pre-market
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-1.5 whitespace-pre-wrap text-sm",
          text ? "text-foreground" : "text-muted-foreground/60",
        )}
      >
        {text || "—"}
      </p>
      <ImageRow images={images} onOpen={onOpen} />
    </div>
  );
}

function ImageRow({
  images,
  onOpen,
}: {
  images: TradeScreenshotRow[];
  onOpen: (imgId: string) => void;
}) {
  if (!images.length) return null;
  // One image → show it big at natural aspect; several → 2-up grid, still tall.
  // Tap opens the in-app zoomable viewer.
  const single = images.length === 1;
  return (
    <div className={cn("mt-2 gap-3", single ? "block" : "grid grid-cols-1 sm:grid-cols-2")}>
      {images.map((img) => (
        <button
          key={img.id}
          type="button"
          onClick={() => onOpen(img.id)}
          title="Tap to zoom"
          className="block w-full overflow-hidden rounded-xl border border-border transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.image} alt="" className="h-auto w-full" />
        </button>
      ))}
    </div>
  );
}

function PriceCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("tnum font-semibold", tone)}>
        {value == null ? "—" : value}
      </div>
    </div>
  );
}
