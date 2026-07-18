"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/Reveal";

type VideoPerson = {
  photo: string;
  name: string;
  role: string;
};

const VIDEO_PEOPLE: VideoPerson[] = [
  {
    photo: "/landing/Wu0ngxjedkJ31EstGJABQBoafk.jpg",
    name: "Aisha Khan",
    role: "Digital Marketer",
  },
  {
    photo: "/landing/lBDnhYYdiFDDzKLziT6CyXW3maU.jpg",
    name: "Olivia Park",
    role: "Project Manager",
  },
  {
    photo: "/landing/CChKPhjar0Z3WFjF2BWc2QYAhM.jpg",
    name: "Ryan Cooper",
    role: "Software Developer",
  },
  {
    photo: "/landing/622M5cyJBdKPIK1fPnBlo3qONk.jpg",
    name: "Marcus Reed",
    role: "Fitness Instructor",
  },
];

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Discipline Builder made my mornings feel manageable again.",
    name: "Maya Zong",
    role: "Student",
    avatar: "/landing/hYfCvJ3IVdEznEOwIQiiAxWOsPY.jpg",
  },
  {
    quote:
      "The weekly insights are what sold me. They show exactly where I fall off and help me adjust without feeling guilty or overwhelmed.",
    name: "Daniel Perez",
    role: "Software Engineer",
    avatar: "/landing/E0DlVQ4cHxgNCHBSHOdAc7mG7w.jpg",
  },
  {
    quote:
      "This is the first habit app that doesn't overwhelm me. Everything feels calm, structured, and intentional.",
    name: "Andre Lewis",
    role: "University Student",
    avatar: "/landing/pfX9Sn5qRme6iCFMisneY4YIt7I.jpg",
  },
  {
    quote:
      "I used to ignore reminders from other apps, but these feel calm and well-timed. It's like the app knows when I'm actually able to do something.",
    name: "Ethan Miller",
    role: "Gym Trainer",
    avatar: "/landing/X0ECJ5xGgYrCVgHB8RYd3RABTQ.jpg",
  },
  {
    quote:
      "Focus blocks changed the way I work. I get more done in two hours now than what used to take half a day.",
    name: "Laura Kim",
    role: "Product Designer",
    avatar: "/landing/bphS41hVtvFCNiuHkZkxk8imJk.jpg",
  },
  {
    quote:
      "The simple visuals and progress cues make it easy to stay consistent every day.",
    name: "Kevin Brooks",
    role: "Fitness Coach",
    avatar: "/landing/gDcaZH5xt6hqSU2VbK2snAw.jpg",
  },
  {
    quote: "It's the first habit app that doesn't overwhelm me.",
    name: "Hannah Lee",
    role: "Content Writer",
    avatar: "/landing/P0sSNnMlhW7adaGkZFmKHL828bY.jpg",
  },
  {
    quote:
      "I actually stick to my routines now. Small steps finally add up.",
    name: "Priya Shah",
    role: "Marketing Specialist",
    avatar: "/landing/W13V3WO2YwDah4yBxCcZc70Es.jpg",
  },
  {
    quote: "Feels tailored to my day and keeps me motivated.",
    name: "Sofia Martinez",
    role: "UX Researcher",
    avatar: "/landing/CYC5VQ0ZcK8uEE5jBbm51FTJq0.jpg",
  },
];

function StoryCardInner({
  person,
  center,
}: {
  person: VideoPerson;
  center: boolean;
}) {
  return (
    <>
      <Image
        src={person.photo}
        alt={person.name}
        fill
        sizes="300px"
        className="object-cover"
      />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg",
          center ? "h-14 w-14" : "h-11 w-11",
        )}
      >
        <Play
          className={cn(
            "translate-x-[1px] fill-current text-ink",
            center ? "h-5 w-5" : "h-4 w-4",
          )}
        />
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-14 text-left">
        <span className="block text-[15px] font-medium leading-tight text-white">
          {person.name}
        </span>
        <span className="mt-0.5 block text-xs text-white/75">
          {person.role}
        </span>
      </span>
    </>
  );
}

function StoryCarousel() {
  const [active, setActive] = useState(0);
  const n = VIDEO_PEOPLE.length;
  const left = (active + n - 1) % n;
  const right = (active + 1) % n;

  return (
    <div>
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => setActive(left)}
          aria-label={`Show ${VIDEO_PEOPLE[left].name}`}
          className="relative hidden h-[360px] w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-[1.75rem] opacity-80 transition-all duration-500 hover:opacity-100 sm:block"
        >
          <StoryCardInner person={VIDEO_PEOPLE[left]} center={false} />
        </button>

        <div className="relative h-[420px] w-[300px] shrink-0 overflow-hidden rounded-[1.75rem] shadow-xl transition-all duration-500">
          <StoryCardInner person={VIDEO_PEOPLE[active]} center />
        </div>

        <button
          type="button"
          onClick={() => setActive(right)}
          aria-label={`Show ${VIDEO_PEOPLE[right].name}`}
          className="relative hidden h-[360px] w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-[1.75rem] opacity-80 transition-all duration-500 hover:opacity-100 sm:block"
        >
          <StoryCardInner person={VIDEO_PEOPLE[right]} center={false} />
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous review video"
          onClick={() => setActive(left)}
          className="h-2.5 w-2.5 cursor-pointer rounded-full bg-ink/20 transition-colors hover:bg-ink/40"
        />
        <button
          type="button"
          aria-label="Next review video"
          onClick={() => setActive(right)}
          className="h-2.5 w-2.5 cursor-pointer rounded-full bg-ink transition-colors hover:bg-ink/70"
        />
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="mb-5 break-inside-avoid rounded-[1.5rem] border border-border bg-white p-6">
      <blockquote className="text-[15px] leading-relaxed text-ink">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Image
          src={item.avatar}
          alt={item.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
        <span>
          <span className="block text-sm font-medium text-ink">
            {item.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {item.role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">A closer look</p>
              <h2 className="font-headline mt-3 max-w-xl text-4xl font-medium text-ink md:text-5xl">
                How people use Discipline Builder every day
              </h2>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5">
              <span className="font-semibold text-ink">4.5/5</span>
              <span className="flex items-center gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                (Trusted by 1582+ users)
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <StoryCarousel />
        </Reveal>

        <Reveal delay={150} className="mt-16">
          <div className="columns-1 gap-5 md:columns-3">
            {TESTIMONIALS.map((item) => (
              <TestimonialCard key={item.name} item={item} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-10 flex justify-center">
            <Link
              href="/login"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              View all Reviews
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
