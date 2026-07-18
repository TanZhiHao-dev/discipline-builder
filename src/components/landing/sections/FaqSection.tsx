"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/Reveal";

const FAQ_ITEMS = [
  {
    q: "How many habits can I track?",
    a: "You can track as many as you want, but most users keep 5–8 habits for better consistency. Discipline Builder is designed to keep your day calm, not crowded.",
  },
  {
    q: "Do reminders work across all devices?",
    a: "Yes — gentle nudges sync across your devices, so a reminder dismissed on one screen never nags you on another.",
  },
  {
    q: "What happens if I miss a day?",
    a: "That's where flexible streak rules come in. Use a rest-day credit, mark a sick or travel day, or pause your streak — one missed day doesn't erase weeks of progress.",
  },
  {
    q: "Can I create routines for different times of day?",
    a: "Yes. Group habits into Routine Stacks (Morning, Afternoon, Evening) so you only see what matters at the right time.",
  },
  {
    q: "Is Discipline Builder free to use?",
    a: "Yes — create an account and start tracking for free. Your data is yours.",
  },
];

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-ink"
      >
        <span>{q}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          {/* LEFT — heading + help card */}
          <div>
            <Reveal>
              <p className="text-sm text-muted-foreground">Common questions</p>
              <h2 className="mt-3 font-headline text-4xl font-medium tracking-tight text-ink">
                Frequently asked questions
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 rounded-[1.5rem] bg-paper p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink">
                  <Image
                    src="/landing/tLK0vd89o1TNNFSzF5qXoI9SVU.svg"
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                  />
                </span>
                <h3 className="mt-4 font-semibold text-ink">
                  Can&apos;t find your answer?
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We&apos;re here to help you build better habits.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Contact us
                </Link>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — accordion */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <Reveal key={item.q} delay={i * 70}>
                <FaqItem
                  q={item.q}
                  a={item.a}
                  isOpen={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
