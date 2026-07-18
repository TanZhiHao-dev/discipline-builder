"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NARRATIVE_DURATIONS,
  DEFAULT_NARRATIVE_MONTHS,
} from "@/lib/crypto-kitab";
import { saveNarrative, deleteNarrative } from "@/server/crypto";
import type { CryptoNarrativeRow } from "@/db/schema";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  watching: { label: "Watching", cls: "bg-secondary text-muted-foreground" },
  active: { label: "Active", cls: "bg-brand/10 text-brand" },
  exited: { label: "Exited", cls: "bg-done/10 text-done" },
};

// Months elapsed since startDate, and whether the play is past its window.
function ageInfo(row: CryptoNarrativeRow, today: string) {
  if (!row.startDate) return null;
  const start = new Date(row.startDate + "T00:00:00");
  const now = new Date(today + "T00:00:00");
  const months = (now.getTime() - start.getTime()) / (30.44 * 86400000);
  const dur = row.durationMonths; // null = all-year
  return { months, dur };
}

export function NarrativeTracker({
  narratives,
  today,
}: {
  narratives: CryptoNarrativeRow[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CryptoNarrativeRow | null>(null);

  const active = narratives.filter((n) => n.status !== "exited");
  const exited = narratives.filter((n) => n.status === "exited");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Lacak narasi yang lagi kamu mainkan — umur &gt; durasi normal =
          waktunya exit.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="gap-1.5 bg-brand text-white hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" /> Narasi
        </Button>
      </div>

      {narratives.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Belum ada narasi. Tambah yang lagi kamu pantau.
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((n) => (
            <NarrativeCard
              key={n.id}
              row={n}
              today={today}
              onEdit={() => {
                setEditing(n);
                setOpen(true);
              }}
            />
          ))}
          {exited.length > 0 ? (
            <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exited ({exited.length})
            </div>
          ) : null}
          {exited.map((n) => (
            <NarrativeCard
              key={n.id}
              row={n}
              today={today}
              onEdit={() => {
                setEditing(n);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {open ? (
        <NarrativeForm
          key={editing?.id ?? "new"}
          editing={editing}
          today={today}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function NarrativeCard({
  row,
  today,
  onEdit,
}: {
  row: CryptoNarrativeRow;
  today: string;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const age = ageInfo(row, today);
  const overdue =
    age && age.dur != null && row.status === "active" && age.months > age.dur;
  const nearing =
    age && age.dur != null && row.status === "active" && !overdue &&
    age.months > age.dur * 0.75;
  const sm = STATUS_META[row.status] ?? STATUS_META.watching;

  function remove() {
    startTransition(async () => {
      try {
        await deleteNarrative(row.id);
        toast.success("Dihapus");
      } catch {
        toast.error("Gagal");
      }
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3.5",
        overdue ? "border-destructive/50" : "border-border",
        pending && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{row.name}</span>
            {row.quarter ? (
              <span className="text-xs text-muted-foreground">{row.quarter}</span>
            ) : null}
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", sm.cls)}>
              {sm.label}
            </span>
            {age ? (
              <span className="tnum text-xs text-muted-foreground">
                {age.months.toFixed(1)} bln
                {age.dur != null ? ` / ${age.dur}` : " · all-year"}
              </span>
            ) : null}
          </div>
          {row.coins ? (
            <div className="mt-0.5 text-xs text-muted-foreground">🪙 {row.coins}</div>
          ) : null}
          {row.thesis ? (
            <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {row.thesis}
            </div>
          ) : null}
        </button>
        <button
          onClick={remove}
          disabled={pending}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          aria-label="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {overdue ? (
        <div className="mt-2 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
          ⏰ Lewat {age!.dur} bulan — narasi biasanya tak sustain. Siapkan exit /
          rotasi ke narasi berikutnya.
        </div>
      ) : nearing ? (
        <div className="mt-2 rounded-lg bg-warn/15 px-2.5 py-1.5 text-xs font-medium text-foreground">
          ⚠️ Mendekati akhir umur narasi — mulai TP bertahap.
        </div>
      ) : null}
    </div>
  );
}

function NarrativeForm({
  editing,
  today,
  onClose,
}: {
  editing: CryptoNarrativeRow | null;
  today: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(editing?.name ?? "");
  const [quarter, setQuarter] = useState(editing?.quarter ?? defaultQuarter(today));
  const [startDate, setStartDate] = useState(editing?.startDate ?? today);
  const [duration, setDuration] = useState<string>(
    editing?.durationMonths != null ? String(editing.durationMonths) : "",
  );
  const [thesis, setThesis] = useState(editing?.thesis ?? "");
  const [coins, setCoins] = useState(editing?.coins ?? "");
  const [status, setStatus] = useState(editing?.status ?? "watching");

  // Auto-fill duration from the known-narrative list when name matches.
  const known = useMemo(() => {
    const hit = NARRATIVE_DURATIONS.find(
      (d) => d.name.toLowerCase() === name.trim().toLowerCase(),
    );
    return hit;
  }, [name]);

  function applyKnown() {
    if (known) setDuration(known.months == null ? "" : String(known.months));
  }

  function submit() {
    if (!name.trim()) {
      toast.error("Isi nama narasi");
      return;
    }
    startTransition(async () => {
      try {
        await saveNarrative({
          id: editing?.id,
          name: name.trim(),
          quarter,
          startDate: startDate || null,
          durationMonths: duration ? Number(duration) : null,
          thesis,
          coins,
          status: status as "watching" | "active" | "exited",
        });
        toast.success(editing ? "Narasi diperbarui" : "Narasi ditambahkan");
        onClose();
      } catch {
        toast.error("Gagal menyimpan");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-xl text-ink">
            {editing ? "Edit narasi" : "Narasi baru"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <Label>Nama narasi</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="AI, RWA, DePIN, GameFi…"
              list="narrative-suggest"
            />
            <datalist id="narrative-suggest">
              {NARRATIVE_DURATIONS.map((d) => (
                <option key={d.name} value={d.name} />
              ))}
            </datalist>
            {known ? (
              <button
                type="button"
                onClick={applyKnown}
                className="mt-1 text-[11px] font-medium text-brand hover:underline"
              >
                Umur normal {known.name}:{" "}
                {known.months == null ? "sepanjang tahun" : `${known.months} bulan`} — pakai
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kuartal</Label>
              <Input value={quarter} onChange={(e) => setQuarter(e.target.value)} placeholder="2026-Q1" />
            </div>
            <div>
              <Label>Durasi (bulan)</Label>
              <Input
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="kosong = all-year"
              />
            </div>
          </div>
          <div>
            <Label>Mulai (start date)</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Leader / koin</Label>
            <Input value={coins} onChange={(e) => setCoins(e.target.value)} placeholder="RENDER, TAO…" />
          </div>
          <div>
            <Label>Tesis</Label>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={2}
              placeholder="Kenapa narasi ini, katalisnya apa…"
              className="w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>
          <div>
            <Label>Status</Label>
            <div className="flex gap-2">
              {(["watching", "active", "exited"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    status === s
                      ? "border-ink bg-ink text-white"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="bg-brand text-white hover:bg-brand/90">
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-foreground">
      {children}
    </label>
  );
}

function defaultQuarter(today: string): string {
  const d = new Date(today + "T00:00:00");
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}
