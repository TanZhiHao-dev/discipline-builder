"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

/**
 * Count-up hook: animates 0 -> target with an ease-out cubic over ~1.6s
 * the first time the attached element enters the viewport.
 */
function useCountUp(target: number, duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}

/** Hand-drawn orange squiggle underline (template asset is unavailable as a standalone file). */
function SquiggleUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 28"
      fill="none"
      aria-hidden="true"
      className={cn("text-brand", className)}
    >
      <path
        d="M6 17C34 7 60 6 84 13c26 8 50 10 76 3s52-9 74-2c6 2 11 4 14 6"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M24 24c30-8 58-9 84-3 24 5 48 4 72-3 18-5 36-6 52-2"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

function BigCounter() {
  const { ref, value } = useCountUp(62000);
  return (
    <span
      ref={ref}
      className="font-headline font-medium text-brand text-[96px] md:text-[140px] leading-none tabular-nums"
    >
      {value.toLocaleString("en-US")}+
    </span>
  );
}

function MediaPanel() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-ink">
      <Image
        src="/landing/yyE2pUgUrjBeDKRRIF0gWhZRuhM.jpg"
        alt="A hand reaching into a beam of light"
        fill
        sizes="(max-width: 1152px) 100vw, 1104px"
        className="object-cover"
      />
      {/* Decorative play button */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="flex size-16 md:size-20 items-center justify-center rounded-full bg-white shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="size-6 md:size-7 translate-x-0.5 text-ink"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SmallStat({
  target,
  suffix,
  label,
  accent,
}: {
  target: number;
  suffix?: string;
  label: string;
  accent?: "purple" | "blue";
}) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="px-6 py-8 text-center md:py-2">
      <p className="font-headline font-medium text-5xl text-ink tabular-nums">
        <span ref={ref}>{value.toLocaleString("en-US")}</span>
        {suffix ? (
          <span className="relative inline-block">
            {accent === "purple" ? (
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -z-10 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple/80 blur-sm"
              />
            ) : null}
            <span className="relative">{suffix}</span>
          </span>
        ) : null}
        {accent === "blue" ? (
          <span
            aria-hidden="true"
            className="ml-1.5 inline-block size-2.5 -translate-y-6 rounded-full bg-brand-blue align-baseline"
          />
        ) : null}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function CounterStats() {
  return (
    <section id="metrics" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="text-center">
        <p className="text-sm text-muted-foreground">
          Real habits, real numbers
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-headline text-4xl font-medium text-ink md:text-5xl">
          How people stay consistent over time
        </h2>
      </Reveal>

      <Reveal delay={100} className="mt-12 md:mt-16">
        <p className="text-center">
          <BigCounter />
        </p>
        <SquiggleUnderline className="mx-auto mt-2 w-64" />
        <p className="mt-4 text-center text-muted-foreground">
          Check-ins logged last month
        </p>
      </Reveal>

      <Reveal delay={200} className="mt-14 md:mt-20">
        <MediaPanel />
      </Reveal>

      <Reveal delay={300} className="mt-12 md:mt-16">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          <SmallStat
            target={87}
            suffix="%"
            accent="purple"
            label="Faster habit recovery"
          />
          <SmallStat target={46} label="Sessions completed on average" />
          <SmallStat
            target={32}
            suffix="+"
            accent="blue"
            label="Countries with active Discipline Builder users"
          />
        </div>
      </Reveal>
    </section>
  );
}
