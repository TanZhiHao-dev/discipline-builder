"use client";

import { useEffect, useMemo, useState } from "react";
import { Bitcoin } from "lucide-react";
import { ProtocolGuide } from "@/components/crypto/ProtocolGuide";
import { CoinScorer } from "@/components/crypto/CoinScorer";
import { AutoScreener } from "@/components/crypto/AutoScreener";
import { NarrativeTracker } from "@/components/crypto/NarrativeTracker";
import { AutoNarratives } from "@/components/crypto/AutoNarratives";
import { PortfolioAllocator } from "@/components/crypto/PortfolioAllocator";
import { ResearchLibrary } from "@/components/crypto/ResearchLibrary";
import { KevinMethod } from "@/components/crypto/KevinMethod";
import { MindsetLibrary } from "@/components/crypto/MindsetLibrary";
import { cyclePhase, fngTone } from "@/lib/crypto";
import type { CryptoNarrativeRow, CoinScoreRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Tab =
  | "protocol"
  | "research"
  | "method"
  | "mindset"
  | "scorer"
  | "narratives"
  | "allocator";

const TABS: { key: Tab; label: string }[] = [
  { key: "protocol", label: "Protocol" },
  { key: "research", label: "Research" },
  { key: "method", label: "Metode KJ" },
  { key: "mindset", label: "Mindset" },
  { key: "scorer", label: "Coin Scorer" },
  { key: "narratives", label: "Narratives" },
  { key: "allocator", label: "Allocator" },
];

export function CryptoWorkspace({
  narratives,
  coinScores,
  today,
}: {
  narratives: CryptoNarrativeRow[];
  coinScores: CoinScoreRow[];
  today: string;
}) {
  const [tab, setTab] = useState<Tab>("protocol");
  const [preset, setPreset] = useState<{ coin: string; id: string; n: number } | undefined>();
  const phase = useMemo(() => cyclePhase(new Date(today + "T00:00:00")), [today]);

  function scoreCoin(coin: string, id: string) {
    // bump `n` so repeated picks of the same coin still re-trigger the fill
    setPreset((p) => ({ coin, id, n: (p?.n ?? 0) + 1 }));
    setTab("scorer");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center gap-2">
        <Bitcoin className="h-6 w-6 text-warn" />
        <h1 className="font-headline text-3xl font-medium text-ink">Crypto</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        AC Protocol — riset narasi, skoring fundamental, timing Flow-Pause-Grab,
        dan alokasi porto dalam satu tempat.
      </p>

      <CycleActionPanel phase={phase} />

      {/* Tabs */}
      <div className="mt-5 inline-flex flex-wrap rounded-full border border-border bg-secondary/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "protocol" ? <ProtocolGuide /> : null}
        {tab === "research" ? <ResearchLibrary /> : null}
        {tab === "method" ? <KevinMethod /> : null}
        {tab === "mindset" ? <MindsetLibrary /> : null}
        {tab === "scorer" ? (
          <div className="space-y-8">
            <AutoScreener onScore={scoreCoin} />
            <CoinScorer saved={coinScores} preset={preset} />
          </div>
        ) : null}
        {tab === "narratives" ? (
          <div className="space-y-8">
            <AutoNarratives today={today} />
            <NarrativeTracker narratives={narratives} today={today} />
          </div>
        ) : null}
        {tab === "allocator" ? <PortfolioAllocator /> : null}
      </div>
    </div>
  );
}

// Cycle phase + Fear&Greed + a prominent "what to do NOW" playbook.
function CycleActionPanel({
  phase,
}: {
  phase: ReturnType<typeof cyclePhase>;
}) {
  const [fng, setFng] = useState<{ value: number | null } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/crypto/fng")
      .then((r) => r.json())
      .then((d) => alive && setFng(d))
      .catch(() => alive && setFng({ value: null }));
    return () => {
      alive = false;
    };
  }, []);
  const tone = fng?.value != null ? fngTone(fng.value) : null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
      {/* Top line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        <span className="font-semibold text-ink">
          {phase.emoji} {phase.name}
        </span>
        <span className="tnum text-xs text-muted-foreground">
          {phase.daysSinceHalving}d pasca-halving · {phase.daysToNextHalving}d ke
          halving berikut
        </span>
        {tone && fng?.value != null ? (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Fear &amp; Greed</span>
            <span className={cn("tnum font-bold", tone.cls)}>{fng.value}</span>
            <span className={cn("text-xs font-medium", tone.cls)}>{tone.label}</span>
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-foreground">{phase.summary}</p>

      {/* What to do now */}
      <div className="mt-3 rounded-xl border border-border bg-card p-3.5">
        <div className="text-xs font-bold uppercase tracking-wide text-brand">
          🎯 Yang harus dilakukan sekarang
        </div>
        <ul className="mt-2 space-y-1.5">
          {phase.playbook.map((p, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-foreground"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {p}
            </li>
          ))}
        </ul>
        {tone && fng?.value != null ? (
          <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
            Sentimen: <span className={cn("font-medium", tone.cls)}>{tone.label}</span>{" "}
            — {tone.advice}
          </p>
        ) : null}
      </div>
    </div>
  );
}
