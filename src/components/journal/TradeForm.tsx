"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, ImagePlus, Search, TrendingDown, TrendingUp, X } from "lucide-react";
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
import { AutoTextarea } from "@/components/journal/AutoTextarea";
import { saveTrade } from "@/server/journal";
import {
  ASSET_KEYS,
  ASSETS,
  DEFAULT_METHOD,
  METHODS,
  STATUSES,
  actualR,
  biasClasses,
  formatRR,
  judgeExit,
  type AssetKey,
} from "@/lib/trade";
import { blobToCompressedDataUrl, imagesFromDataTransfer } from "@/lib/image";
import { parseTags } from "@/lib/trade-analytics";
import { SOP_REMINDERS } from "@/lib/kitab";
import { draftKey, readDraft, writeDraft, clearDraft } from "@/lib/draft";
import { getImageDraft, setImageDraft, clearImageDraft } from "@/lib/draft-images";
import { todayStr } from "@/lib/streak";
import type { TradeJournalRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Mode = "live" | "backtest" | "paper";
type Shot = { stepKey: string; image: string };

const NEW_TITLE: Record<Mode, string> = {
  live: "New trade",
  backtest: "New backtest",
  paper: "New paper trade",
};
const LOGGED_TOAST: Record<Mode, string> = {
  live: "Trade logged 📈",
  backtest: "Backtest logged 📊",
  paper: "Paper trade logged 📝",
};
type Shots = Record<string, string[]>;
type Grade = "A" | "B" | "C" | "D" | "F";
type Direction = "Long" | "Short";

const GRADES: Grade[] = ["A", "B", "C", "D", "F"];
const PLAYBOOK_NONE = "__none__";

// Tone for a selected grade button (only confirmed design tokens).
function gradeSelectedClass(g: Grade): string {
  if (g === "A" || g === "B") return "border-done bg-done text-white";
  if (g === "D" || g === "F") return "border-destructive bg-destructive text-white";
  return "border-ink bg-ink text-white"; // C
}

// Screenshot buckets a trade can carry. Analysis-step images (from older trades
// or a copied plan) are preserved on save even though only entry/notes render.
const IMG_STEPS = [
  "topDownAnalysis",
  "marketStructure",
  "quarterlyTheory",
  "pdArray",
  "entry",
  "notes",
] as const;

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function seedShots(initial?: Shot[]): Shots {
  const out: Shots = {};
  for (const k of IMG_STEPS) out[k] = [];
  for (const s of initial ?? []) {
    if (out[s.stepKey]) out[s.stepKey].push(s.image);
  }
  return out;
}

// The daily analysis (SOP steps 1–5) attached to the trade — inherited from the
// day's pre-market plan, kept with the row for the detail view & stats, but not
// edited here (the trade form is execution-only: steps 6–7).
type Prefill = {
  dailyBias: string;
  topDownAnalysis: string;
  marketStructure: string;
  quarterlyTheory: string;
  pdArray: string;
  method: string;
};

function biasToDir(bias: string): Direction {
  return bias === "Bearish" ? "Short" : "Long";
}

export function TradeForm({
  mode,
  open,
  onOpenChange,
  editing,
  initialShots,
  playbooks = [],
  premarketByAsset = {},
}: {
  mode: Mode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: TradeJournalRow | null;
  initialShots?: Shot[];
  playbooks?: { id: string; name: string }[];
  premarketByAsset?: Record<string, Prefill>;
}) {
  const [pending, startTransition] = useTransition();

  const initialAsset = (editing?.asset as AssetKey) ?? "XAUUSD";

  // Restore any in-progress draft (survives refresh/close; cleared on Cancel/save).
  const dkey = draftKey(["trade", mode, editing?.id ?? "new"]);
  type Draft = {
    date: string;
    asset: AssetKey;
    method: string;
    direction: Direction;
    status: string;
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    exitPrice: string;
    resultR: string;
    notes: string;
    grade: Grade | null;
    tags: string;
    playbookId: string;
    inherited: {
      topDownAnalysis: string;
      marketStructure: string;
      quarterlyTheory: string;
      pdArray: string;
    };
  };
  const [draft0] = useState(() => readDraft<Partial<Draft>>(dkey));
  const restored = !!draft0;

  const seededAsset = (draft0?.asset as AssetKey) ?? initialAsset;

  const [tradeDate, setTradeDate] = useState(
    draft0?.date ?? editing?.date ?? todayStr(),
  );
  const [asset, setAsset] = useState<AssetKey>(seededAsset);
  // Today's plan for the selected asset (only for a NEW trade). Reactive to asset.
  const plan = editing ? undefined : premarketByAsset[asset];

  const [method, setMethod] = useState(
    draft0?.method ||
      editing?.method ||
      premarketByAsset[seededAsset]?.method ||
      DEFAULT_METHOD[seededAsset],
  );
  const [direction, setDirection] = useState<Direction>(
    draft0?.direction ??
      (editing
        ? biasToDir(editing.dailyBias)
        : biasToDir(premarketByAsset[seededAsset]?.dailyBias ?? "Neutral")),
  );
  const [status, setStatus] = useState(draft0?.status ?? editing?.status ?? "Running");
  const [entryPrice, setEntry] = useState(
    draft0?.entryPrice ?? editing?.entryPrice?.toString() ?? "",
  );
  const [stopLoss, setSl] = useState(
    draft0?.stopLoss ?? editing?.stopLoss?.toString() ?? "",
  );
  const [takeProfit, setTp] = useState(
    draft0?.takeProfit ?? editing?.takeProfit?.toString() ?? "",
  );
  const [exitPrice, setExit] = useState(
    draft0?.exitPrice ?? editing?.exitPrice?.toString() ?? "",
  );
  const [resultR, setResultR] = useState(
    draft0?.resultR ?? editing?.resultR?.toString() ?? "",
  );
  const [notes, setNotes] = useState(draft0?.notes ?? editing?.notes ?? "");
  const [grade, setGrade] = useState<Grade | null>(
    draft0?.grade !== undefined ? draft0.grade : ((editing?.grade as Grade) ?? null),
  );
  const [tags, setTags] = useState(draft0?.tags ?? editing?.tags ?? "");
  const [playbookId, setPlaybookId] = useState(
    draft0?.playbookId ?? editing?.playbookId ?? "",
  );
  const [shots, setShots] = useState<Shots>(() => seedShots(initialShots));
  const [imgReady, setImgReady] = useState(false);

  // Restore drafted screenshots from IndexedDB (survive accidental close).
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

  // Inherited analysis (steps 1–5). Hidden fields, carried through on save.
  const [inherited, setInherited] = useState(() =>
    draft0?.inherited ?? {
      topDownAnalysis:
        editing?.topDownAnalysis ?? premarketByAsset[initialAsset]?.topDownAnalysis ?? "",
      marketStructure:
        editing?.marketStructure ?? premarketByAsset[initialAsset]?.marketStructure ?? "",
      quarterlyTheory:
        editing?.quarterlyTheory ?? premarketByAsset[initialAsset]?.quarterlyTheory ?? "",
      pdArray: editing?.pdArray ?? premarketByAsset[initialAsset]?.pdArray ?? "",
    },
  );

  // Autosave the form text/selection.
  useEffect(() => {
    writeDraft(dkey, {
      date: tradeDate,
      asset,
      method,
      direction,
      status,
      entryPrice,
      stopLoss,
      takeProfit,
      exitPrice,
      resultR,
      notes,
      grade,
      tags,
      playbookId,
      inherited,
    });
  }, [dkey, tradeDate, asset, method, direction, status, entryPrice, stopLoss, takeProfit, exitPrice, resultR, notes, grade, tags, playbookId, inherited]);

  // Autosave screenshots (IndexedDB) once the initial load settled.
  useEffect(() => {
    if (!imgReady) return;
    setImageDraft(dkey, shots);
  }, [dkey, shots, imgReady]);

  function cancel() {
    clearDraft(dkey);
    clearImageDraft(dkey);
    onOpenChange(false);
  }

  const tagChips = parseTags(tags);
  function removeTag(t: string) {
    setTags(tagChips.filter((x) => x !== t).join(", "));
  }

  // --- Auto RR + auto direction from Entry / SL / TP ---
  const nEntry = num(entryPrice);
  const nSl = num(stopLoss);
  const nTp = num(takeProfit);
  const risk = nEntry != null && nSl != null ? Math.abs(nEntry - nSl) : null;
  const reward = nEntry != null && nTp != null ? Math.abs(nTp - nEntry) : null;
  const rrPlan =
    risk != null && risk > 0 && reward != null ? reward / risk : null;
  // TP should sit on the opposite side of entry from SL — else the plan is off.
  const tpMismatch =
    nEntry != null &&
    nSl != null &&
    nTp != null &&
    nSl !== nEntry &&
    (nSl < nEntry ? nTp <= nEntry : nTp >= nEntry);

  // Auto-pick direction from where the stop sits (SL below entry → Long).
  useEffect(() => {
    if (nEntry == null || nSl == null || nSl === nEntry) return;
    setDirection(nSl < nEntry ? "Long" : "Short");
  }, [nEntry, nSl]);

  // Actual exit → realized R + Status auto-derived from prices, plus a
  // plan-adherence verdict. Runs whenever entry/SL/exit change (also on mount
  // for an edited trade that already has an exit stored).
  const nExit = num(exitPrice);
  const exitVerdict = judgeExit({
    entryPrice: nEntry,
    stopLoss: nSl,
    takeProfit: nTp,
    exitPrice: nExit,
  });
  useEffect(() => {
    const r = actualR(nEntry, nSl, nExit);
    if (r == null) return; // exit empty/incomplete → leave manual values alone
    setResultR((Math.round(r * 100) / 100).toString());
    setStatus(Math.abs(r) <= 0.05 ? "Break Even" : r > 0 ? "Win" : "Loss");
  }, [nEntry, nSl, nExit]);

  function onAssetChange(v: string) {
    const k = v as AssetKey;
    setAsset(k);
    if (!editing) {
      const pm = premarketByAsset[k];
      setMethod(pm?.method || DEFAULT_METHOD[k]);
      setDirection(biasToDir(pm?.dailyBias ?? "Neutral"));
      setInherited({
        topDownAnalysis: pm?.topDownAnalysis ?? "",
        marketStructure: pm?.marketStructure ?? "",
        quarterlyTheory: pm?.quarterlyTheory ?? "",
        pdArray: pm?.pdArray ?? "",
      });
    }
  }

  async function addImages(stepKey: string, files: File[]) {
    if (!files.length) return;
    try {
      const urls = await Promise.all(files.map((f) => blobToCompressedDataUrl(f)));
      setShots((prev) => ({ ...prev, [stepKey]: [...(prev[stepKey] ?? []), ...urls] }));
    } catch {
      toast.error("Couldn't read that image");
    }
  }
  function removeImage(stepKey: string, idx: number) {
    setShots((prev) => ({
      ...prev,
      [stepKey]: (prev[stepKey] ?? []).filter((_, i) => i !== idx),
    }));
  }

  function submit() {
    const screenshots: Shot[] = [];
    for (const k of IMG_STEPS) {
      for (const image of shots[k] ?? []) screenshots.push({ stepKey: k, image });
    }
    startTransition(async () => {
      try {
        await saveTrade({
          id: editing?.id,
          asset,
          mode,
          date: tradeDate,
          method,
          topDownAnalysis: inherited.topDownAnalysis,
          dailyBias: direction === "Short" ? "Bearish" : "Bullish",
          marketStructure: inherited.marketStructure,
          quarterlyTheory: inherited.quarterlyTheory,
          pdArray: inherited.pdArray,
          entryPrice: num(entryPrice),
          stopLoss: num(stopLoss),
          takeProfit: num(takeProfit),
          exitPrice: num(exitPrice),
          status: status as "Running" | "Win" | "Loss" | "Break Even",
          resultR: num(resultR),
          notes,
          grade: grade,
          tags: tags,
          playbookId: playbookId || null,
          screenshots: screenshots as {
            stepKey:
              | "topDownAnalysis"
              | "marketStructure"
              | "quarterlyTheory"
              | "pdArray"
              | "entry"
              | "notes";
            image: string;
          }[],
        });
        toast.success(editing ? "Entry updated" : LOGGED_TOAST[mode]);
        clearDraft(dkey);
        clearImageDraft(dkey);
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save — try again");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {editing ? "Edit" : NEW_TITLE[mode]}
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
          {/* Today's plan context (read-only) — steps 1–5 live in Pre-market */}
          {!editing ? (
            plan ? (
              <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Today’s plan
                  <span className={cn("font-bold", biasClasses(plan.dailyBias))}>
                    {plan.dailyBias}
                  </span>
                </div>
                {plan.topDownAnalysis ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {plan.topDownAnalysis}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  Analysis (steps 1–5) inherited from your pre-market prep. Just
                  log the position below.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-warn/30 bg-warn/[0.07] px-3 py-2 text-[11px] text-muted-foreground">
                No pre-market analysis for {asset} today. Do steps 1–5 in the
                Pre-market panel first — you can still log this trade.
              </div>
            )
          ) : null}

          {/* Date */}
          <Field label="Date" hint="Kapan trade ini terjadi — ubah untuk backdate.">
            <Input
              type="date"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
            />
          </Field>

          {/* Asset + method */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset">
              <Select value={asset} onValueChange={onAssetChange}>
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
            <Field label="Method">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Direction of the position taken (auto-derived from entry vs stop) */}
          <Field
            label="Direction"
            hint="Auto-picked from your entry & stop — tap to override."
          >
            <div className="flex gap-2">
              {(["Long", "Short"] as Direction[]).map((d) => {
                const on = direction === d;
                const long = d === "Long";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDirection(d)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      on
                        ? long
                          ? "border-done bg-done text-white"
                          : "border-destructive bg-destructive text-white"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {long ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Entry / SL / TP + chart image (SOP step 6) */}
          <Field label="Entry · Stop · Target (step 6)">
            <ImageZone
              stepKey="entry"
              images={shots.entry ?? []}
              onAdd={(files) => addImages("entry", files)}
              onRemove={(i) => removeImage("entry", i)}
            >
              <div className="grid grid-cols-3 gap-3">
                <Input
                  inputMode="decimal"
                  placeholder="Entry"
                  value={entryPrice}
                  onChange={(e) => setEntry(e.target.value)}
                />
                <Input
                  inputMode="decimal"
                  placeholder="Stop"
                  value={stopLoss}
                  onChange={(e) => setSl(e.target.value)}
                />
                <Input
                  inputMode="decimal"
                  placeholder="Target"
                  value={takeProfit}
                  onChange={(e) => setTp(e.target.value)}
                />
              </div>
            </ImageZone>
            {rrPlan != null && !tpMismatch ? (
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tnum",
                    rrPlan >= 2
                      ? "bg-done/10 text-done"
                      : rrPlan >= 1
                        ? "bg-warn/15 text-foreground"
                        : "bg-destructive/10 text-destructive",
                  )}
                >
                  RR plan {formatRR(rrPlan)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  auto from entry · stop · target
                </span>
              </div>
            ) : null}
            {tpMismatch ? (
              <p className="mt-1.5 text-[11px] font-medium text-destructive">
                ⚠️ Target is on the same side as the stop — check your entry /
                SL / TP numbers.
              </p>
            ) : null}
            <Reminders step={6} />
          </Field>

          {/* Actual exit vs plan (step 7) */}
          <Field
            label="Actual exit"
            hint="Harga close beneran — buat nilai disiplin TP-mu vs plan."
          >
            <Input
              inputMode="decimal"
              placeholder="Harga exit aktual (kosongkan jika masih running)"
              value={exitPrice}
              onChange={(e) => setExit(e.target.value)}
            />
            {exitVerdict ? (
              <div
                className={cn(
                  "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  exitVerdict.tone === "good" && "bg-done/10 text-done",
                  exitVerdict.tone === "warn" && "bg-warn/15 text-foreground",
                  exitVerdict.tone === "bad" && "bg-destructive/10 text-destructive",
                  exitVerdict.tone === "neutral" && "bg-secondary text-muted-foreground",
                )}
              >
                {exitVerdict.label}
              </div>
            ) : null}
          </Field>

          {/* Status + result R (SOP step 7) */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status (step 7)">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Result (R)" hint="e.g. 2.5 or -1">
              <Input
                inputMode="decimal"
                placeholder="—"
                value={resultR}
                onChange={(e) => setResultR(e.target.value)}
              />
            </Field>
          </div>

          {/* Execution grade */}
          <Field label="Execution grade" hint="How well did you follow the plan?">
            <div className="flex items-center gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={cn(
                    "h-9 w-9 rounded-lg border text-sm font-bold transition-colors",
                    grade === g
                      ? gradeSelectedClass(g)
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {g}
                </button>
              ))}
              {grade ? (
                <button
                  type="button"
                  onClick={() => setGrade(null)}
                  className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="A+ setup, news, FOMO…"
              className="w-full"
            />
            {tagChips.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagChips.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${t}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </Field>

          {/* Playbook */}
          {playbooks.length > 0 ? (
            <Field label="Playbook">
              <Select
                value={playbookId || PLAYBOOK_NONE}
                onValueChange={(v) =>
                  setPlaybookId(v === PLAYBOOK_NONE ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLAYBOOK_NONE}>— none —</SelectItem>
                  {playbooks.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          {/* Notes + image (step 7 journaling) */}
          <Field label="Notes">
            <ImageZone
              stepKey="notes"
              images={shots.notes ?? []}
              onAdd={(files) => addImages("notes", files)}
              onRemove={(i) => removeImage("notes", i)}
            >
              <AutoTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Execution, emotions, lessons…"
              />
            </ImageZone>
            <Reminders step={7} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={cancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={pending}
            className="bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Log it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Wraps a field's input with paste / drop / pick image support + thumbnails.
function ImageZone({
  stepKey,
  images,
  onAdd,
  onRemove,
  children,
}: {
  stepKey: string;
  images: string[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  children: React.ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function onPaste(e: React.ClipboardEvent) {
    const imgs = imagesFromDataTransfer(e.clipboardData);
    if (imgs.length) {
      e.preventDefault(); // keep the pasted image out of the textarea
      onAdd(imgs);
    }
  }
  function onDrop(e: React.DragEvent) {
    const imgs = imagesFromDataTransfer(e.dataTransfer);
    if (imgs.length) {
      e.preventDefault();
      onAdd(imgs);
    }
    setDragOver(false);
  }

  return (
    <div
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      className={cn(
        "rounded-lg",
        dragOver && "ring-2 ring-brand ring-offset-1",
      )}
    >
      {children}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {images.map((src, i) => (
          <div
            key={i}
            className="group relative h-14 w-20 overflow-hidden rounded-md border border-border"
          >
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
          data-step={stepKey}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).filter((f) =>
              f.type.startsWith("image/"),
            );
            e.target.value = "";
            onAdd(files);
          }}
        />
      </div>
    </div>
  );
}

// Collapsible "what to look for" checklist per SOP step, from the ICDT Kitab.
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
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
        />
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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
