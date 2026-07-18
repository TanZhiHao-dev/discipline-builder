"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COLOR_KEYS,
  HABIT_COLORS,
  HABIT_ICONS,
  TIME_OF_DAY,
  WEEKDAYS,
  parseScheduleDays,
} from "@/lib/habit-utils";
import type { HabitRow } from "@/db/schema";
import { createHabit, updateHabit } from "@/server/habit";
import { cn } from "@/lib/utils";

const PRESETS: { label: string; days: number[] }[] = [
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Weekends", days: [0, 6] },
];

export function HabitForm({
  initial,
  stacks,
  onSaved,
}: {
  initial?: HabitRow;
  stacks: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "✅");
  const [color, setColor] = useState(initial?.color ?? "lavender");
  const [timeOfDay, setTimeOfDay] = useState(initial?.timeOfDay ?? "anytime");
  const [days, setDays] = useState<number[]>(
    initial ? parseScheduleDays(initial.scheduleDays) : [0, 1, 2, 3, 4, 5, 6],
  );
  const [stackId, setStackId] = useState<string>(initial?.stackId ?? "none");
  const [rest, setRest] = useState<number>(initial?.restCreditsPerWeek ?? 1);
  const [isPending, startTransition] = useTransition();

  function toggleDay(n: number) {
    setDays((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n]));
  }

  function submit() {
    if (!name.trim()) {
      toast.error("Give your habit a name");
      return;
    }
    if (days.length === 0) {
      toast.error("Pick at least one day");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          icon,
          color,
          timeOfDay: timeOfDay as "morning" | "afternoon" | "evening" | "anytime",
          scheduleDays: days,
          stackId: stackId === "none" ? null : stackId,
          restCreditsPerWeek: rest,
        };
        if (initial) await updateHabit(initial.id, payload);
        else await createHabit(payload);
        toast.success(initial ? "Habit updated" : "Habit created 🌱");
        router.refresh();
        onSaved();
      } catch {
        toast.error("Couldn't save — try again");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning walk"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1 rounded-lg border border-border p-2">
            {HABIT_ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors",
                  icon === ic ? "bg-secondary ring-2 ring-primary" : "hover:bg-secondary",
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-border p-2">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={HABIT_COLORS[c].label}
                className={cn(
                  "h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition-all",
                  HABIT_COLORS[c].dot,
                  color === c && "ring-2 ring-foreground",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Schedule</Label>
        <div className="mb-2 flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setDays(p.days)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {WEEKDAYS.map((w) => (
            <button
              key={w.n}
              onClick={() => toggleDay(w.n)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                days.includes(w.n)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {w.short.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Time of day</Label>
          <Select value={timeOfDay} onValueChange={setTimeOfDay}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OF_DAY.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.emoji} {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Rest days / week</Label>
          <Select value={String(rest)} onValueChange={(v) => setRest(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "credit" : "credits"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {stacks.length > 0 ? (
        <div className="space-y-1.5">
          <Label>Routine stack (optional)</Label>
          <Select value={stackId} onValueChange={setStackId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No stack</SelectItem>
              {stacks.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button className="w-full" size="lg" onClick={submit} disabled={isPending}>
        {isPending ? "Saving…" : initial ? "Save changes" : "Create habit"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Rest credits protect your streak on off-days — miss without one and the
        streak resets.
      </p>
    </div>
  );
}
