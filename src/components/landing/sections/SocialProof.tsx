import Image from "next/image";
import { Reveal } from "@/components/landing/Reveal";

type StoryCard = {
  photo: string;
  alt: string;
  name: string;
  stat?: string;
  quote: string;
};

const STORIES: StoryCard[] = [
  {
    photo: "/landing/ZzBHGGaTqk0aSLMiZ87omsIk5Yc.jpg",
    alt: "Maya, a student, holding a tennis racket",
    name: "Maya · Student",
    quote: "Completed 21-day streak using Discipline Builder",
  },
  {
    photo: "/landing/1Gm8xH2RytPJQrcLAGShFH8LuM.jpg",
    alt: "Daniel Gray cycling along a coastal road",
    name: "Daniel Gray · Founder",
    stat: "87%",
    quote: "Improved weekly consistency",
  },
  {
    photo: "/landing/360Mpxs47saxpqyH2hnDZ2G9GU.jpg",
    alt: "Aaron Lee outdoors under a blue sky",
    name: "Aaron Lee · Remote Engineer",
    quote: "Stopped breaking habits on weekends after switching to Discipline Builder",
  },
  {
    photo: "/landing/7dKCE0xdVPy08DUKqzOy8dtxWg.jpg",
    alt: "Priya at home with her family",
    name: "Priya · Busy Parent",
    quote: "Logged 40 focus sessions this month with Routine Stacks",
  },
  {
    photo: "/landing/XtZSnP4lf3r3xqtGfWddUZ7DwhI.jpg",
    alt: "Leo, a creative professional, in an orange jacket",
    name: "Leo · Creative Professional",
    stat: "10 Days",
    quote: "Hit hydration goals",
  },
  {
    photo: "/landing/pmABpxPTuD1JS2FQjWsbhiqm7g.jpg",
    alt: "Ramya relaxing in warm sunlight",
    name: "Ramya · Software Developer",
    quote: "Finally keeps her day organized with routine-based habit groups",
  },
];

const CHIP_AVATARS = [
  { src: "/landing/CChKPhjar0Z3WFjF2BWc2QYAhM.jpg", alt: "Discipline Builder user avatar" },
  { src: "/landing/Wu0ngxjedkJ31EstGJABQBoafk.jpg", alt: "Discipline Builder user avatar" },
  { src: "/landing/lBDnhYYdiFDDzKLziT6CyXW3maU.jpg", alt: "Discipline Builder user avatar" },
];

function StoryPhotoCard({ card }: { card: StoryCard }) {
  return (
    <figure className="relative h-[400px] w-[300px] shrink-0 overflow-hidden rounded-[1.75rem]">
      <Image
        src={card.photo}
        alt={card.alt}
        fill
        sizes="300px"
        className="object-cover"
      />
      {/* Name chip */}
      <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur">
        {card.name}
      </span>
      {/* Bottom overlay */}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-5 pb-5 pt-20">
        {card.stat ? (
          <>
            <span className="block font-headline text-4xl font-medium leading-tight text-white">
              {card.stat}
            </span>
            <span className="mt-1 block text-sm font-medium text-white/90">
              {card.quote}
            </span>
          </>
        ) : (
          <span className="block text-base font-medium leading-snug text-white">
            {card.quote}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

function StoryRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex gap-6 pr-6" aria-hidden={hidden || undefined}>
      {STORIES.map((card) => (
        <StoryPhotoCard key={`${card.name}${hidden ? "-dup" : ""}`} card={card} />
      ))}
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="overflow-hidden py-24 md:py-32">
      {/* Header row */}
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-12 flex flex-col items-start gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-lg font-headline text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">
              What users are achieving with Discipline Builder
            </h2>
            <div className="flex shrink-0 items-center gap-3 rounded-full border border-border px-4 py-2">
              <span className="flex -space-x-2">
                {CHIP_AVATARS.map((avatar) => (
                  <Image
                    key={avatar.src}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                Trusted worldwide
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Full-bleed marquee of user story cards */}
      <Reveal delay={120}>
        <div
          className="marquee-x flex w-max hover:[animation-play-state:paused]"
          style={{ "--marquee-duration": "45s" } as React.CSSProperties}
        >
          <StoryRow />
          <StoryRow hidden />
        </div>
      </Reveal>
    </section>
  );
}
