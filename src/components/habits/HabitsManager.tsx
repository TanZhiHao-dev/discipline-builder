"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Layers, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitForm } from "./HabitForm";
import { habitColor, scheduleLabel, TIME_OF_DAY } from "@/lib/habit-utils";
import type { HabitRow } from "@/db/schema";
import { archiveHabit, deleteHabit } from "@/server/habit";
import { createStack, deleteStack } from "@/server/stack";
import { cn } from "@/lib/utils";

type Stack = { id: string; name: string; timeOfDay: string };

export function HabitsManager({
  habits,
  stacks,
}: {
  habits: HabitRow[];
  stacks: Stack[];
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<null | "new" | HabitRow>(null);
  const [newStack, setNewStack] = useState("");
  const [isPending, startTransition] = useTransition();

  function onArchive(id: string) {
    startTransition(async () => {
      await archiveHabit(id);
      toast.success("Habit archived");
      router.refresh();
    });
  }
  function onDelete(id: string) {
    if (!confirm("Delete this habit and all its history?")) return;
    startTransition(async () => {
      await deleteHabit(id);
      toast.success("Habit deleted");
      router.refresh();
    });
  }
  function addStack() {
    if (!newStack.trim()) return;
    startTransition(async () => {
      await createStack({ name: newStack.trim(), timeOfDay: "anytime" });
      setNewStack("");
      router.refresh();
    });
  }
  function removeStack(id: string) {
    startTransition(async () => {
      await deleteStack(id);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Your habits</h1>
          <p className="text-sm text-muted-foreground">
            {habits.length} active {habits.length === 1 ? "habit" : "habits"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            From template ✨
          </Link>
          <Button onClick={() => setDialog("new")} className="gap-1.5">
            <Plus className="h-4 w-4" /> New habit
          </Button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <div className="text-4xl">🌱</div>
          <p className="mt-3 font-semibold">Start with one small habit</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Consistency beats intensity — pick something easy to repeat.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((h) => {
            const color = habitColor(h.color);
            const tod = TIME_OF_DAY.find((t) => t.key === h.timeOfDay);
            return (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
                    color.soft,
                  )}
                >
                  {h.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{h.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {scheduleLabel(h.scheduleDays)} · {tod?.emoji} {tod?.label}
                    {h.restCreditsPerWeek > 0
                      ? ` · ${h.restCreditsPerWeek} rest/wk`
                      : ""}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDialog(h)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(h.id)}>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(h.id)}
                      className="text-miss focus:text-miss"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine stacks */}
      <div className="mt-8">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Layers className="h-4 w-4 text-primary" /> Routine stacks
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Group habits into blocks so your day feels organized, not scattered.
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {stacks.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
            >
              {s.name}
              <button
                onClick={() => removeStack(s.id)}
                className="text-muted-foreground hover:text-miss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newStack}
            onChange={(e) => setNewStack(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStack()}
            placeholder="New stack, e.g. Morning routine"
            className="max-w-xs"
          />
          <Button variant="secondary" onClick={addStack} disabled={isPending}>
            Add
          </Button>
        </div>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog && dialog !== "new" ? "Edit habit" : "New habit"}
            </DialogTitle>
          </DialogHeader>
          <HabitForm
            initial={dialog && dialog !== "new" ? dialog : undefined}
            stacks={stacks}
            onSaved={() => setDialog(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
