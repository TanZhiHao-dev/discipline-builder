"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AC_PROTOCOL, CRYPTO_SOP, CRYPTO_WISDOM } from "@/lib/crypto-kitab";
import { cn } from "@/lib/utils";

// AC Protocol reference — the upgraded crypto playbook: 7 pillars, the
// Flow-Pause-Grab SOP, and wisdom. Own-words distillation.
export function ProtocolGuide() {
  return (
    <div className="space-y-6">
      {/* Protocol one-liner */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
        <div className="font-bold text-ink">AC Protocol — alur harian</div>
        <p className="mt-1 text-muted-foreground">
          Makro & siklus → Narasi (50%) → Fundamental score → Technical
          (Flow-Pause-Grab) → Positioning → Eksekusi & mental. Bobot riset:{" "}
          <span className="font-semibold text-foreground">
            Narrative 50% · Technical 30% · Fundamental 20%
          </span>
          .
        </p>
      </div>

      {/* Pillars */}
      <section>
        <h3 className="mb-2 text-sm font-bold text-ink">📚 7 Pilar</h3>
        <div className="space-y-2">
          {AC_PROTOCOL.map((p) => (
            <Pillar key={p.title} pillar={p} />
          ))}
        </div>
      </section>

      {/* Flow-Pause-Grab SOP */}
      <section>
        <h3 className="mb-2 text-sm font-bold text-ink">
          🌊 SOP Flow-Pause-Grab (7 langkah)
        </h3>
        <div className="space-y-2">
          {CRYPTO_SOP.map((s) => (
            <SopStep key={s.key} step={s} />
          ))}
        </div>
      </section>

      {/* Wisdom */}
      <section className="rounded-2xl border border-border bg-secondary/40 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          🧠 Wisdom
        </h4>
        <ul className="mt-2 space-y-2">
          {CRYPTO_WISDOM.map((w, i) => (
            <li key={i} className="text-sm italic leading-relaxed text-foreground">
              “{w}”
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Pillar({ pillar }: { pillar: (typeof AC_PROTOCOL)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className="text-lg">{pillar.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            {pillar.title}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {pillar.tagline}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul className="space-y-2 border-t border-border px-4 py-3">
          {pillar.points.map((pt, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {pt}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SopStep({ step }: { step: (typeof CRYPTO_SOP)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
          {step.n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            {step.label}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {step.hint}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul className="space-y-1.5 border-t border-border px-4 py-3">
          {step.cari.map((c, i) => (
            <li
              key={i}
              className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground"
            >
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-brand" />
              {c}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
