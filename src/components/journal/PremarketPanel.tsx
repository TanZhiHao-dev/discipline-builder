"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Eye, Plus } from "lucide-react";
import { PremarketForm } from "@/components/journal/PremarketForm";
import { PremarketDetail } from "@/components/journal/PremarketDetail";
import { getTradeDetail } from "@/server/journal";
import { ASSETS, biasClasses, type AssetKey } from "@/lib/trade";
import type { TradeJournalRow, TradeScreenshotRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Shot = { stepKey: string; image: string };

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const SHORT_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PremarketPanel({
  premarkets,
  today,
  variant = "live",
}: {
  premarkets: TradeJournalRow[];
  today: string;
  variant?: "live" | "backtest" | "paper";
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TradeJournalRow | null>(null);
  const [editShots, setEditShots] = useState<Shot[] | undefined>(undefined);
  const [showPast, setShowPast] = useState(false);

  // Read-only detail viewer (re-read a past/today analysis).
  const [readRow, setReadRow] = useState<TradeJournalRow | null>(null);
  const [readShots, setReadShots] = useState<TradeScreenshotRow[]>([]);
  const [readOpen, setReadOpen] = useState(false);

  const todays = useMemo(
    () => premarkets.filter((p) => p.date === today),
    [premarkets, today],
  );
  const past = useMemo(
    () => premarkets.filter((p) => (p.date ?? "") < today),
    [premarkets, today],
  );

  function openNew() {
    setEditing(null);
    setEditShots(undefined);
    setFormOpen(true);
  }
  // Read an analysis (fetch its screenshots first).
  async function openRead(row: TradeJournalRow) {
    const detail = await getTradeDetail(row.id);
    setReadRow(row);
    setReadShots(detail?.shots ?? []);
    setReadOpen(true);
  }
  // Switch from the read view into the edit form for the same analysis.
  function editFromRead() {
    if (!readRow) return;
    setEditing(readRow);
    setEditShots(readShots.map((s) => ({ stepKey: s.stepKey, image: s.image })));
    setReadOpen(false);
    setFormOpen(true);
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-ink">Pre-market analysis</h2>
          <span className="text-xs text-muted-foreground">
            {DAY_FMT.format(new Date(today + "T00:00:00"))}
          </span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>

      {/* Today's analyses */}
      {todays.length === 0 ? (
        <button
          onClick={openNew}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="h-4 w-4" /> Start today’s analysis (SOP steps 1–5)
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          {todays.map((p) => (
            <PremarketCard key={p.id} row={p} onOpen={() => openRead(p)} />
          ))}
        </div>
      )}

      {/* Past — day by day for weekly/yearly review */}
      {past.length > 0 ? (
        <div className="mt-4 border-t border-border pt-3">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Past analyses ({past.length})
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showPast && "rotate-180")} />
          </button>
          {showPast ? (
            <div className="mt-2 space-y-1.5">
              {past.map((p) => {
                const asset = ASSETS[p.asset as AssetKey];
                return (
                  <button
                    key={p.id}
                    onClick={() => openRead(p)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
                  >
                    <span className="w-24 shrink-0 tnum text-muted-foreground">
                      {p.date ? SHORT_FMT.format(new Date(p.date + "T00:00:00")) : "—"}
                    </span>
                    <span>{asset?.emoji}</span>
                    <span className="font-medium text-ink">{p.asset}</span>
                    <span className={cn("font-medium", biasClasses(p.dailyBias))}>
                      {p.dailyBias}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {p.topDownAnalysis || "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {formOpen ? (
        <PremarketForm
          key={editing?.id ?? "new-premarket"}
          open={formOpen}
          onOpenChange={setFormOpen}
          editing={editing}
          initialShots={editShots}
          defaultDate={today}
          previous={premarkets}
          variant={variant}
        />
      ) : null}

      {readOpen ? (
        <PremarketDetail
          open={readOpen}
          onOpenChange={setReadOpen}
          row={readRow}
          shots={readShots}
          onEdit={editFromRead}
        />
      ) : null}
    </div>
  );
}

function PremarketCard({ row, onOpen }: { row: TradeJournalRow; onOpen: () => void }) {
  const asset = ASSETS[row.asset as AssetKey];
  return (
    <button
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-ink/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-base">
        {asset?.emoji ?? "📈"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-ink">{row.asset}</span>
          <span className={cn("text-xs font-medium", biasClasses(row.dailyBias))}>
            {row.dailyBias}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {row.topDownAnalysis || "Tap to read / fill your analysis"}
        </span>
      </span>
      <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
