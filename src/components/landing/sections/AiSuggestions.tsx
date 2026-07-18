import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";

type SuggestionCard = {
  title: string;
  description: string;
  sphere: { light: string; base: string; dark: string };
};

const CARDS: SuggestionCard[] = [
  {
    title: "Morning walk",
    description: "Suggests the best time to remind you.",
    sphere: { light: "#8FA0FF", base: "#0022FF", dark: "#000E66" },
  },
  {
    title: "Habit Priorities",
    description: "Reorders habits on busy days.",
    sphere: { light: "#FF9E6B", base: "#FF4C00", dark: "#8A2900" },
  },
  {
    title: "Routine Insights",
    description: "Highlights what’s working and what’s slipping.",
    sphere: { light: "#CE85FF", base: "#9000FF", dark: "#4A0085" },
  },
  {
    title: "Recovery Suggestion",
    description: "Helps you recover when you miss a day.",
    sphere: { light: "#7CE071", base: "#12A70A", dark: "#0A5C05" },
  },
];

function GradientSphere({
  sphere,
}: {
  sphere: SuggestionCard["sphere"];
}) {
  return (
    <span
      aria-hidden
      className="block h-10 w-10 rounded-full"
      style={{
        background: `radial-gradient(circle at 32% 28%, ${sphere.light} 0%, ${sphere.base} 48%, ${sphere.dark} 100%)`,
        boxShadow: `0 8px 16px -6px ${sphere.base}55`,
      }}
    />
  );
}

export function AiSuggestions() {
  return (
    <section id="smart-assist" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Two-column header */}
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-sm text-muted-foreground">
              Smarter habits, less thinking
            </p>
            <h2 className="font-headline mt-3 text-4xl font-medium text-ink md:text-5xl">
              AI suggestions that adjust to your day
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Discipline Builder learns your patterns and offers small, useful
              suggestions that help you stay consistent without guessing what
              to do next.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              See how suggestions work
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                src="/landing/RJlhAjk8TyvYLx9IXX5jSt9s0.jpg"
                alt="Colorful sunset sky with soft pink clouds"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        {/* Suggestion cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 90}>
              <div className="h-full rounded-[1.5rem] border border-border bg-white p-6">
                <GradientSphere sphere={card.sphere} />
                <h3 className="mt-4 font-semibold text-ink">{card.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
