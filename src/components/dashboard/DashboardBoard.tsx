"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Coffee,
  Flame,
  MoreHorizontal,
  Pause,
  Plane,
  Plus,
  Thermometer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreakRing } from "@/components/StreakRing";
import { habitColor, TIME_OF_DAY } from "@/lib/habit-utils";
import type { CheckStatus } from "@/lib/streak";
import { setCheckIn, removeCheckIn } from "@/server/checkin";
import { cn } from "@/lib/utils";

type TodayHabit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  timeOfDay: string;
  stackId: string | null;
  status: CheckStatus | null;
  streak: number;
};

type WeekDay = {
  date: string;
  dayNum: number;
  dow: string;
  isToday: boolean;
  isFuture: boolean;
  state: "done" | "partial" | "none" | "future";
};

interface Props {
  name: string;
  today: string;
  weekStrip: WeekDay[];
  monthRing: { done: number; scheduled: number; pct: number };
  todayPct: number;
  weekPct: number;
  todayHabits: TodayHabit[];
  stacks: { id: string; name: string; timeOfDay: string }[];
  totalHabits: number;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const PROTECT_META: Record<string, { label: string; icon: typeof Coffee }> = {
  rest: { label: "Rest day", icon: Coffee },
  sick: { label: "Sick day", icon: Thermometer },
  travel: { label: "Travel", icon: Plane },
  pause: { label: "Paused", icon: Pause },
};

export function DashboardBoard({
  name,
  today,
  weekStrip,
  monthRing,
  todayPct,
  weekPct,
  todayHabits,
  totalHabits,
}: Props) {
  return (
    <div className="pb-16">
      {/* Dark greeting header */}
      <div className="dark bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-5 pb-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{greeting()}</div>
                <div className="text-lg font-bold capitalize">{name}</div>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Bell className="h-4 w-4" />
            </button>
          </div>

          {/* Week strip */}
          <div className="mt-6 flex justify-between gap-1">
            {weekStrip.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold tnum",
                    d.isToday
                      ? "bg-foreground text-background"
                      : d.state === "done"
                        ? "bg-done/20 text-done"
                        : d.isFuture
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground",
                  )}
                >
                  {d.state === "done" && !d.isToday ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    d.dayNum
                  )}
                  {d.state === "partial" && !d.isToday ? (
                    <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-streak" />
                  ) : null}
                </div>
                <span className="text-[10px] text-muted-foreground">{d.dow}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Light body */}
      <div className="mx-auto -mt-4 max-w-2xl space-y-4 px-5">
        {/* Stat cards */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-2xl font-extrabold">
                <Flame className="h-6 w-6 text-streak" />
                <span className="tnum">
                  {monthRing.done}/{monthRing.scheduled || 0}
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Habits done this month
              </div>
            </div>
            <StreakRing pct={monthRing.pct} size={80} color="text-streak">
              <span className="tnum text-sm font-bold">{monthRing.pct}%</span>
            </StreakRing>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MiniStat label="Today" pct={todayPct} color="text-cat-lavender" />
          <MiniStat label="This week" pct={weekPct} color="text-cat-pink" />
        </div>

        {/* Today's routine */}
        <div className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Today&apos;s routine</h2>
            <Link
              href="/habits"
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Manage
            </Link>
          </div>

          {totalHabits === 0 ? (
            <EmptyState />
          ) : todayHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No habits scheduled for today — enjoy your day off. 🌿
            </div>
          ) : (
            <RoutineGroups habits={todayHabits} today={today} />
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div>
        <div className="tnum text-2xl font-extrabold">{pct}%</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <StreakRing pct={pct} size={48} stroke={6} color={color} />
    </div>
  );
}

function RoutineGroups({ habits, today }: { habits: TodayHabit[]; today: string }) {
  const groups = TIME_OF_DAY.map((t) => ({
    ...t,
    items: habits.filter((h) => h.timeOfDay === t.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{g.emoji}</span> {g.label}
          </div>
          <div className="space-y-2">
            {g.items.map((h) => (
              <HabitCheckRow key={h.id} habit={h} today={today} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitCheckRow({ habit, today }: { habit: TodayHabit; today: string }) {
  const [status, setStatus] = useState<CheckStatus | null>(habit.status);
  const [isPending, startTransition] = useTransition();
  const color = habitColor(habit.color);

  useEffect(() => setStatus(habit.status), [habit.status]);

  function apply(next: CheckStatus | null) {
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      try {
        if (next === null) await removeCheckIn(habit.id, today);
        else await setCheckIn(habit.id, today, next);
      } catch {
        setStatus(prev);
        toast.error("Couldn't save — try again");
      }
    });
  }

  const isDone = status === "done";
  const protect = status && status !== "done" ? PROTECT_META[status] : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
        isDone
          ? "border-done/30 bg-done/8"
          : protect
            ? "border-border bg-muted/40"
            : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
          color.soft,
        )}
      >
        {habit.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("truncate font-semibold", isDone && "text-done")}>
          {habit.name}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {habit.streak > 0 ? (
            <span className="flex items-center gap-0.5 text-streak">
              <Flame className="h-3 w-3" /> {habit.streak}
            </span>
          ) : (
            <span>No streak yet</span>
          )}
          {protect ? (
            <span className="flex items-center gap-1">
              · <protect.icon className="h-3 w-3" /> {protect.label}
            </span>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => apply("rest")}>
            <Coffee className="mr-2 h-4 w-4" /> Rest day
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => apply("sick")}>
            <Thermometer className="mr-2 h-4 w-4" /> Sick day
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => apply("travel")}>
            <Plane className="mr-2 h-4 w-4" /> Travel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => apply("pause")}>
            <Pause className="mr-2 h-4 w-4" /> Pause streak
          </DropdownMenuItem>
          {status ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => apply(null)}>
                <X className="mr-2 h-4 w-4" /> Clear
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={() => apply(isDone ? null : "done")}
        disabled={isPending}
        aria-label={isDone ? "Undo" : "Mark done"}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isDone
            ? "border-done bg-done text-white"
            : "border-border text-transparent hover:border-done hover:text-done/40",
        )}
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center">
      <div className="text-4xl">🌱</div>
      <p className="mt-3 font-semibold">No habits yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first habit and start a streak today.
      </p>
      <Link
        href="/habits"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> Add a habit
      </Link>
    </div>
  );
}
