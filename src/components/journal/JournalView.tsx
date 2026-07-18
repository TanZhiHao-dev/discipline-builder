"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TradeForm } from "@/components/journal/TradeForm";
import { TradeDetail } from "@/components/journal/TradeDetail";
import { PremarketPanel } from "@/components/journal/PremarketPanel";
import type { PremarketPrefill } from "@/app/(app)/journal/page";
import {
  ASSETS,
  ASSET_KEYS,
  STATUSES,
  biasClasses,
  computeTradeStats,
  formatR,
  formatRR,
  plannedRR,
  statusClasses,
  tradeDateMs,
  type AssetKey,
} from "@/lib/trade";
import {
  deleteTrade,
  getTradeDetail,
  updateTradeStatus,
} from "@/server/journal";
import { parseTags } from "@/lib/trade-analytics";
import type { TradeJournalRow, TradeScreenshotRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Shot = { stepKey: string; image: string };

type Mode = "live" | "backtest" | "paper";

const MODE_META: Record<
  Mode,
  {
    title: string;
    subtitle: string;
    newLabel: string;
    emptyTitle: string;
    emptySub: string;
  }
> = {
  live: {
    title: "Trading journal",
    subtitle: "Log every trade against your SOP — protect the process, not the P&L.",
    newLabel: "New trade",
    emptyTitle: "No trades logged yet",
    emptySub: "Log your first trade and hold yourself to the process.",
  },
  backtest: {
    title: "Backtest",
    subtitle: "Replay setups and score them by the same 7-step SOP.",
    newLabel: "New backtest",
    emptyTitle: "No backtests yet",
    emptySub: "Replay a setup and score it against your SOP.",
  },
  paper: {
    title: "Paper trading",
    subtitle: "Trade the plan with no money on the line — then evaluate your execution.",
    newLabel: "New paper trade",
    emptyTitle: "No paper trades yet",
    emptySub: "Place a simulated trade and score it against your SOP.",
  },
};

const MONTH_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function JournalView({
  mode,
  rows,
  playbooks = [],
  premarkets = [],
  today,
  premarketByAsset = {},
}: {
  mode: Mode;
  rows: TradeJournalRow[];
  playbooks?: { id: string; name: string }[];
  premarkets?: TradeJournalRow[];
  today?: string;
  premarketByAsset?: Record<string, PremarketPrefill>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TradeJournalRow | null>(null);
  const [editShots, setEditShots] = useState<Shot[] | undefined>(undefined);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Filter bar state (all client-side).
  const [search, setSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");

  // Union of every tag present, for the tag filter.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) for (const t of parseTags(r.tags)) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // Apply filters before grouping + stats so numbers track the view.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (assetFilter !== "All" && r.asset !== assetFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (gradeFilter !== "All" && r.grade !== gradeFilter) return false;
      const rowTags = parseTags(r.tags);
      if (tagFilter !== "All" && !rowTags.includes(tagFilter)) return false;
      if (q) {
        const hay = [r.notes ?? "", r.asset, rowTags.join(" ")]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, assetFilter, statusFilter, gradeFilter, tagFilter]);

  const stats = useMemo(() => computeTradeStats(filtered), [filtered]);

  // Group by month for a journal-like timeline.
  const groups = useMemo(() => {
    const map = new Map<string, TradeJournalRow[]>();
    for (const r of filtered) {
      const key = MONTH_FMT.format(new Date(tradeDateMs(r)));
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  function openNew() {
    setEditing(null);
    setEditShots(undefined);
    setFormOpen(true);
  }
  // Open the edit form seeded with the trade + its screenshots.
  async function openEdit(row: TradeJournalRow) {
    const detail = await getTradeDetail(row.id);
    setEditing(row);
    setEditShots(
      detail?.shots.map((s) => ({ stepKey: s.stepKey, image: s.image })) ?? [],
    );
    setFormOpen(true);
  }
  function openEditWithShots(row: TradeJournalRow, shots: TradeScreenshotRow[]) {
    setDetailId(null);
    setEditing(row);
    setEditShots(shots.map((s) => ({ stepKey: s.stepKey, image: s.image })));
    setFormOpen(true);
  }

  const meta = MODE_META[mode];

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-medium text-ink">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" /> {meta.newLabel}
        </button>
      </div>

      {/* Pre-market / setup analysis (steps 1–5), saved day by day.
          Journal + Paper share one live daily analysis; Backtest is its own. */}
      {today ? (
        <PremarketPanel
          premarkets={premarkets}
          today={today}
          variant={mode === "backtest" ? "backtest" : "live"}
        />
      ) : null}

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Entries" value={stats.total.toString()} />
        <Stat label="Win rate" value={`${stats.winRate}%`} accent="text-done" />
        <Stat
          label="Total R"
          value={formatR(stats.totalR)}
          accent={stats.totalR >= 0 ? "text-done" : "text-destructive"}
        />
        <Stat
          label="Running"
          value={stats.running.toString()}
          accent="text-brand"
        />
      </div>

      {/* Filter bar */}
      {rows.length > 0 ? (
        <FilterBar
          search={search}
          onSearch={setSearch}
          asset={assetFilter}
          onAsset={setAssetFilter}
          status={statusFilter}
          onStatus={setStatusFilter}
          grade={gradeFilter}
          onGrade={setGradeFilter}
          tag={tagFilter}
          onTag={setTagFilter}
          allTags={allTags}
        />
      ) : null}

      {/* List */}
      {rows.length === 0 ? (
        <Empty meta={meta} onNew={openNew} />
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          No entries match these filters.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map(([month, list]) => (
            <div key={month}>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {month}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] tnum">
                  {list.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {list.map((row) => (
                  <TradeRow
                    key={row.id}
                    row={row}
                    onEdit={() => openEdit(row)}
                    onOpen={() => setDetailId(row.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen ? (
        <TradeForm
          key={editing?.id ?? "new"}
          mode={mode}
          open={formOpen}
          onOpenChange={setFormOpen}
          editing={editing}
          initialShots={editShots}
          playbooks={playbooks}
          premarketByAsset={premarketByAsset}
        />
      ) : null}

      <TradeDetail
        id={detailId}
        open={!!detailId}
        onOpenChange={(v) => !v && setDetailId(null)}
        onEdit={openEditWithShots}
        playbooks={playbooks}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={cn("tnum text-2xl font-extrabold text-ink", accent)}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

const GRADE_OPTS = ["All", "A", "B", "C", "D", "F"];
const STATUS_OPTS = ["All", "Win", "Loss", "Break Even", "Running"];

function FilterBar({
  search,
  onSearch,
  asset,
  onAsset,
  status,
  onStatus,
  grade,
  onGrade,
  tag,
  onTag,
  allTags,
}: {
  search: string;
  onSearch: (v: string) => void;
  asset: string;
  onAsset: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  grade: string;
  onGrade: (v: string) => void;
  tag: string;
  onTag: (v: string) => void;
  allTags: string[];
}) {
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-3.5">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search notes, asset, tags…"
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
      />
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <PillGroup
          label="Asset"
          value={asset}
          onChange={onAsset}
          options={["All", ...ASSET_KEYS]}
        />
        <PillGroup
          label="Result"
          value={status}
          onChange={onStatus}
          options={STATUS_OPTS}
        />
        <PillGroup
          label="Grade"
          value={grade}
          onChange={onGrade}
          options={GRADE_OPTS}
        />
        {allTags.length ? (
          <PillGroup
            label="Tag"
            value={tag}
            onChange={onTag}
            options={["All", ...allTags]}
          />
        ) : null}
      </div>
    </div>
  );
}

function PillGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            value === o
              ? "border-ink bg-ink text-white"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TradeRow({
  row,
  onEdit,
  onOpen,
}: {
  row: TradeJournalRow;
  onEdit: () => void;
  onOpen: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const sc = statusClasses(row.status);
  const rr = plannedRR(row);
  const asset = ASSETS[row.asset as AssetKey];
  const tags = parseTags(row.tags);

  function setStatus(next: string) {
    startTransition(async () => {
      try {
        await updateTradeStatus(row.id, next);
      } catch {
        toast.error("Couldn't update");
      }
    });
  }
  function remove() {
    startTransition(async () => {
      try {
        await deleteTrade(row.id);
        toast.success("Deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition-opacity",
        pending && "opacity-60",
      )}
    >
      {/* Body — click to open the tidy detail view */}
      <button
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
          {asset?.emoji ?? "📈"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-ink">{row.asset}</span>
            {row.method ? (
              <span className="truncate text-xs text-muted-foreground">
                {row.method}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className={biasClasses(row.dailyBias)}>{row.dailyBias}</span>
            {rr != null ? <span>RR {formatRR(rr)}</span> : null}
            <span>{DAY_FMT.format(new Date(tradeDateMs(row)))}</span>
            {row.grade ? (
              <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {row.grade}
              </span>
            ) : null}
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </span>
        </span>
      </button>

      {/* Result R */}
      <div
        className={cn(
          "tnum shrink-0 text-right text-sm font-bold",
          row.resultR == null
            ? "text-muted-foreground"
            : row.resultR >= 0
              ? "text-done"
              : "text-destructive",
        )}
      >
        {formatR(row.resultR)}
      </div>

      {/* Status pill (click to cycle via menu) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              sc.soft,
              sc.text,
            )}
          >
            {row.status}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {STATUSES.map((s) => (
            <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
              <span
                className={cn(
                  "mr-2 h-2 w-2 rounded-full",
                  statusClasses(s).dot,
                )}
              />
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Row menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={remove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Empty({
  meta,
  onNew,
}: {
  meta: { newLabel: string; emptyTitle: string; emptySub: string };
  onNew: () => void;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <TrendingUp className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold text-ink">{meta.emptyTitle}</p>
      <p className="mt-1 text-sm text-muted-foreground">{meta.emptySub}</p>
      <button
        onClick={onNew}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" /> {meta.newLabel}
      </button>
    </div>
  );
}
