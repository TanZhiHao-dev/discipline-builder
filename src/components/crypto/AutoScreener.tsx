"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ScreenCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number | null;
  tier: "big" | "mid" | "low";
  price: number | null;
  change24h: number | null;
  change7d: number | null;
  supplyRatio: number | null;
  screen: number;
};

const TIER_META: Record<string, { label: string; cls: string }> = {
  big: { label: "Big", cls: "bg-done/10 text-done" },
  mid: { label: "Mid", cls: "bg-brand/10 text-brand" },
  low: { label: "Low", cls: "bg-warn/15 text-foreground" },
};

function pctCls(n: number | null): string {
  if (n == null) return "text-muted-foreground";
  return n >= 0 ? "text-done" : "text-destructive";
}
function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function AutoScreener({
  onScore,
}: {
  onScore: (coin: string, id: string) => void;
}) {
  const [coins, setCoins] = useState<ScreenCoin[] | null>(null);
  const [tierFilter, setTierFilter] = useState<"all" | "big" | "mid" | "low">("all");
  const [loading, setLoading] = useState(true);
  const [at, setAt] = useState<number | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/crypto/screener")
      .then((r) => r.json())
      .then((d) => {
        setCoins(d.coins ?? []);
        setAt(d.at ?? null);
      })
      .catch(() => setCoins([]))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const shown = (coins ?? [])
    .filter((c) => tierFilter === "all" || c.tier === tierFilter)
    .slice(0, 30);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">
            📋 Auto watchlist — kandidat sesuai protokol
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Screen otomatis (supply · momentum · likuiditas) dari data live.
            Fundamental lengkap (founder/VC/komunitas) tetap pakai Coin Scorer di
            bawah.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Tier filter */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["all", "big", "mid", "low"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
              tierFilter === t
                ? "border-ink bg-ink text-white"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "all" ? "Semua" : t}
          </button>
        ))}
      </div>

      {loading && !coins ? (
        <div className="flex h-24 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Data screener tidak tersedia sekarang — coba refresh.
        </p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {shown.map((c) => {
            const tm = TIER_META[c.tier];
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5"
              >
                <div className="tnum w-8 shrink-0 text-center text-sm font-extrabold text-ink">
                  {c.screen}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-ink">{c.symbol}</span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", tm.cls)}>
                      {tm.label} #{c.rank ?? "—"}
                    </span>
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                    <span className={pctCls(c.change7d)}>7d {fmtPct(c.change7d)}</span>
                    <span className={pctCls(c.change24h)}>24h {fmtPct(c.change24h)}</span>
                    {c.supplyRatio != null ? (
                      <span>beredar {Math.round(c.supplyRatio * 100)}%</span>
                    ) : null}
                  </span>
                </span>
                <button
                  onClick={() => onScore(c.symbol, c.id)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-secondary"
                >
                  Skor →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {at ? (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Data CoinGecko · di-cache & diperbarui tiap jam.
        </p>
      ) : null}
    </div>
  );
}
