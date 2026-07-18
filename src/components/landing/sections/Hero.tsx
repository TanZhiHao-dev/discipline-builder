import Image from "next/image";
import Link from "next/link";
import { Award, Check, Play } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

function StatusRow() {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/60">Mon, 07:32</span>
      <span className="flex h-5 w-9 items-center rounded-full bg-white/15 px-0.5">
        <span className="ml-auto h-4 w-4 rounded-full bg-white/80" />
      </span>
    </div>
  );
}

function HabitRow({
  title,
  sub,
  right,
  dimmed = false,
}: {
  title: string;
  sub: string;
  right: React.ReactNode;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl bg-white/6 p-3 ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <p className="truncate text-xs text-white/50">{sub}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </div>
  );
}

function PhoneScreen() {
  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-8">
      <StatusRow />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">Today Task</p>
          <p className="text-xs text-white/50">3 of 8 habits done</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white">
          🔥 18 day streak
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <HabitRow
          title="Morning walk"
          sub="At least 15 minutes"
          right={
            <>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70">
                12 / 14 days
              </span>
              <span className="rounded-full bg-brand px-2 py-1 text-[10px] font-semibold text-white">
                65%
              </span>
            </>
          }
        />
        <HabitRow
          title="Drink water"
          sub="8 glasses"
          right={
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </span>
          }
        />
        <HabitRow
          title="Read 10 pages"
          sub="evening"
          dimmed
          right={
            <span className="h-6 w-6 rounded-full border border-white/25" />
          }
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-32 md:pt-36">
      {/* Background photo */}
      <Image
        src="/landing/5AAyXsYWLAPDHoR0Qd3rIax2A4.jpg"
        alt="Person in motion on a warm orange background"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Contrast overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-[6vh] text-center md:pt-[8vh]">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 py-1.5 pl-1.5 pr-4 text-sm text-white backdrop-blur">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-ink">
              New
            </span>
            A calmer way to build habits
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 max-w-[15ch] font-headline text-5xl font-medium leading-[1.05] text-white md:text-7xl">
            Build habits that actually stick
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-md text-white/85">
            You see the right habits at the right time so your day never feels
            crowded.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
            >
              Start tracking for free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch demo
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Phone mockup rising from bottom */}
      <div className="pointer-events-none relative z-10 mt-14 flex justify-center md:mt-16">
        <Reveal delay={320}>
          <div className="relative">
            <div className="w-[340px] translate-y-[45%] overflow-hidden rounded-t-[3rem] border-8 border-b-0 border-black bg-[#0c0d0d] shadow-2xl">
              {/* notch */}
              <div className="flex justify-center pt-3">
                <div className="h-5 w-24 rounded-full bg-black" />
              </div>
              <PhoneScreen />
            </div>

            {/* Floating glass card — left */}
            <div className="absolute -left-64 top-6 hidden w-56 items-center gap-3 rounded-2xl border border-white/15 bg-black/30 p-4 text-white backdrop-blur md:flex">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand">
                <Award className="h-5 w-5 text-white" />
              </span>
              <div className="text-left">
                <p className="font-semibold">7-day streak</p>
                <p className="text-xs text-white/60">You&apos;re on a roll</p>
              </div>
            </div>

            {/* Floating glass card — right */}
            <div className="absolute -right-60 top-16 hidden w-52 rounded-2xl border border-white/15 bg-black/30 p-4 text-left text-white backdrop-blur md:block">
              <p className="text-xs text-white/60">Today&apos;s goal:</p>
              <p className="font-semibold">Complete 3 habits</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bottom-right pill */}
      <Link
        href="/login"
        className="absolute bottom-6 right-6 z-20 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-lg transition-opacity hover:opacity-90"
      >
        Get it for FREE 📲
      </Link>
    </section>
  );
}
