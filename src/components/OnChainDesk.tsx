"use client";

import { useEffect, useState } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ONCHAIN_METRICS, toneClass, type OnchainMetric } from "@/lib/onchain";
import { cn } from "@/lib/utils";

type Point = { key: string; value: number | null; at?: string | null };
type ApiResp = { configured: boolean; metrics: Point[] };

export function OnChainDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/crypto/onchain")
      .then((r) => r.json())
      .then((d: ApiResp) => setData(d))
      .catch(() => setData({ configured: true, metrics: [] }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open && !data) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const byKey = new Map((data?.metrics ?? []).map((m) => [m.key, m]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark max-h-[92vh] overflow-y-auto border-border bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-xl">
            <Activity className="h-5 w-5 text-brand" /> On-Chain · Bitcoin
            <button
              onClick={load}
              disabled={loading}
              title="Refresh"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          Data on-chain & derivatif dari CryptoQuant — baca aliran exchange, paus,
          leverage, dan posisi siklus untuk konteks sebelum entry.
        </p>

        {loading && !data ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : data && !data.configured ? (
          <SetupHint />
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ONCHAIN_METRICS.map((m) => (
              <MetricCard key={m.key} metric={m} point={byKey.get(m.key)} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ metric, point }: { metric: OnchainMetric; point?: Point }) {
  const v = point?.value ?? null;
  const read = v != null ? metric.interpret(v) : null;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <span>{metric.emoji}</span>
        <span className="text-xs font-semibold text-ink">{metric.label}</span>
        {read ? (
          <span className={cn("ml-auto text-[11px] font-bold", toneClass(read.tone))}>
            {read.label}
          </span>
        ) : (
          <span className="ml-auto text-[11px] text-muted-foreground">—</span>
        )}
      </div>

      <div className="mt-1 tnum text-lg font-bold text-ink">
        {v != null ? metric.format(v) : <span className="text-muted-foreground">n/a</span>}
      </div>

      {read ? (
        <p className={cn("mt-1 text-[11px] leading-relaxed", toneClass(read.tone))}>
          {read.advice}
        </p>
      ) : (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{metric.hint}</p>
      )}
    </div>
  );
}

function SetupHint() {
  return (
    <div className="mt-2 rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm">
      <p className="font-semibold text-ink">🔑 API key belum dipasang</p>
      <p className="mt-1.5 text-muted-foreground">
        Tambahkan API key CryptoQuant-mu ke file{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-xs">.env.local</code>{" "}
        (di folder app), lalu rebuild:
      </p>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2.5 text-[11px] text-foreground">
        CRYPTOQUANT_API_KEY=paste_key_kamu_di_sini
      </pre>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Key dibaca server-side saja — tidak pernah dikirim ke browser dan tidak
        ikut ter-commit (.env sudah di-gitignore). Ambil key di
        cryptoquant.com/settings/api.
      </p>
    </div>
  );
}
