"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/Reveal";

type UseCaseTab = {
  id: string;
  label: string;
  image: string;
  imagePosition: string;
  alt: string;
  copy: string;
  statValue: string;
  statLabel: string;
};

const TABS: UseCaseTab[] = [
  {
    id: "professionals",
    label: "Professionals",
    image: "/landing/GrOi64i02AZCaZvYDyn1wZuzEo.jpg",
    imagePosition: "50% 50%",
    alt: "Professional man in a suit during a meeting",
    copy: "For anyone handling long workdays, shifting priorities, and tight deadlines.",
    statValue: "87%",
    statLabel: "Weekly consistency",
  },
  {
    id: "students",
    label: "Students",
    image: "/landing/360Mpxs47saxpqyH2hnDZ2G9GU.jpg",
    imagePosition: "50% 25%",
    alt: "Young student in a denim jacket looking up at a blue sky",
    copy: "Fit study sessions around class and energy levels.",
    statValue: "21-day",
    statLabel: "Average streak",
  },
  {
    id: "remote-workers",
    label: "Remote workers",
    image: "/landing/pmABpxPTuD1JS2FQjWsbhiqm7g.jpg",
    imagePosition: "50% 30%",
    alt: "Woman relaxing in warm sunlight at home",
    copy: "Structure for days without office rhythm.",
    statValue: "40",
    statLabel: "Focus sessions / month",
  },
  {
    id: "busy-parents",
    label: "Busy parents",
    image: "/landing/7dKCE0xdVPy08DUKqzOy8dtxWg.jpg",
    imagePosition: "50% 35%",
    alt: "Parents at home holding their young child",
    copy: "Small habits that survive chaotic schedules.",
    statValue: "92%",
    statLabel: "Morning-routine rate",
  },
];

const HASHTAGS = [
  "#fitness enthusiasts",
  "#creatives",
  "#entrepreneurs",
  "#freelancers",
  "#new habit builders",
  "#deep-work lovers",
];

export function UseCase() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section id="use-case" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center text-sm text-muted-foreground">
            Fits every lifestyle
          </p>
          <h2 className="font-headline mt-3 text-center text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Adapted for the way you live and work
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                aria-pressed={tab.id === activeId}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  tab.id === activeId
                    ? "bg-ink text-white"
                    : "border border-border text-muted-foreground hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="relative mx-auto mt-10 aspect-[3/4] max-w-5xl overflow-hidden rounded-[2rem] bg-ink sm:aspect-[16/10] md:aspect-[16/8]">
            <div key={active.id} className="absolute inset-0 animate-in fade-in duration-500">
              <Image
                src={active.image}
                alt={active.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                style={{ objectPosition: active.imagePosition }}
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-10">
                <p className="max-w-sm text-lg text-white md:text-xl">
                  {active.copy}
                </p>
                <div className="shrink-0 rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-md md:px-6">
                  <p className="font-headline text-3xl font-medium tracking-tight text-white md:text-4xl">
                    {active.statValue}
                  </p>
                  <p className="mt-1 text-xs text-white/80 md:text-sm">
                    {active.statLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <p className="mt-14 text-center text-muted-foreground">
            And for every kind of daily rhythm
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {HASHTAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
