"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { saveNarrative } from "@/server/crypto";
import { NARRATIVE_DURATIONS, DEFAULT_NARRATIVE_MONTHS } from "@/lib/crypto-kitab";
import { cn } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  marketCap: number | null;
  change24h: number | null;
  volume24h: number | null;
};

function fmtCap(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${Math.round(n)}`;
}
function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
// Guess a typical duration from the known-narrative list (keyword match).
function guessDuration(name: string): number | null {
  const low = name.toLowerCase();
  const hit = NARRATIVE_DURATIONS.find((d) =>
    low.includes(d.name.toLowerCase().split(" ")[0]),
  );
  if (hit) return hit.months;
  return DEFAULT_NARRATIVE_MONTHS;
}

function quarterOf(today: string): string {
  const d = new Date(today + "T00:00:00");
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

export function AutoNarratives({ today }: { today: string }) {
  const [data, setData] = useState<{ heating: Cat[]; cooling: Cat[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function load() {
    setLoading(true);
    fetch("/api/crypto/narratives")
      .then((r) => r.json())
      .then((d) => setData({ heating: d.heating ?? [], cooling: d.cooling ?? [] }))
      .catch(() => setData({ heating: [], cooling: [] }))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function track(c: Cat) {
    startTransition(async () => {
      try {
        await saveNarrative({
          name: c.name,
          quarter: quarterOf(today),
          startDate: today,
          durationMonths: guessDuration(c.name),
          thesis: `Auto: lagi panas ${fmtPct(c.change24h)} (24h), mcap ${fmtCap(c.marketCap)}.`,
          coins: "",
          status: "watching",
        });
        toast.success(`"${c.name}" masuk tracker`);
        router.refresh();
      } catch {
        toast.error("Gagal menambahkan");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">🔥 Narasi lagi bergerak (live)</h3>
          <p className="text-[11px] text-muted-foreground">
            Sektor CoinGecko diurut momentum 24h · diperbarui tiap jam.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex h-20 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !data || (data.heating.length === 0 && data.cooling.length === 0) ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Data narasi tidak tersedia sekarang — coba refresh.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-done">Memanas ↑</div>
            <div className="space-y-1.5">
              {data.heating.map((c) => (
                <Row key={c.id} c={c} onTrack={() => track(c)} pending={pending} />
              ))}
            </div>
          </div>
          {data.cooling.length ? (
            <div>
              <div className="mb-1.5 text-xs font-semibold text-destructive">
                Mendingin ↓
              </div>
              <div className="space-y-1.5">
                {data.cooling.map((c) => (
                  <Row key={c.id} c={c} onTrack={() => track(c)} pending={pending} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Row({
  c,
  onTrack,
  pending,
}: {
  c: Cat;
  onTrack: () => void;
  pending: boolean;
}) {
  const up = (c.change24h ?? 0) >= 0;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
      <span
        className={cn(
          "tnum w-16 shrink-0 text-sm font-bold",
          up ? "text-done" : "text-destructive",
        )}
      >
        {fmtPct(c.change24h)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {c.name}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          mcap {fmtCap(c.marketCap)}
        </span>
      </span>
      <button
        onClick={onTrack}
        disabled={pending}
        className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> Track
      </button>
    </div>
  );
}
