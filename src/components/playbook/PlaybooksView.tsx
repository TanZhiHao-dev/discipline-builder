"use client";

import { useState } from "react";
import { Plus, BookOpen, Check, ScrollText } from "lucide-react";
import { formatR } from "@/lib/trade";
import {
  PlaybookForm,
  PLAYBOOK_DOT,
  PLAYBOOK_SOFT,
} from "@/components/playbook/PlaybookForm";
import { KitabView } from "@/components/kitab/KitabView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PlaybookRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Stat = { trades: number; winRate: number; netR: number; expectancy: number };

const lines = (s: string) =>
  (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function PlaybooksView({
  playbooks,
  statsByPlaybook,
}: {
  playbooks: PlaybookRow[];
  statsByPlaybook: Record<string, Stat>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlaybookRow | null>(null);
  const [kitabOpen, setKitabOpen] = useState(false);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(pb: PlaybookRow) {
    setEditing(pb);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-medium text-ink">Playbooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your setups — the rules you trade by, scored.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKitabOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ScrollText className="h-4 w-4 text-brand" /> Kitab ICDT
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" /> New playbook
          </button>
        </div>
      </div>

      {playbooks.length === 0 ? (
        <Empty onNew={openNew} />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {playbooks.map((pb) => (
            <PlaybookCard
              key={pb.id}
              pb={pb}
              stat={statsByPlaybook[pb.id]}
              onClick={() => openEdit(pb)}
            />
          ))}
        </div>
      )}

      {formOpen ? (
        <PlaybookForm
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          editing={editing}
        />
      ) : null}

      {/* Kitab ICDT — the method reference behind the ICDT playbook */}
      <Dialog open={kitabOpen} onOpenChange={setKitabOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-xl">
              <ScrollText className="h-5 w-5 text-brand" /> Kitab ICDT
            </DialogTitle>
          </DialogHeader>
          <KitabView embedded />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaybookCard({
  pb,
  stat,
  onClick,
}: {
  pb: PlaybookRow;
  stat?: Stat;
  onClick: () => void;
}) {
  const rules = lines(pb.rules);
  const checklist = lines(pb.checklist);
  const s = stat ?? { trades: 0, winRate: 0, netR: 0, expectancy: 0 };

  return (
    <button
      onClick={onClick}
      className="group flex w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-ink/20"
    >
      {/* Colored left accent */}
      <span
        className={cn("w-1.5 shrink-0", PLAYBOOK_DOT[pb.color] ?? "bg-cat-blue")}
        aria-hidden
      />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 h-3 w-3 shrink-0 rounded-full",
              PLAYBOOK_DOT[pb.color] ?? "bg-cat-blue",
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink">{pb.name}</div>
            {pb.description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{pb.description}</p>
            ) : null}
          </div>
        </div>

        {rules.length > 0 ? (
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Rules
            </div>
            <ul className="mt-1.5 space-y-1">
              {rules.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="text-muted-foreground">•</span>
                  <span className="min-w-0">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {checklist.length > 0 ? (
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Checklist
            </div>
            <ul className="mt-1.5 space-y-1">
              {checklist.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-done" />
                  <span className="min-w-0">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Stats footer */}
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-xs",
            PLAYBOOK_SOFT[pb.color] ?? "bg-cat-blue/12",
          )}
        >
          <span className="text-muted-foreground">
            <span className="tnum font-semibold text-ink">{s.trades}</span> trades
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            <span className="tnum font-semibold text-ink">{s.winRate}%</span> win
          </span>
          <span className="text-muted-foreground">·</span>
          <span
            className={cn(
              "tnum font-semibold",
              s.netR >= 0 ? "text-done" : "text-destructive",
            )}
          >
            {formatR(s.netR)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            <span className="tnum font-semibold text-ink">{formatR(s.expectancy)}</span> avg
          </span>
        </div>
      </div>
    </button>
  );
}

function Empty({ onNew }: { onNew: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <BookOpen className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold text-ink">No playbooks yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Name your setups, write the rules, and score each one over time.
      </p>
      <button
        onClick={onNew}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" /> Create your first playbook
      </button>
    </div>
  );
}
