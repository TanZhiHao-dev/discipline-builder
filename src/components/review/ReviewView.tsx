"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarRange, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveReview } from "@/server/review";
import { draftKey, readDraft, writeDraft, clearDraft } from "@/lib/draft";
import { computeTradeStats, formatR, tradeDateMs } from "@/lib/trade";
import {
  PERIODS,
  periodKeyOf,
  periodLabel,
  type Period,
} from "@/lib/period";
import type { TradeJournalRow, PeriodicReviewRow } from "@/db/schema";
import { cn } from "@/lib/utils";

const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const POINT_LETTER = ["F", "D", "C", "B", "A"];

function avgGrade(rows: TradeJournalRow[]): string {
  const pts = rows
    .map((r) => (r.grade ? GRADE_POINTS[r.grade] : undefined))
    .filter((n): n is number => n != null);
  if (!pts.length) return "—";
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
  return `${POINT_LETTER[Math.round(avg)]} · ${avg.toFixed(1)}`;
}

export function ReviewView({
  trades,
  premarkets,
  reviews,
  today,
}: {
  trades: TradeJournalRow[];
  premarkets: TradeJournalRow[];
  reviews: PeriodicReviewRow[];
  today: string;
}) {
  const [period, setPeriod] = useState<Period>("weekly");
  const todayDate = useMemo(() => new Date(today + "T00:00:00"), [today]);
  const currentKey = periodKeyOf(period, todayDate);
  const [selectedKey, setSelectedKey] = useState(currentKey);

  // If the user switches period tab, snap the selection to that period's current
  // key (keeps the two selectors in sync).
  function switchPeriod(p: Period) {
    setPeriod(p);
    setSelectedKey(periodKeyOf(p, todayDate));
  }

  // Bucket trades by this period's key.
  const tradesByKey = useMemo(() => {
    const map = new Map<string, TradeJournalRow[]>();
    for (const t of trades) {
      const k = periodKeyOf(period, new Date(tradeDateMs(t)));
      const arr = map.get(k) ?? [];
      arr.push(t);
      map.set(k, arr);
    }
    return map;
  }, [trades, period]);

  // Prep (pre-market) count per key — keyed off the analysis date.
  const prepByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of premarkets) {
      if (!p.date) continue;
      const k = periodKeyOf(period, new Date(p.date + "T00:00:00"));
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [premarkets, period]);

  const reviewByKey = useMemo(() => {
    const map = new Map<string, PeriodicReviewRow>();
    for (const r of reviews) {
      if (r.period === period) map.set(r.periodKey, r);
    }
    return map;
  }, [reviews, period]);

  // Which keys to offer: current + any with trades/reviews, newest first.
  const keys = useMemo(() => {
    const set = new Set<string>([currentKey]);
    for (const k of tradesByKey.keys()) set.add(k);
    for (const k of reviewByKey.keys()) set.add(k);
    return [...set].sort((a, b) => (a < b ? 1 : -1));
  }, [currentKey, tradesByKey, reviewByKey]);

  const bucket = tradesByKey.get(selectedKey) ?? [];
  const stats = computeTradeStats(bucket);
  const prepDays = prepByKey.get(selectedKey) ?? 0;
  const rValues = bucket
    .filter((r) => r.status !== "Running" && r.resultR != null)
    .map((r) => r.resultR as number);
  const best = rValues.length ? Math.max(...rValues) : null;
  const worst = rValues.length ? Math.min(...rValues) : null;
  const existing = reviewByKey.get(selectedKey);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-5 w-5 text-brand" />
        <h1 className="font-headline text-3xl font-medium text-ink">Review</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Step back each week, month, and year — read your numbers, then write what
        to keep and what to fix.
      </p>

      {/* Period tabs */}
      <div className="mt-6 inline-flex rounded-full border border-border bg-secondary/60 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => switchPeriod(p.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              period === p.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Which period */}
      <div className="mt-4 flex flex-wrap gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => setSelectedKey(k)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              k === selectedKey
                ? "border-ink bg-ink text-white"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {periodLabel(period, k)}
            {k === currentKey ? " · now" : ""}
            {reviewByKey.has(k) ? (
              <Check className="ml-1 inline h-3 w-3 text-done" />
            ) : null}
          </button>
        ))}
      </div>

      {/* Period summary */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Trades" value={stats.total.toString()} />
        <SummaryStat
          label="Win rate"
          value={stats.closed ? `${stats.winRate}%` : "—"}
          accent="text-done"
        />
        <SummaryStat
          label="Total R"
          value={stats.closed ? formatR(stats.totalR) : "—"}
          accent={stats.totalR >= 0 ? "text-done" : "text-destructive"}
        />
        <SummaryStat label="Avg grade" value={avgGrade(bucket)} />
        <SummaryStat
          label="Best / worst"
          value={
            best == null ? "—" : `${formatR(best)} / ${formatR(worst)}`
          }
        />
        <SummaryStat label="Prep done" value={prepDays.toString()} />
      </div>

      {/* Review form (remounts when period/key changes to reseed) */}
      <ReviewForm
        key={`${period}:${selectedKey}`}
        period={period}
        periodKey={selectedKey}
        label={periodLabel(period, selectedKey)}
        existing={existing}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <div className={cn("tnum text-xl font-extrabold text-ink", accent)}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

const FIELDS: {
  key: "wentWell" | "wentWrong" | "improvements" | "notes";
  label: string;
  hint: string;
}[] = [
  {
    key: "wentWell",
    label: "✅ What went well",
    hint: "Setups you nailed, discipline you kept, good habits to repeat.",
  },
  {
    key: "wentWrong",
    label: "⚠️ What went wrong",
    hint: "Rule breaks, FOMO, revenge trades, missed prep — be honest.",
  },
  {
    key: "improvements",
    label: "🎯 Improvements next period",
    hint: "Concrete, measurable changes you commit to.",
  },
  {
    key: "notes",
    label: "🗒️ Notes",
    hint: "Market conditions, mindset, anything else worth remembering.",
  },
];

function ReviewForm({
  period,
  periodKey,
  label,
  existing,
}: {
  period: Period;
  periodKey: string;
  label: string;
  existing?: PeriodicReviewRow;
}) {
  const [pending, startTransition] = useTransition();

  // Autosave draft so a half-written review survives refresh/navigation.
  const dkey = draftKey(["review", period, periodKey]);
  const [draft0] = useState(() =>
    readDraft<Record<string, string>>(dkey),
  );
  const [vals, setVals] = useState({
    wentWell: draft0?.wentWell ?? existing?.wentWell ?? "",
    wentWrong: draft0?.wentWrong ?? existing?.wentWrong ?? "",
    improvements: draft0?.improvements ?? existing?.improvements ?? "",
    notes: draft0?.notes ?? existing?.notes ?? "",
  });

  useEffect(() => {
    writeDraft(dkey, vals);
  }, [dkey, vals]);

  function set(k: keyof typeof vals, v: string) {
    setVals((p) => ({ ...p, [k]: v }));
  }

  function submit() {
    startTransition(async () => {
      try {
        await saveReview({ period, periodKey, ...vals });
        clearDraft(dkey);
        toast.success(`Review saved · ${label} 📝`);
      } catch {
        toast.error("Couldn't save — try again");
      }
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Your review · {label}</h2>
        {existing ? (
          <span className="rounded-full bg-done/10 px-2.5 py-0.5 text-[11px] font-medium text-done">
            Saved
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Not written yet</span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {f.label}
            </label>
            <textarea
              value={vals[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              rows={3}
              placeholder={f.hint}
              className="w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          onClick={submit}
          disabled={pending}
          className="bg-brand text-white hover:bg-brand/90"
        >
          {pending ? "Saving…" : existing ? "Save changes" : "Save review"}
        </Button>
      </div>
    </div>
  );
}
