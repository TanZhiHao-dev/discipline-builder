"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RESEARCH_SECTORS,
  SECTOR_META,
  researchSorted,
  type ResearchCard,
  type ResearchSector,
} from "@/lib/crypto-research";
import { cn } from "@/lib/utils";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

export function ResearchLibrary() {
  const all = useMemo(() => researchSorted(), []);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<ResearchSector | "all">("all");
  const [open, setOpen] = useState<ResearchCard | null>(null);

  // Only show sector chips that actually have reports.
  const presentSectors = useMemo(() => {
    const set = new Set<ResearchSector>();
    all.forEach((c) => c.sectors.forEach((s) => set.add(s)));
    return RESEARCH_SECTORS.filter((s) => set.has(s.key));
  }, [all]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((c) => {
      if (sector !== "all" && !c.sectors.includes(sector)) return false;
      if (!needle) return true;
      const hay = [
        c.name,
        c.ticker,
        c.category,
        c.thesis,
        ...c.narratives,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [all, q, sector]);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <h2 className="font-semibold text-ink">📚 Research Library — Akademi Crypto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rangkuman riset per-coin dari AC (tesis, narasi, fundamental, risiko,
          verdict). Angka valuasi/harga bersifat{" "}
          <span className="font-medium text-foreground">point-in-time</span>{" "}
          (sesuai tanggal report) — pakai untuk tesis & kerangka, bukan harga
          terkini.
        </p>
      </div>

      {/* Search */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari coin, ticker, narasi…"
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Sector filter */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <FilterChip active={sector === "all"} onClick={() => setSector("all")}>
          Semua
        </FilterChip>
        {presentSectors.map((s) => (
          <FilterChip
            key={s.key}
            active={sector === s.key}
            onClick={() => setSector(s.key)}
          >
            {s.emoji} {s.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {filtered.length} dari {all.length} report
      </div>

      {/* Cards */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <button
            key={c.ticker}
            onClick={() => setOpen(c)}
            className="rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-ring hover:bg-accent/40"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-ink px-2 py-0.5 text-xs font-bold text-white">
                ${c.ticker}
              </span>
              <span className="font-semibold text-ink">{c.name}</span>
              {c.rating ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                  {c.rating}
                </span>
              ) : null}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {fmtDate(c.date)}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {c.sectors.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {SECTOR_META[s].emoji} {SECTOR_META[s].label}
                </span>
              ))}
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-foreground">{c.thesis}</p>
            {c.valuationAtReport ? (
              <div className="mt-2 text-[11px] text-muted-foreground">
                Valuasi saat report:{" "}
                <span className="font-medium text-foreground">
                  {c.valuationAtReport}
                </span>
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Tidak ada report yang cocok.
        </div>
      ) : null}

      <ResearchDetail card={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function FilterChip({
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

function ResearchDetail({
  card,
  onClose,
}: {
  card: ResearchCard | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!card} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {card ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2 font-headline text-xl">
                <span className="rounded-lg bg-ink px-2 py-0.5 text-sm font-bold text-white">
                  ${card.ticker}
                </span>
                {card.name}
                {card.rating ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                    {card.rating}
                  </span>
                ) : null}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{card.category}</span>
                <span>·</span>
                <span>{fmtDate(card.date)}</span>
                <span className="rounded-full bg-warn/15 px-2 py-0.5 font-medium text-foreground">
                  data point-in-time
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {card.sectors.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {SECTOR_META[s].emoji} {SECTOR_META[s].label}
                  </span>
                ))}
                {card.narratives.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    #{n}
                  </span>
                ))}
              </div>

              {/* Snapshot */}
              {(card.valuationAtReport || card.supply || card.extra) && (
                <div className="grid grid-cols-2 gap-2">
                  {card.valuationAtReport ? (
                    <Snap label="Valuasi (saat report)" value={card.valuationAtReport} />
                  ) : null}
                  {card.supply ? <Snap label="Supply" value={card.supply} /> : null}
                  {card.extra?.map((e) => (
                    <Snap key={e.label} label={e.label} value={e.value} />
                  ))}
                </div>
              )}

              <Section title="💡 Tesis">
                <p className="text-foreground">{card.thesis}</p>
              </Section>

              <Section title="📖 Apa ini">
                <p className="text-foreground">{card.what}</p>
              </Section>

              <Section title="🚀 Bull case">
                <List items={card.bull} tone="good" />
              </Section>

              <Section title="⚠️ Risiko">
                <List items={card.risks} tone="bad" />
              </Section>

              <Section title="🎯 Verdict AC">
                <p className="rounded-xl border border-border bg-secondary/40 p-3 text-foreground">
                  {card.verdict}
                </p>
              </Section>

              <a
                href={`https://akademicrypto.com/research/${card.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka report asli di Akademi Crypto
              </a>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-semibold text-ink">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function List({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-foreground">
          <span
            className={cn(
              "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
              tone === "good" ? "bg-done" : "bg-destructive",
            )}
          />
          {it}
        </li>
      ))}
    </ul>
  );
}
