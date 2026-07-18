"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, Copy, ImagePlus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { savePremarket, deletePremarket } from "@/server/premarket";
import { ASSET_KEYS, ASSETS, BIAS, SOP_STEPS, biasClasses, type AssetKey } from "@/lib/trade";
import { blobToCompressedDataUrl, imagesFromDataTransfer } from "@/lib/image";
import { SOP_REMINDERS } from "@/lib/kitab";
import { draftKey, readDraft, writeDraft, clearDraft } from "@/lib/draft";
import { getImageDraft, setImageDraft, clearImageDraft } from "@/lib/draft-images";
import { todayStr } from "@/lib/streak";
import type { TradeJournalRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Shot = { stepKey: string; image: string };
type Shots = Record<string, string[]>;

const IMG_STEPS = ["topDownAnalysis", "marketStructure", "quarterlyTheory", "pdArray", "notes"] as const;
// The analysis steps (1–5). Entry (6) & Set-and-Forget (7) belong to the trade.
const ANALYSIS_STEPS = SOP_STEPS.filter((s) => s.key !== "dailyBias");

function seedShots(initial?: Shot[]): Shots {
  const out: Shots = {};
  for (const k of IMG_STEPS) out[k] = [];
  for (const s of initial ?? []) if (out[s.stepKey]) out[s.stepKey].push(s.image);
  return out;
}

export function PremarketForm({
  open,
  onOpenChange,
  editing,
  initialShots,
  defaultDate,
  previous = [],
  variant = "live",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: TradeJournalRow | null;
  initialShots?: Shot[];
  defaultDate?: string;
  previous?: TradeJournalRow[];
  variant?: "live" | "backtest" | "paper";
}) {
  const [pending, startTransition] = useTransition();

  // Restore any in-progress draft (survives refresh/close; cleared on Cancel/save).
  const dkey = draftKey(["premarket", variant, editing?.id ?? "new"]);
  const [draft0] = useState(() => readDraft<Record<string, string>>(dkey));
  const restored = !!draft0;

  const [date, setDate] = useState(
    draft0?.date ?? editing?.date ?? defaultDate ?? todayStr(),
  );
  const [asset, setAsset] = useState<AssetKey>(
    (draft0?.asset as AssetKey) ?? (editing?.asset as AssetKey) ?? "XAUUSD",
  );
  const [dailyBias, setDailyBias] = useState(
    draft0?.dailyBias ?? editing?.dailyBias ?? "Neutral",
  );
  const [topDownAnalysis, setTop] = useState(
    draft0?.topDownAnalysis ?? editing?.topDownAnalysis ?? "",
  );
  const [marketStructure, setMs] = useState(
    draft0?.marketStructure ?? editing?.marketStructure ?? "",
  );
  const [quarterlyTheory, setQt] = useState(
    draft0?.quarterlyTheory ?? editing?.quarterlyTheory ?? "",
  );
  const [pdArray, setPd] = useState(draft0?.pdArray ?? editing?.pdArray ?? "");
  const [notes, setNotes] = useState(draft0?.notes ?? editing?.notes ?? "");
  const [shots, setShots] = useState<Shots>(() => seedShots(initialShots));
  const [imgReady, setImgReady] = useState(false);

  // Restore any drafted screenshots from IndexedDB (they take precedence — the
  // draft was written from `shots` which already included the DB images).
  useEffect(() => {
    let alive = true;
    getImageDraft(dkey).then((d) => {
      if (!alive) return;
      if (d) setShots(d);
      setImgReady(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dkey]);

  // Autosave the text of the form as the user types.
  useEffect(() => {
    writeDraft(dkey, {
      date,
      asset,
      dailyBias,
      topDownAnalysis,
      marketStructure,
      quarterlyTheory,
      pdArray,
      notes,
    });
  }, [dkey, date, asset, dailyBias, topDownAnalysis, marketStructure, quarterlyTheory, pdArray, notes]);

  // Autosave screenshots too, once the initial IDB load settled.
  useEffect(() => {
    if (!imgReady) return;
    setImageDraft(dkey, shots);
  }, [dkey, shots, imgReady]);

  function cancel() {
    clearDraft(dkey);
    clearImageDraft(dkey);
    onOpenChange(false);
  }

  const sopValues: Record<string, string> = {
    topDownAnalysis,
    marketStructure,
    quarterlyTheory,
    pdArray,
  };
  const sopSetters: Record<string, (v: string) => void> = {
    topDownAnalysis: setTop,
    marketStructure: setMs,
    quarterlyTheory: setQt,
    pdArray: setPd,
  };

  // Recent analyses worth copying (skip typing from zero). Same asset first,
  // then newest-first; only ones that actually have written content; exclude
  // the row currently being edited.
  const copyCandidates = useMemo(
    () =>
      [...previous]
        .filter((p) => p.id !== editing?.id)
        .filter(
          (p) =>
            p.topDownAnalysis ||
            p.marketStructure ||
            p.quarterlyTheory ||
            p.pdArray ||
            p.notes,
        )
        .sort((a, b) => {
          const sa = a.asset === asset ? 0 : 1;
          const sb = b.asset === asset ? 0 : 1;
          if (sa !== sb) return sa - sb;
          return (b.date ?? "") < (a.date ?? "") ? -1 : 1;
        })
        .slice(0, 12),
    [previous, editing?.id, asset],
  );

  // Copy the write-up (bias + steps 1–5 + notes) from a past analysis. Images
  // stay as-is (charts change daily); user edits what needs updating.
  function copyFrom(row: TradeJournalRow) {
    setDailyBias(row.dailyBias || "Neutral");
    setTop(row.topDownAnalysis ?? "");
    setMs(row.marketStructure ?? "");
    setQt(row.quarterlyTheory ?? "");
    setPd(row.pdArray ?? "");
    setNotes(row.notes ?? "");
    toast.success("Analisa disalin — tinggal edit yang perlu ✍️");
  }

  async function addImages(stepKey: string, files: File[]) {
    if (!files.length) return;
    try {
      const urls = await Promise.all(files.map((f) => blobToCompressedDataUrl(f)));
      setShots((p) => ({ ...p, [stepKey]: [...(p[stepKey] ?? []), ...urls] }));
    } catch {
      toast.error("Couldn't read that image");
    }
  }
  function removeImage(stepKey: string, idx: number) {
    setShots((p) => ({ ...p, [stepKey]: (p[stepKey] ?? []).filter((_, i) => i !== idx) }));
  }

  function submit() {
    const screenshots: Shot[] = [];
    for (const k of IMG_STEPS) for (const image of shots[k] ?? []) screenshots.push({ stepKey: k, image });
    startTransition(async () => {
      try {
        await savePremarket({
          id: editing?.id,
          variant,
          date,
          asset,
          dailyBias: dailyBias as "Bullish" | "Bearish" | "Neutral",
          topDownAnalysis,
          marketStructure,
          quarterlyTheory,
          pdArray,
          notes,
          screenshots: screenshots as {
            stepKey: "topDownAnalysis" | "marketStructure" | "quarterlyTheory" | "pdArray" | "notes";
            image: string;
          }[],
        });
        clearDraft(dkey);
        clearImageDraft(dkey);
        toast.success(editing ? "Analysis updated" : "Pre-market analysis saved 📋");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save — try again");
      }
    });
  }

  function remove() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await deletePremarket(editing.id);
        clearDraft(dkey);
        clearImageDraft(dkey);
        toast.success("Deleted");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {editing ? "Edit pre-market analysis" : "Pre-market analysis"}
          </DialogTitle>
        </DialogHeader>

        {restored ? (
          <div className="rounded-lg border border-done/30 bg-done/[0.07] px-3 py-2 text-[11px] text-muted-foreground">
            ✍️ Draft restored — tulisan &amp; screenshot auto-tersimpan. Menutup
            tetap menyimpan; klik{" "}
            <span className="font-medium text-foreground">Cancel</span> untuk
            mulai dari awal.
          </div>
        ) : null}

        <div className="space-y-4 py-1">
          {/* Date + asset */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Asset">
              <Select value={asset} onValueChange={(v) => setAsset(v as AssetKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {ASSETS[k].emoji} {k} · {ASSETS[k].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Copy a previous analysis so you don't type from scratch */}
          {copyCandidates.length > 0 ? (
            <CopyPrevious
              candidates={copyCandidates}
              currentAsset={asset}
              onPick={copyFrom}
            />
          ) : null}

          {/* Daily bias (step 2) */}
          <Field label="Daily bias (SOP step 2)">
            <div className="flex gap-2">
              {BIAS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setDailyBias(b)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    dailyBias === b
                      ? "border-ink bg-ink text-white"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            <Reminders step={2} />
          </Field>

          {/* SOP analysis steps 1,3,4,5 */}
          {ANALYSIS_STEPS.map((s) => (
            <Field key={s.key} label={`${s.n}. ${s.label}`}>
              <ImageZone
                images={shots[s.key] ?? []}
                onAdd={(f) => addImages(s.key, f)}
                onRemove={(i) => removeImage(s.key, i)}
              >
                <textarea
                  value={sopValues[s.key]}
                  onChange={(e) => sopSetters[s.key](e.target.value)}
                  rows={2}
                  placeholder={s.hint}
                  className="w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
                />
              </ImageZone>
              <Reminders step={s.n} />
            </Field>
          ))}

          {/* Notes */}
          <Field label="Notes / bias plan">
            <ImageZone
              images={shots.notes ?? []}
              onAdd={(f) => addImages("notes", f)}
              onRemove={(i) => removeImage("notes", i)}
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Plan for the day, key levels, what would invalidate the bias…"
                className="w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
              />
            </ImageZone>
          </Field>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={cancel} disabled={pending}>
              Cancel
            </Button>
            {editing ? (
              <Button
                variant="ghost"
                onClick={remove}
                disabled={pending}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            ) : null}
          </div>
          <Button
            onClick={submit}
            disabled={pending}
            className="bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Save analysis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const COPY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

// Dropdown to prefill the form from a past analysis — same-asset ones are
// tagged, so daily repeats don't need retyping from scratch.
function CopyPrevious({
  candidates,
  currentAsset,
  onPick,
}: {
  candidates: TradeJournalRow[];
  currentAsset: AssetKey;
  onPick: (row: TradeJournalRow) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-xs font-medium text-brand transition-colors hover:text-brand/80"
      >
        <Copy className="h-3.5 w-3.5" />
        Salin dari analisa sebelumnya
        <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto">
          {candidates.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-card"
              >
                <span className="w-20 shrink-0 tnum text-muted-foreground">
                  {p.date ? COPY_FMT.format(new Date(p.date + "T00:00:00")) : "—"}
                </span>
                <span>{ASSETS[p.asset as AssetKey]?.emoji ?? "📈"}</span>
                <span className="font-semibold text-ink">{p.asset}</span>
                {p.asset === currentAsset ? (
                  <span className="rounded-full bg-brand/10 px-1.5 py-px text-[9px] font-bold text-brand">
                    aset ini
                  </span>
                ) : null}
                <span className={cn("font-medium", biasClasses(p.dailyBias))}>
                  {p.dailyBias}
                </span>
                <span className="truncate text-muted-foreground">
                  {p.topDownAnalysis || p.marketStructure || p.notes || "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Reminders({ step }: { step: number }) {
  const [open, setOpen] = useState(false);
  const items = SOP_REMINDERS[step];
  if (!items?.length) return null;
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand/80"
      >
        <Search className="h-3 w-3" />
        Cari ini
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul className="mt-1.5 space-y-1 rounded-lg border border-border bg-secondary/40 p-2.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-brand" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ImageZone({
  images,
  onAdd,
  onRemove,
  children,
}: {
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  children: React.ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onPaste={(e) => {
        const imgs = imagesFromDataTransfer(e.clipboardData);
        if (imgs.length) {
          e.preventDefault();
          onAdd(imgs);
        }
      }}
      onDrop={(e) => {
        const imgs = imagesFromDataTransfer(e.dataTransfer);
        if (imgs.length) {
          e.preventDefault();
          onAdd(imgs);
        }
        setDragOver(false);
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      className={cn("rounded-lg", dragOver && "ring-2 ring-brand ring-offset-1")}
    >
      {children}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {images.map((src, i) => (
          <div key={i} className="group relative h-14 w-20 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-14 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-[10px] text-muted-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <ImagePlus className="h-4 w-4" />
          Paste / add
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
            e.target.value = "";
            onAdd(files);
          }}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}
