"use client";

import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { PILLARS, PYRAMID, WISDOM } from "@/lib/kitab";
import { KajianTambahan } from "@/components/kitab/KajianTambahan";
import { cn } from "@/lib/utils";

// A read-only reference of the ICDT "Market Maker Logic" method — the pyramid,
// the pillars (with what-to-look-for blocks), and the wisdom. One click away
// while journaling in Discipline Builder.
export function KitabView({ embedded = false }: { embedded?: boolean }) {
  const method = PILLARS.filter((p) => p.layer > 0).sort((a, b) => b.layer - a.layer);
  const support = PILLARS.filter((p) => p.layer === 0);

  return (
    <div className={embedded ? "" : "mx-auto max-w-3xl px-5 py-8"}>
      <div className="mb-6">
        {embedded ? null : (
          <h1 className="font-headline text-3xl font-medium text-ink">Kitab</h1>
        )}
        <p className={cn("text-sm text-muted-foreground", !embedded && "mt-1")}>
          The ICDT “Market Maker Logic” method — your reference while you trade.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Distilled from the full ICDT course · David Dharmawan · Pertemuan 1–12.
        </p>
      </div>

      {/* Pyramid */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          The pyramid — build bottom-up
        </div>
        <div className="flex flex-col items-center gap-1.5">
          {PYRAMID.map((p, i) => {
            // PYRAMID is top→bottom; render narrowest (Entry) at top.
            const width = 45 + i * 11; // % width grows toward the base
            return (
              <div
                key={p.id}
                className="rounded-lg bg-brand/10 py-2 text-center text-xs font-semibold text-ink ring-1 ring-brand/20"
                style={{ width: `${width}%` }}
              >
                {p.label}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Entry is the easy peak — the base (Top Down Analysis) carries the weight.
        </p>
      </div>

      {/* Method pillars */}
      <h2 className="mb-3 font-semibold text-ink">The method</h2>
      <div className="space-y-2.5">
        {method.map((p) => (
          <PillarCard key={p.id} pillar={p} defaultOpen={false} />
        ))}
      </div>

      {/* Supporting */}
      <h2 className="mb-3 mt-8 font-semibold text-ink">
        The mortar — mental · capital · evaluation
      </h2>
      <div className="space-y-2.5">
        {support.map((p) => (
          <PillarCard key={p.id} pillar={p} defaultOpen={false} />
        ))}
      </div>

      {/* Wisdom */}
      <h2 className="mb-3 mt-8 font-semibold text-ink">Wisdom</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {WISDOM.map((w, i) => (
          <div
            key={i}
            className="flex gap-2 rounded-xl border border-border bg-secondary/40 p-3.5 text-sm text-foreground"
          >
            <Quote className="h-4 w-4 shrink-0 text-brand" />
            <span className="leading-relaxed">{w}</span>
          </div>
        ))}
      </div>

      {/* Enrichment layer — additive; core Kitab above stays untouched. */}
      <KajianTambahan />
    </div>
  );
}

function PillarCard({
  pillar,
  defaultOpen,
}: {
  pillar: (typeof PILLARS)[number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">
          {pillar.layer > 0 ? pillar.layer : "•"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-semibold text-ink">{pillar.title}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {pillar.kicker}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {pillar.source}
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
        <div className="space-y-4 border-t border-border px-4 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {pillar.summary}
          </p>
          {pillar.blocks.map((b, i) => (
            <div key={i}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
                {b.h}
              </div>
              <ul className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[13px] leading-relaxed text-foreground"
                  >
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
