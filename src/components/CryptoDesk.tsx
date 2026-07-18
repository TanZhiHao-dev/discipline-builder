"use client";

// Crypto Desk — the Terminal's crypto trading + investing toolkit:
// Cycle Compass (halving-anchored phase), Fear & Greed gauge, and the full
// Crypto Playbook (pillars, checklists, wisdom) from @/lib/crypto.
import { useEffect, useMemo, useState } from "react";
import { Bitcoin, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HALVINGS,
  NEXT_HALVING_EST,
  cyclePhase,
  fngTone,
} from "@/lib/crypto";
import { ProtocolGuide } from "@/components/crypto/ProtocolGuide";
import { cn } from "@/lib/utils";

type Fng = { value: number | null; classification?: string };

function useFng(): Fng | null {
  const [fng, setFng] = useState<Fng | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/crypto/fng")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setFng(d);
      })
      .catch(() => {
        if (alive) setFng({ value: null });
      });
    return () => {
      alive = false;
    };
  }, []);
  return fng;
}

/** Compact context strip shown when a crypto asset is selected. */
export function CryptoStrip({ onOpenDesk }: { onOpenDesk: () => void }) {
  const phase = useMemo(() => cyclePhase(new Date()), []);
  const fng = useFng();
  const tone = fng?.value != null ? fngTone(fng.value) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-secondary/30 px-3 py-1.5 text-xs">
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        {phase.emoji} {phase.name}
      </span>
      <span className="tnum text-muted-foreground">
        {phase.daysSinceHalving}d pasca-halving · {phase.daysToNextHalving}d ke
        halving berikut
      </span>
      {tone && fng?.value != null ? (
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">F&G</span>
          <span className={cn("tnum font-bold", tone.cls)}>{fng.value}</span>
          <span className={cn("font-medium", tone.cls)}>{tone.label}</span>
        </span>
      ) : null}
      <button
        onClick={onOpenDesk}
        className="ml-auto font-semibold text-primary hover:underline"
      >
        Open Crypto Desk →
      </button>
    </div>
  );
}

/** The full desk: compass + sentiment + playbook. */
export function CryptoDeskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const phase = useMemo(() => cyclePhase(new Date()), []);
  const fng = useFng();
  const tone = fng?.value != null ? fngTone(fng.value) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-xl">
            <Bitcoin className="h-5 w-5 text-warn" /> Crypto Desk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Cycle Compass */}
          <section className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                🧭 Cycle Compass
              </h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {phase.emoji} {phase.name}
              </span>
              <span className="tnum ml-auto text-[11px] text-muted-foreground">
                {phase.daysSinceHalving} hari sejak halving ·{" "}
                {phase.daysToNextHalving} hari ke ±{NEXT_HALVING_EST.slice(0, 7)}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground">{phase.summary}</p>
            <ul className="mt-2 space-y-1.5">
              {phase.playbook.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
            {/* Halving timeline */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
              {HALVINGS.map((h) => (
                <span key={h.date} className="tnum">
                  {h.label}: {h.date}
                </span>
              ))}
              <span className="tnum font-medium text-foreground">
                Next: ±{NEXT_HALVING_EST}
              </span>
            </div>
            <p className="mt-2 text-[11px] italic text-muted-foreground/70">
              Pola historis, bukan jaminan — pakai sebagai kompas fase, bukan
              jadwal pasti.
            </p>
          </section>

          {/* Fear & Greed */}
          <section className="rounded-xl border border-border bg-secondary/30 p-4">
            <h3 className="text-sm font-bold text-foreground">
              😱 Fear &amp; Greed Index
            </h3>
            {fng?.value != null && tone ? (
              <div className="mt-2 flex items-center gap-4">
                <div className={cn("tnum text-4xl font-extrabold", tone.cls)}>
                  {fng.value}
                </div>
                <div>
                  <div className={cn("text-sm font-bold", tone.cls)}>
                    {tone.label}
                  </div>
                  <p className="text-xs text-muted-foreground">{tone.advice}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {fng ? "Gauge tidak tersedia sekarang." : "Memuat…"}
              </p>
            )}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-done via-warn to-destructive"
                style={{ width: "100%" }}
              />
            </div>
            {fng?.value != null ? (
              <div
                className="tnum -mt-[13px] mb-1 h-4 w-0.5 rounded bg-foreground"
                style={{ marginLeft: `${fng.value}%` }}
              />
            ) : null}
          </section>

          {/* AC Protocol playbook + full-workspace link */}
          <ProtocolGuide />

          <a
            href="/crypto"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/40 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Buka Crypto workspace lengkap (Scorer · Narratives · Allocator) →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

