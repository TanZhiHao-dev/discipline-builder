"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/Reveal";

/* ------------------------------------------------------------------ */
/* Part A data — the scroll-revealed sentence                          */
/* ------------------------------------------------------------------ */

type SentenceToken = { text: string; emoji?: string };

const SENTENCE: SentenceToken[] = [
  { text: "Build" },
  { text: "steady" },
  { text: "daily" },
  { text: "habits" },
  { text: "with" },
  { text: "a" },
  { text: "layout" },
  { text: "that" },
  { text: "keeps" },
  { text: "your" },
  { text: "mornings,", emoji: "☀️" },
  { text: "evenings,", emoji: "🌙" },
  { text: "and" },
  { text: "focus", emoji: "💙" },
  { text: "simple" },
  { text: "to" },
  { text: "follow." },
];

const AUDIENCE_CHIPS = ["#Founders", "#Students", "#Busy parents", "#Remote teams"];

/* ------------------------------------------------------------------ */
/* Part B data — marquee columns                                       */
/* ------------------------------------------------------------------ */

type ColumnItem =
  | { kind: "photo"; src: string; w: number; h: number; alt: string }
  | { kind: "task"; label: string; dot: string };

const COL_OUTER_LEFT: ColumnItem[] = [
  { kind: "photo", src: "/landing/xWPekEuNbvgPERKSnbylJIlw5o.jpg", w: 500, h: 240, alt: "Cyclist riding past an orange wall" },
  { kind: "task", label: "Morning walk", dot: "bg-brand" },
  { kind: "photo", src: "/landing/EvRLW1yV1DMzPgDGTRFL8268Y.jpg", w: 500, h: 240, alt: "Orange poppy flower in soft light" },
  { kind: "task", label: "Track water", dot: "bg-brand-blue" },
];

const COL_INNER_LEFT: ColumnItem[] = [
  { kind: "task", label: "Focus session", dot: "bg-brand-blue" },
  { kind: "photo", src: "/landing/tyQlVexPG6JIDCWExGwbiGuN5h8.jpg", w: 500, h: 240, alt: "Woman in a pink sweater holding her phone" },
  { kind: "task", label: "Meditate", dot: "bg-brand-green" },
  { kind: "photo", src: "/landing/GsMwNqFuEInpXifqbAUBIX5BtbI.jpg", w: 500, h: 500, alt: "Hand holding a handmade memory book" },
];

const COL_INNER_RIGHT: ColumnItem[] = [
  { kind: "photo", src: "/landing/qMZFyawlggBHVBoh6ddN1JiBY.jpg", w: 500, h: 500, alt: "Woman stretching on a yoga mat" },
  { kind: "task", label: "Stretch for 5 minutes", dot: "bg-brand-green" },
  { kind: "photo", src: "/landing/WvRGvc2l8SkYOYTv4oMiBGMYX4.jpg", w: 500, h: 500, alt: "Person in a hoodie reading on a tablet" },
  { kind: "task", label: "Write journal", dot: "bg-brand" },
];

const COL_OUTER_RIGHT: ColumnItem[] = [
  { kind: "task", label: "Phone off by 10:30", dot: "bg-brand-purple" },
  { kind: "photo", src: "/landing/HXp1j2ozGA25sNyS8ZbVMkMuV3A.jpg", w: 500, h: 240, alt: "Students laughing together outdoors" },
  { kind: "task", label: "Clean workspace", dot: "bg-brand-purple" },
  { kind: "photo", src: "/landing/fqGFx9fe7ocFZ2fppp0P3V8zCc.jpg", w: 500, h: 500, alt: "Desk by a window with potted plants" },
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function TaskCard({ label, dot }: { label: string; dot: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-3 text-xs font-medium text-ink shadow-sm">
      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />
      <span className="truncate">{label}</span>
    </div>
  );
}

function ColumnCards({ items }: { items: ColumnItem[] }) {
  return (
    <>
      {items.map((item, i) =>
        item.kind === "photo" ? (
          <Image
            key={i}
            src={item.src}
            alt={item.alt}
            width={item.w}
            height={item.h}
            sizes="160px"
            className="h-40 w-full rounded-2xl object-cover"
          />
        ) : (
          <TaskCard key={i} label={item.label} dot={item.dot} />
        ),
      )}
    </>
  );
}

function MarqueeColumn({
  items,
  duration,
  reverse,
  className,
}: {
  items: ColumnItem[];
  duration: string;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("absolute top-0 h-full w-[160px]", className)}>
      <div
        className={cn("marquee-y flex flex-col", reverse && "marquee-reverse")}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        <div className="flex flex-col gap-4 pb-4">
          <ColumnCards items={items} />
        </div>
        <div className="flex flex-col gap-4 pb-4" aria-hidden>
          <ColumnCards items={items} />
        </div>
      </div>
    </div>
  );
}

/* Apple logo glyph (from template asset, recolored via currentColor) */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 20" className={className} fill="currentColor" aria-hidden>
      <path d="M12.001 0h.142c.114 1.41-.424 2.464-1.078 3.228-.642.757-1.521 1.493-2.943 1.381-.095-1.39.444-2.366 1.098-3.127C9.826.772 10.937.14 12 0Zm4.304 14.68v.04c-.4 1.21-.97 2.247-1.665 3.21-.635.874-1.413 2.05-2.802 2.05-1.2 0-1.998-.772-3.229-.793-1.301-.021-2.017.645-3.207.813h-.406c-.874-.127-1.579-.819-2.093-1.442C1.388 16.715.218 14.335 0 11.29v-.895c.092-2.18 1.151-3.952 2.56-4.811.742-.457 1.764-.846 2.9-.672.488.075.986.242 1.423.407.413.16.93.441 1.42.426.333-.01.663-.182.997-.304.98-.354 1.941-.76 3.208-.57 1.522.23 2.602.907 3.27 1.95-1.288.82-2.306 2.054-2.132 4.163.155 1.915 1.268 3.036 2.66 3.697Z" />
    </svg>
  );
}

/* Android robot glyph (from template asset, recolored via currentColor) */
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 20" className={className} fill="currentColor" aria-hidden>
      <path d="M10.439 20c.668 0 1.252-.583 1.252-1.252v-2.924h.835c.502 0 .836-.334.836-.835v-8.35H3.34v8.35c0 .501.335.835.836.835h.836v2.924c0 .669.583 1.252 1.252 1.252s1.252-.583 1.252-1.252v-2.924h1.672v2.924c0 .669.583 1.252 1.252 1.252Zm5.011-5.011c.669 0 1.252-.584 1.252-1.252V7.89c0-.666-.583-1.252-1.252-1.252s-1.252.586-1.252 1.252v5.847c0 .668.583 1.252 1.252 1.252m-14.198 0c.669 0 1.252-.584 1.252-1.252V7.89c0-.666-.583-1.252-1.252-1.252S0 7.224 0 7.89v5.847c0 .668.583 1.252 1.252 1.252M12.36.126a.4.4 0 0 0-.584 0l-1.121 1.118-.052.051q-.996-.499-2.24-.5H8.34q-1.245.001-2.24.5l-.052-.051L4.926.126a.4.4 0 0 0-.583 0 .4.4 0 0 0 0 .583l1.084 1.084a4.5 4.5 0 0 0-.942.846c-.66.782-1.08 1.8-1.138 2.902l-.002.034a5 5 0 0 0-.006.227h10.023q0-.114-.005-.227l-.002-.034a4.9 4.9 0 0 0-1.139-2.902 4.5 4.5 0 0 0-.941-.846L12.358.71a.4.4 0 0 0 0-.583ZM6.261 4.342a.626.626 0 1 1 0-1.252.626.626 0 0 1 0 1.252m4.178 0a.626.626 0 1 1 0-1.252.626.626 0 0 1 0 1.252" />
    </svg>
  );
}

function StoreButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
    >
      {icon}
      {label}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function AboutReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const progress =
        range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 1;
      // Finish the sentence slightly before the section unpins.
      const count = Math.min(
        SENTENCE.length,
        Math.floor(progress * (SENTENCE.length + 3)),
      );
      setRevealed((prev) => (prev === count ? prev : count));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="bg-white">
      {/* ---------------- PART A: scroll word-reveal ---------------- */}
      <div ref={wrapRef} className="h-[220vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div className="max-w-4xl text-center">
            <Reveal>
              <h2 className="font-headline text-3xl font-medium leading-snug text-ink md:text-5xl">
                {SENTENCE.map((token, i) => {
                  const read = i < revealed;
                  return (
                    <span key={i}>
                      <span
                        className={cn(
                          "transition-colors duration-200",
                          read ? "text-ink" : "text-[#B8B8B8]",
                        )}
                      >
                        {token.text}
                      </span>
                      {token.emoji && (
                        <span
                          className={cn(
                            "mx-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-paper align-middle text-base transition-opacity duration-200 md:h-11 md:w-11 md:text-xl",
                            read ? "opacity-100" : "opacity-40",
                          )}
                        >
                          {token.emoji}
                        </span>
                      )}{" "}
                    </span>
                  );
                })}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 text-sm text-muted-foreground">
                Used by people to improve routines.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {AUDIENCE_CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ---------------- PART B: phone + floating columns ---------------- */}
      <Reveal>
        <div className="relative h-[560px] overflow-hidden rounded-none bg-white">
          {/* Marquee columns — left */}
          <MarqueeColumn
            items={COL_OUTER_LEFT}
            duration="26s"
            className="hidden lg:block lg:left-[calc(50%-560px)]"
          />
          <MarqueeColumn
            items={COL_INNER_LEFT}
            duration="34s"
            reverse
            className="hidden md:block md:left-[calc(50%-380px)]"
          />
          {/* Marquee columns — right */}
          <MarqueeColumn
            items={COL_INNER_RIGHT}
            duration="30s"
            className="hidden md:block md:right-[calc(50%-380px)]"
          />
          <MarqueeColumn
            items={COL_OUTER_RIGHT}
            duration="38s"
            reverse
            className="hidden lg:block lg:right-[calc(50%-560px)]"
          />

          {/* Top / bottom white fades over the columns */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-white to-transparent" />

          {/* Center phone */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[520px] w-[300px] overflow-hidden rounded-[2.5rem] border-8 border-black bg-black shadow-2xl">
              <Image
                src="/landing/HOI14HQm9TteAT5Gus0apcpG1o.png"
                alt="Discipline Builder app showing the weekly overview and routine stacks"
                fill
                sizes="300px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Rating + copy + store buttons */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <Image
              src="/landing/FfmG8vzlH3tOeU2kFU0oUxANr9Y.svg"
              alt="4.7 out of 5 stars"
              width={112}
              height={16}
            />
            <p className="text-sm text-muted-foreground">
              4.7 rating (based on 125 reviews)
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-lg text-center text-muted-foreground">
            Stay consistent with a system that fits into real life. Simple
            cards, clear routines, and gentle nudges help you build progress
            that lasts.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <StoreButton
              icon={<AppleIcon className="h-5 w-[17px]" />}
              label="Download for iPhone"
            />
            <StoreButton
              icon={<AndroidIcon className="h-5 w-[17px]" />}
              label="Get it on Android"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
