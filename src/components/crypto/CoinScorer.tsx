"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SCORE_METRICS,
  CONVICTION_RULES,
  MIN_CONVICTION,
} from "@/lib/crypto-kitab";
import { saveCoinScore, deleteCoinScore } from "@/server/crypto";
import type { CoinScoreRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Scores = Record<string, number>;
type Fact = { why: string; confidence: "strong" | "proxy" };
type Facts = Record<string, Fact>;

function pct(scores: Scores): number {
  const sum = SCORE_METRICS.reduce((a, m) => a + (scores[m.key] ?? 0), 0);
  return Math.round((sum / (SCORE_METRICS.length * 10)) * 100);
}
function verdict(p: number): { label: string; cls: string } {
  if (p >= 70) return { label: "Layak — conviction kuat", cls: "text-done" };
  if (p >= 50) return { label: "Layak (>50) — bisa masuk", cls: "text-done" };
  if (p >= 35) return { label: "Meragukan — perlu alasan ekstra", cls: "text-warn" };
  return { label: "Belum layak — skip / riset lagi", cls: "text-destructive" };
}

export function CoinScorer({
  saved,
  preset,
}: {
  saved: CoinScoreRow[];
  preset?: { coin: string; id: string; n: number };
}) {
  const [coin, setCoin] = useState("");
  const [scores, setScores] = useState<Scores>({});
  const [facts, setFacts] = useState<Facts>({});
  const [conv, setConv] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoAt, setAutoAt] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch CoinGecko-derived scores and fill the 6 sliders + conviction + facts.
  async function autoFill(opts: { id?: string; q?: string; scroll?: boolean }) {
    setAutoLoading(true);
    try {
      const qs = opts.id ? `id=${encodeURIComponent(opts.id)}` : `q=${encodeURIComponent(opts.q ?? "")}`;
      const res = await fetch(`/api/crypto/score?${qs}`);
      const d = await res.json();
      if (!res.ok || d.error || !d.scores) {
        toast.error("Koin tidak ketemu di CoinGecko");
        return;
      }
      const s: Scores = {};
      const f: Facts = {};
      for (const [k, m] of Object.entries(d.scores as Record<string, { score: number; why: string; confidence: "strong" | "proxy" }>)) {
        s[k] = m.score;
        f[k] = { why: m.why, confidence: m.confidence };
      }
      setCoin(d.symbol || opts.q || "");
      setScores(s);
      setFacts(f);
      setConv(new Set<number>(d.conviction ?? []));
      setAutoAt(d.name ?? d.symbol ?? null);
      if (d.categories?.length) setNote(`Kategori: ${d.categories.join(", ")}`);
      if (opts.scroll) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      toast.error("Gagal ambil data");
    } finally {
      setAutoLoading(false);
    }
  }

  // When the auto-screener picks a coin, auto-fill everything from data.
  useEffect(() => {
    if (!preset) return;
    autoFill({ id: preset.id, scroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.n]);

  const p = useMemo(() => pct(scores), [scores]);
  const v = verdict(p);
  const convCount = conv.size;

  function reset() {
    setCoin("");
    setScores({});
    setFacts({});
    setConv(new Set());
    setNote("");
    setAutoAt(null);
  }

  function save() {
    if (!coin.trim()) {
      toast.error("Isi nama koin dulu");
      return;
    }
    startTransition(async () => {
      try {
        await saveCoinScore({
          coin: coin.trim().toUpperCase(),
          scores,
          conviction: convCount,
          note,
        });
        toast.success(`${coin.toUpperCase()} tersimpan — ${p}/100`);
        reset();
      } catch {
        toast.error("Gagal menyimpan");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Scorer card */}
      <div ref={cardRef} className="scroll-mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-foreground">Koin</label>
            <div className="mt-1 flex gap-2">
              <Input
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && coin.trim()) autoFill({ q: coin.trim() });
                }}
                placeholder="mis. RENDER, ONDO, TAO…"
              />
              <Button
                type="button"
                onClick={() => coin.trim() && autoFill({ q: coin.trim() })}
                disabled={autoLoading || !coin.trim()}
                className="shrink-0 gap-1.5 bg-ink text-white hover:bg-ink/90"
              >
                {autoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Auto-isi
              </Button>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("tnum text-3xl font-extrabold", v.cls)}>
              {p}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <div className={cn("text-xs font-semibold", v.cls)}>{v.label}</div>
          </div>
        </div>

        {autoAt ? (
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/[0.06] px-3 py-2 text-[11px] text-muted-foreground">
            ✨ Auto-diisi dari data CoinGecko ({autoAt}). Metrik{" "}
            <span className="font-semibold text-done">strong</span> = sinyal kuat;{" "}
            <span className="font-semibold text-warn">proxy</span> = perkiraan
            (data tim/VC tak tersedia gratis) — geser manual kalau kamu tahu lebih.
          </div>
        ) : null}

        {/* 6 metrics */}
        <div className="mt-4 space-y-3">
          {SCORE_METRICS.map((m) => {
            const fact = facts[m.key];
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {m.emoji} {m.label}
                    {fact ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          fact.confidence === "strong"
                            ? "bg-done/10 text-done"
                            : "bg-warn/15 text-foreground",
                        )}
                      >
                        {fact.confidence}
                      </span>
                    ) : null}
                  </span>
                  <span className="tnum text-sm font-bold text-ink">
                    {scores[m.key] ?? 0}
                    <span className="text-xs text-muted-foreground">/10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={scores[m.key] ?? 0}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, [m.key]: Number(e.target.value) }))
                  }
                  className="mt-1 w-full accent-brand"
                />
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {fact ? fact.why : m.guide}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conviction rules */}
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              ✅ Conviction rules
            </span>
            <span
              className={cn(
                "tnum text-sm font-bold",
                convCount >= MIN_CONVICTION ? "text-done" : "text-muted-foreground",
              )}
            >
              {convCount}/{MIN_CONVICTION}+ dicentang
            </span>
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {CONVICTION_RULES.map((r, i) => {
              const on = conv.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setConv((prev) => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                    on
                      ? "border-done bg-done/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      on ? "border-done bg-done text-white" : "border-border",
                    )}
                  >
                    {on ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {r}
                </button>
              );
            })}
          </div>
          {convCount < MIN_CONVICTION ? (
            <p className="mt-2 text-[11px] text-warn">
              ⚠️ Minimal {MIN_CONVICTION} alasan (technical + fundamental +
              narrative) sebelum beli.
            </p>
          ) : null}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Catatan tesis / risiko…"
          className="mt-4 w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={reset} disabled={pending}>
            Reset
          </Button>
          <Button
            onClick={save}
            disabled={pending}
            className="gap-1.5 bg-brand text-white hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" /> Simpan skor
          </Button>
        </div>
      </div>

      {/* Saved scores */}
      {saved.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink">
            Koin tersimpan ({saved.length})
          </h3>
          <div className="space-y-2">
            {saved.map((row) => (
              <SavedRow key={row.id} row={row} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SavedRow({ row }: { row: CoinScoreRow }) {
  const [pending, startTransition] = useTransition();
  const scores = useMemo<Scores>(() => {
    try {
      return JSON.parse(row.scores);
    } catch {
      return {};
    }
  }, [row.scores]);
  const p = pct(scores);
  const v = verdict(p);

  function remove() {
    startTransition(async () => {
      try {
        await deleteCoinScore(row.id);
        toast.success("Dihapus");
      } catch {
        toast.error("Gagal");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3.5",
        pending && "opacity-50",
      )}
    >
      <div className={cn("tnum w-14 shrink-0 text-center text-2xl font-extrabold", v.cls)}>
        {p}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{row.coin}</span>
          <span className={cn("text-xs font-medium", v.cls)}>{v.label}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Conviction {row.conviction}/{MIN_CONVICTION}+
          {row.note ? ` · ${row.note}` : ""}
        </div>
      </div>
      <button
        onClick={remove}
        disabled={pending}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        aria-label="Hapus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
