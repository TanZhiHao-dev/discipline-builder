import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

const STATUS_PILLS = [
  { label: "Travel Mode Active", dot: "bg-brand" },
  { label: "Sick Day Allowance", dot: "bg-brand-green" },
  { label: "Weekend Flexibility", dot: "bg-brand-blue" },
  { label: "Rest Day Credit", dot: "bg-brand-purple" },
  { label: "Pause Streak Option", dot: "bg-ink" },
];

const PLANNER_ROWS = [
  { time: "07:30 AM", title: "Morning walk", meta: "15 minutes" },
  { time: "09:00 AM", title: "Drink 3 glasses of water", meta: "Before 11:00 AM" },
  { time: "10:00 AM", title: "Deep work session", meta: "60 minutes" },
  { time: "11:30 AM", title: "Read 10 pages", meta: "30 minutes" },
  { time: "05:00 PM", title: "Stretch routine", meta: "10 minutes" },
  { time: "10:00 PM", title: "Plan tomorrow", meta: "5 minutes" },
];

const STACK_ROWS = [
  { label: "Morning stack", meta: "4 habits", dot: "bg-brand" },
  { label: "Focus stack", meta: "3 habits", dot: "bg-brand-purple" },
  { label: "Evening stack", meta: "4 habits", dot: "bg-brand-green" },
];

const STREAK_DOTS = [
  "bg-brand",
  "bg-brand-green",
  "bg-brand-purple",
  "bg-brand-blue",
  "bg-ink",
];

function StatusPillRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 gap-3 pr-3" aria-hidden={hidden || undefined}>
      {STATUS_PILLS.map((pill) => (
        <span
          key={pill.label}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white px-4 py-2 text-sm text-ink"
        >
          <span className={`size-2 rounded-full ${pill.dot}`} />
          {pill.label}
        </span>
      ))}
    </div>
  );
}

function Donut({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label: string;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-16">
        <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * c} ${c}`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {pct}%
        </span>
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      {/* Header row */}
      <Reveal>
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Habits with structure</p>
            <h2 className="mt-3 max-w-xl font-headline text-4xl font-medium text-ink md:text-5xl">
              A layout that keeps your day clear.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground md:self-end">
            Discipline Builder brings clarity to your routines with clean cards, realistic
            progress tracking, and guidance that adapts to your day.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-6">
        {/* ROW 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Flexible streak rules */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-[2rem] bg-paper p-8">
              <h3 className="font-headline text-2xl font-medium text-ink">
                Flexible streak rules
              </h3>
              <p className="mt-3 text-muted-foreground">
                Traditional habit trackers are too rigid. Miss one day and your
                50-day streak is gone forever.
              </p>
              <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-10">
                <span className="text-6xl" role="img" aria-label="Fire">
                  🔥
                </span>
                <p className="font-semibold text-ink">50-day streak intact</p>
                <div className="flex items-center gap-2">
                  {STREAK_DOTS.map((dot) => (
                    <span key={dot} className={`size-2.5 rounded-full ${dot}`} />
                  ))}
                </div>
              </div>
              <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
                <div
                  className="marquee-x flex w-max"
                  style={{ "--marquee-duration": "22s" } as React.CSSProperties}
                >
                  <StatusPillRow />
                  <StatusPillRow hidden />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Smart daily planner */}
          <Reveal className="h-full" delay={100}>
            <div className="flex h-full flex-col rounded-[2rem] bg-[#0f1511] p-8 text-white">
              <h3 className="font-headline text-2xl font-medium">
                Smart daily planner
              </h3>
              <p className="mt-3 text-white/60">
                A simple view that shows only the habits that match your current
                time of day.
              </p>
              <div className="mt-8 flex-1 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Good Morning!</p>
                    <p className="text-sm text-white/50">Tuesday, 25 Nov</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-brand-green">
                    15% Completion
                  </span>
                </div>
                <div className="mt-4 divide-y divide-white/8">
                  {PLANNER_ROWS.map((row, i) => (
                    <div
                      key={row.time}
                      className={`flex items-center gap-3 border-l-2 py-3 pl-3 text-sm ${
                        i === 0 ? "border-brand-green" : "border-transparent"
                      }`}
                    >
                      <span
                        className={`w-16 shrink-0 text-xs ${
                          i === 0 ? "font-medium text-brand-green" : "text-white/50"
                        }`}
                      >
                        {row.time}
                      </span>
                      <span className="flex-1 text-white/90">{row.title}</span>
                      <span className="shrink-0 text-xs text-white/40">
                        {row.meta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ROW 2 — Routine stacks */}
        <Reveal>
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] text-white">
            <Image
              src="/landing/kmAong4xy6gvqhgzcssHKUFJnmA.jpg"
              alt="Dark sand dune under a warm sky"
              fill
              className="object-cover"
              sizes="(min-width: 1152px) 1104px, 100vw"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative grid min-h-[420px] items-center gap-10 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
              <div>
                <h3 className="font-headline text-3xl font-medium">
                  Routine stacks
                </h3>
                <p className="mt-3 max-w-md text-white/70">
                  Group habits into simple blocks so your day feels organized
                  instead of scattered.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  Start your routine now
                </Link>
                <p className="mt-4 text-xs text-white/50">
                  *Simple blocks help you stay on track without thinking.
                </p>
              </div>
              <div className="mx-auto w-full max-w-xs rotate-3 rounded-2xl bg-white p-4 shadow-2xl">
                <div className="space-y-3">
                  {STACK_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <span className={`size-2.5 rounded-full ${row.dot}`} />
                      <div>
                        <p className="text-sm font-medium text-ink">{row.label}</p>
                        <p className="text-xs text-muted-foreground">{row.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ROW 3 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Weekly reflection */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-[2rem] bg-ink p-8 text-white">
              <h3 className="font-headline text-2xl font-medium">
                Weekly reflection
              </h3>
              <p className="mt-3 text-white/60">
                A clear summary of your week that highlights what improved and
                what needs adjusting.
              </p>
              <div className="mt-8 flex flex-1 flex-col justify-end">
                <p className="text-sm text-white/50">Your week at a glance</p>
                <div className="mt-5 flex items-start justify-around gap-4">
                  <Donut pct={86} color="#FF4C00" label="Workout" />
                  <Donut pct={100} color="#9000FF" label="Meditation" />
                  <Donut pct={71} color="#12A70A" label="Reading" />
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                    <span className="text-sm text-white/70">Streaks completed</span>
                    <span className="text-right">
                      <span className="font-headline text-xl font-medium">12</span>{" "}
                      <span className="text-xs text-white/40">
                        (3 streaks improved)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                    <span className="text-sm text-white/70">Focused sessions</span>
                    <span className="text-right">
                      <span className="font-headline text-xl font-medium">07</span>{" "}
                      <span className="text-xs text-white/40">
                        (Total time: 4h 20m)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Gentle reminders */}
          <Reveal className="h-full" delay={100}>
            <div className="flex h-full flex-col rounded-[2rem] bg-paper p-8">
              <h3 className="font-headline text-2xl font-medium text-ink">
                Gentle reminders
              </h3>
              <p className="mt-3 text-muted-foreground">
                Short, calm nudges that help you follow through without pressure.
              </p>
              <div className="mt-8 flex-1 rounded-3xl bg-white p-6">
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="flex size-28 items-center justify-center rounded-full bg-paper">
                    <Image
                      src="/landing/LuRk2mi9PkL9qpq8u7aAhmN27dM.png"
                      alt="3D notification bell"
                      width={81}
                      height={62}
                    />
                  </div>
                  <div className="z-10 -mt-5 flex w-full max-w-[280px] items-center gap-3 rounded-2xl border border-border bg-white p-3 text-sm shadow-lg">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper">
                      <Bell className="size-4 text-brand" />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">
                        Time for your evening stretch
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Gentle reminder · now
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
