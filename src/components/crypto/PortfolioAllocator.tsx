"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ALLOCATION_RULES, RPT_SCENARIOS } from "@/lib/crypto-kitab";
import { cn } from "@/lib/utils";

const KEY = "db_crypto_alloc_capital";

function rupiah(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function PortfolioAllocator() {
  const [capital, setCapital] = useState<string>(() => {
    if (typeof window === "undefined") return "100000000";
    return localStorage.getItem(KEY) ?? "100000000";
  });
  const [scenario, setScenario] = useState(RPT_SCENARIOS[0].key);

  const cap = Number(capital) || 0;
  function onCap(v: string) {
    const clean = v.replace(/[^\d]/g, "");
    setCapital(clean);
    try {
      localStorage.setItem(KEY, clean);
    } catch {
      /* ignore */
    }
  }

  const spot = (cap * ALLOCATION_RULES.spotPct) / 100;
  const cash = (cap * ALLOCATION_RULES.cashPct) / 100;
  const perCoin = (cap * ALLOCATION_RULES.maxPerCoinPct) / 100;
  const perEntry = perCoin / ALLOCATION_RULES.entryGrid;
  const sc = RPT_SCENARIOS.find((s) => s.key === scenario)!;
  const futures = cash; // 30% pool available for active/futures per the rule
  const riskPerTrade = (cap * sc.rpt) / 100;

  return (
    <div className="space-y-5">
      {/* Capital input */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-xs font-semibold text-foreground">
          Total modal
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rp</span>
          <Input
            inputMode="numeric"
            value={cap ? cap.toLocaleString("id-ID") : ""}
            onChange={(e) => onCap(e.target.value)}
            placeholder="100.000.000"
            className="tnum text-lg font-bold"
          />
        </div>

        {/* 70/30 split */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label={`Spot (${ALLOCATION_RULES.spotPct}%)`} value={rupiah(spot)} accent="text-done" />
          <Stat label={`Cash / dana darurat (${ALLOCATION_RULES.cashPct}%)`} value={rupiah(cash)} accent="text-brand" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat label={`Max per koin (${ALLOCATION_RULES.maxPerCoinPct}%)`} value={rupiah(perCoin)} />
          <Stat label={`Per entry (÷${ALLOCATION_RULES.entryGrid} grid)`} value={rupiah(perEntry)} />
        </div>
      </div>

      {/* Cap formation */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-ink">
          Formasi 1 narasi — {ALLOCATION_RULES.capFormation.reduce((a, c) => a + c.count, 0)} aset
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Dari budget narasi (mis. 50% spot) dibagi per tier. Angka di bawah = kalau
          tiap koin dijatah max 10% modal.
        </p>
        <div className="mt-3 space-y-2">
          {ALLOCATION_RULES.capFormation.map((f) => (
            <div key={f.tier} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <span className="tnum w-7 shrink-0 text-center text-lg font-extrabold text-ink">
                {f.count}×
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">{f.tier}</div>
                <div className="text-xs text-muted-foreground">{f.note}</div>
              </div>
              <span className="tnum shrink-0 text-sm font-medium text-muted-foreground">
                @ {rupiah(perCoin)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Konservatif BTC/ETH: {ALLOCATION_RULES.coreSplit.btc}% BTC /{" "}
          {ALLOCATION_RULES.coreSplit.eth}% ETH · zona fun: Spot 70 · Meme 10 ·
          NFT 10 · Airdrop 10.
        </p>
      </div>

      {/* Risk-per-trade scenario */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-ink">Profil risk-per-trade</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {RPT_SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => setScenario(s.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                scenario === s.key
                  ? "border-ink bg-ink text-white"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{sc.who}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="RPT" value={`${sc.rpt}%`} />
          <Stat label="Akurasi" value={`${sc.accuracy}%`} />
          <Stat label="RR" value={`1:${sc.rr}`} />
          <Stat label="Trade/bln" value={String(sc.tradesPerMonth)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat label="Risiko / trade" value={rupiah(riskPerTrade)} accent="text-destructive" />
          <Stat label="Proyeksi bulanan" value={sc.monthlyReturn} accent="text-done" />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Pool futures/aktif ≈ {rupiah(futures)} (30%). Max 3 posisi futures ·
          never average down · 2 loss beruntun = istirahat.
        </p>
      </div>
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
    <div className="rounded-xl border border-border bg-background p-3">
      <div className={cn("tnum text-lg font-extrabold text-ink", accent)}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
