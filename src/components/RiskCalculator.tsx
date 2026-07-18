"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSETS, ASSET_KEYS, TRADE_META, type AssetKey } from "@/lib/assets";
import { cn } from "@/lib/utils";

const KEY = "sop_risk_calc";
const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

type Saved = {
  asset: AssetKey;
  balance: string;
  riskPct: string;
  entry: string;
  sl: string;
  tp: string;
  vpp: Record<AssetKey, string>;
};

// Position-size / risk calculator. Turns account × risk% × entry/SL into a
// concrete lot/contract size, $ risk, and R:R — asset-aware for gold vs NQ.
export function RiskCalculator() {
  const [asset, setAsset] = useState<AssetKey>("XAUUSD");
  const [balance, setBalance] = useState("10000");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [vpp, setVpp] = useState<Record<AssetKey, string>>(() =>
    Object.fromEntries(
      (Object.keys(TRADE_META) as AssetKey[]).map((k) => [
        k,
        String(TRADE_META[k].valuePerPoint),
      ]),
    ) as Record<AssetKey, string>,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const p = JSON.parse(s) as Partial<Saved>;
        if (p.asset) setAsset(p.asset);
        if (p.balance != null) setBalance(p.balance);
        if (p.riskPct != null) setRiskPct(p.riskPct);
        if (p.entry != null) setEntry(p.entry);
        if (p.sl != null) setSl(p.sl);
        if (p.tp != null) setTp(p.tp);
        if (p.vpp) setVpp((v) => ({ ...v, ...p.vpp }));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const data: Saved = { asset, balance, riskPct, entry, sl, tp, vpp };
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [loaded, asset, balance, riskPct, entry, sl, tp, vpp]);

  const meta = TRADE_META[asset];

  const res = useMemo(() => {
    const bal = num(balance);
    const rp = num(riskPct);
    const e = num(entry);
    const s = num(sl);
    const t = num(tp);
    const v = num(vpp[asset]);

    const riskAmt = bal != null && rp != null ? (bal * rp) / 100 : null;
    const stopDist = e != null && s != null ? Math.abs(e - s) : null;
    const size =
      riskAmt != null && stopDist != null && v != null && stopDist > 0 && v > 0
        ? riskAmt / (stopDist * v)
        : null;
    const rewardDist = e != null && t != null ? Math.abs(t - e) : null;
    const rewardAmt =
      size != null && rewardDist != null && v != null
        ? size * rewardDist * v
        : null;
    const rr =
      stopDist != null && rewardDist != null && stopDist > 0
        ? rewardDist / stopDist
        : null;
    return { riskAmt, stopDist, size, rewardDist, rewardAmt, rr };
  }, [balance, riskPct, entry, sl, tp, vpp, asset]);

  const money = (n: number | null) =>
    n == null ? "—" : `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      {/* Asset */}
      <div className="flex rounded-md border border-border p-0.5">
        {ASSET_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setAsset(k)}
            className={cn(
              "flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors",
              asset === k
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k}{" "}
            <span className="font-normal opacity-70">{ASSETS[k].name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Balance ($)">
          <Input
            className="mono-nums"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </Field>
        <Field label="Risk (%)">
          <Input
            className="mono-nums"
            inputMode="decimal"
            value={riskPct}
            onChange={(e) => setRiskPct(e.target.value)}
          />
        </Field>
        <Field label="Entry">
          <Input
            className="mono-nums"
            inputMode="decimal"
            placeholder="0.00"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        </Field>
        <Field label="Stop Loss" tone="bear">
          <Input
            className="mono-nums"
            inputMode="decimal"
            placeholder="0.00"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
          />
        </Field>
        <Field label="Take Profit (optional)" tone="bull">
          <Input
            className="mono-nums"
            inputMode="decimal"
            placeholder="0.00"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
          />
        </Field>
        <Field label={`$ / ${meta.pointName} per ${meta.unit}`}>
          <Input
            className="mono-nums"
            inputMode="decimal"
            value={vpp[asset]}
            onChange={(e) => setVpp((v) => ({ ...v, [asset]: e.target.value }))}
          />
        </Field>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Position Size
            </div>
            <div className="mono-nums text-2xl font-bold tabular-nums text-primary">
              {res.size == null ? "—" : res.size.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {meta.unit}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Risk
            </div>
            <div className="mono-nums text-2xl font-bold tabular-nums text-bear">
              {money(res.riskAmt)}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 pt-3 text-sm">
          <Metric label="Stop" value={res.stopDist == null ? "—" : res.stopDist.toFixed(meta.decimals)} />
          <Metric
            label="R : R"
            value={res.rr == null ? "—" : `1:${res.rr.toFixed(2)}`}
            tone={res.rr != null ? (res.rr >= 2 ? "bull" : res.rr >= 1 ? "warn" : "bear") : undefined}
          />
          <Metric label="Reward" value={money(res.rewardAmt)} tone="bull" />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Position size = $ risk ÷ (stop distance × value per {meta.pointName}).
        Check your broker&apos;s contract value (e.g. NQ E-mini $20/pt, Micro
        $2/pt, other CFDs).
      </p>
    </div>
  );
}

function Field({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "bull" | "bear";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label
        className={cn(
          "text-[11px] uppercase tracking-wide text-muted-foreground",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
        )}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear" | "warn";
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mono-nums font-semibold tabular-nums",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
    </div>
  );
}
