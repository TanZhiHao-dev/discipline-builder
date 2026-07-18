"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import {
  KAJIAN_INTRO,
  kajianByGroup,
  type Kajian,
  type KajianGroup,
} from "@/lib/kitab-extra";
import { cn } from "@/lib/utils";

// "Kajian Tambahan" — enrichment layer under the core Kitab. Additive only:
// the pyramid/pillars/SOP above this section are never altered by it.
export function KajianTambahan() {
  const groups = useMemo(() => kajianByGroup(), []);
  const [active, setActive] = useState<KajianGroup | "all">("all");

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  if (total === 0) return null;

  const shown = active === "all" ? groups : groups.filter((g) => g.key === active);

  return (
    <div className="mt-10">
      <h2 className="font-semibold text-ink">📚 Kajian Tambahan — David Dharmawan</h2>
      <p className="mt-1 text-xs text-muted-foreground">{KAJIAN_INTRO}</p>

      {/* Group filter */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip active={active === "all"} onClick={() => setActive("all")}>
          Semua ({total})
        </Chip>
        {groups.map((g) => (
          <Chip key={g.key} active={active === g.key} onClick={() => setActive(g.key)}>
            {g.emoji} {g.label} ({g.items.length})
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        {shown.map((g) => (
          <div key={g.key}>
            <div className="mb-2">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <span>{g.emoji}</span> {g.label}
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{g.blurb}</p>
            </div>
            <div className="space-y-2">
              {g.items.map((k) => (
                <KajianCard key={k.id} kajian={k} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function KajianCard({ kajian }: { kajian: Kajian }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-3.5 text-left"
      >
        {/* Video thumbnail */}
        <span className="relative block shrink-0 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${kajian.videoId}/mqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-[54px] w-24 object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Play className="h-4 w-4 fill-white text-white" />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-semibold text-ink">{kajian.title}</span>
            {kajian.enrichesSteps.map((s) => (
              <span
                key={s}
                className="rounded-full bg-brand/10 px-1.5 py-px text-[9px] font-bold text-brand"
              >
                Step {s}
              </span>
            ))}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{kajian.thesis}</span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <ul className="space-y-1.5">
            {kajian.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {p}
              </li>
            ))}
          </ul>

          {kajian.tips?.length ? (
            <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand">
                💡 Tips
              </div>
              <ul className="space-y-1">
                {kajian.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-done" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <a
            href={`https://www.youtube.com/watch?v=${kajian.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            <Play className="h-3.5 w-3.5" />
            Tonton: {kajian.videoTitle}
          </a>
        </div>
      ) : null}
    </div>
  );
}
