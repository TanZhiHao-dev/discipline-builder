"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_PACKS, type TemplatePack } from "@/lib/habit-templates";
import { habitColor, scheduleLabel, TIME_OF_DAY } from "@/lib/habit-utils";
import { applyTemplates } from "@/server/onboarding";
import { cn } from "@/lib/utils";

/** Orange squiggle "habit line" logo mark (same as the landing navbar). */
function LogoMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-brand"
    >
      <path
        d="M2.5 15.5C4.5 8.5 7 8.5 9 13.5s4.5 5 6.5-.5 4-6.5 6-4.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const timeLabel = (key: string) =>
  TIME_OF_DAY.find((t) => t.key === key)?.label ?? "Anytime";

export function OnboardingFlow({
  existingHabitCount,
  existingHabitNames,
}: {
  existingHabitCount: number;
  existingHabitNames: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  // packKey → habit names currently checked (initialized to all on Continue).
  const [checked, setChecked] = useState<Record<string, string[]>>({});

  const existingLower = useMemo(
    () => new Set(existingHabitNames.map((n) => n.toLowerCase())),
    [existingHabitNames],
  );

  const selectedPacks = useMemo(
    () => TEMPLATE_PACKS.filter((p) => selectedKeys.includes(p.key)),
    [selectedKeys],
  );

  const checkedTotal = selectedPacks.reduce(
    (sum, p) => sum + (checked[p.key]?.length ?? 0),
    0,
  );

  function togglePack(key: string) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function goToStep2() {
    // Pre-check everything for newly picked packs; keep prior fine-tuning.
    setChecked((prev) => {
      const next = { ...prev };
      for (const pack of selectedPacks) {
        next[pack.key] ??= pack.habits.map((h) => h.name);
      }
      return next;
    });
    setStep(2);
    window.scrollTo({ top: 0 });
  }

  function toggleHabit(packKey: string, name: string) {
    setChecked((prev) => {
      const current = prev[packKey] ?? [];
      return {
        ...prev,
        [packKey]: current.includes(name)
          ? current.filter((n) => n !== name)
          : [...current, name],
      };
    });
  }

  function createRoutine() {
    const selections = selectedPacks
      .map((p) => ({ packKey: p.key, habitNames: checked[p.key] ?? [] }))
      .filter((s) => s.habitNames.length > 0);
    if (selections.length === 0) return;

    startTransition(async () => {
      try {
        const { created } = await applyTemplates({ selections });
        toast.success(`${created} habits added to your routine 🎉`);
        router.push("/dashboard");
      } catch {
        toast.error("Couldn't create your routine. Please try again.");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Subtle top header */}
      <header className="mx-auto w-full max-w-3xl px-6 pt-8">
        <Link
          href="/dashboard"
          aria-label="Discipline Builder dashboard"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <LogoMark />
          <span className="font-headline text-lg font-semibold leading-none text-ink">
            Discipline Builder
          </span>
        </Link>
      </header>

      {step === 1 ? (
        <section className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-12">
          <h1 className="font-headline text-3xl font-medium text-ink md:text-4xl">
            What do you want to get better at?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pick one or more focus areas — we&apos;ll suggest a routine you can
            tweak.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_PACKS.map((pack) => {
              const isSelected = selectedKeys.includes(pack.key);
              return (
                <button
                  key={pack.key}
                  type="button"
                  onClick={() => togglePack(pack.key)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-[1.5rem] border border-border bg-white p-5 text-left transition-all",
                    isSelected
                      ? "border-brand bg-brand/[0.03] ring-2 ring-brand/20"
                      : "hover:border-ink/30",
                  )}
                >
                  <span className="text-3xl">{pack.emoji}</span>
                  <h2 className="mt-3 font-semibold text-ink">{pack.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.tagline}
                  </p>
                  <span className="mt-3 inline-block rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {pack.habits.length} habits
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={goToStep2}
              disabled={selectedKeys.length === 0}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
            {existingHabitCount >= 1 ? (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-ink"
              >
                Skip for now
              </Link>
            ) : (
              <Link
                href="/habits"
                className="text-sm text-muted-foreground transition-colors hover:text-ink"
              >
                I&apos;ll build my own
              </Link>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-12">
            <h1 className="font-headline text-3xl font-medium text-ink md:text-4xl">
              Fine-tune your routine
            </h1>
            <p className="mt-3 text-muted-foreground">
              Uncheck anything you don&apos;t want — you can always add more
              later.
            </p>

            <div className="mt-10 space-y-10">
              {selectedPacks.map((pack) => (
                <PackGroup
                  key={pack.key}
                  pack={pack}
                  checkedNames={checked[pack.key] ?? []}
                  existingLower={existingLower}
                  onToggle={(name) => toggleHabit(pack.key, name)}
                />
              ))}
            </div>
          </section>

          {/* Sticky footer bar */}
          <div className="sticky bottom-0 border-t border-border bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-6 py-4">
              <p className="text-sm text-muted-foreground">
                {checkedTotal} {checkedTotal === 1 ? "habit" : "habits"}{" "}
                selected
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={createRoutine}
                  disabled={isPending || checkedTotal === 0}
                  className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? "Creating…" : "Create my routine"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PackGroup({
  pack,
  checkedNames,
  existingLower,
  onToggle,
}: {
  pack: TemplatePack;
  checkedNames: string[];
  existingLower: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xl">{pack.emoji}</span>
        <h2 className="font-headline text-lg font-medium text-ink">
          {pack.title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {checkedNames.length}/{pack.habits.length}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {pack.habits.map((h) => {
          const isChecked = checkedNames.includes(h.name);
          const alreadyAdded = existingLower.has(h.name.toLowerCase());
          const color = habitColor(h.color);
          return (
            <button
              key={h.name}
              type="button"
              onClick={() => onToggle(h.name)}
              aria-pressed={isChecked}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border border-border bg-white p-3.5 text-left transition-all hover:border-ink/30",
                !isChecked && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl text-lg",
                  color.soft,
                )}
                aria-hidden="true"
              >
                {h.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{h.name}</span>
                  {alreadyAdded && (
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted-foreground">
                      Already added
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {scheduleLabel(h.scheduleDays)} · {timeLabel(h.timeOfDay)}
                </span>
              </span>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isChecked
                    ? "border-done bg-done text-white"
                    : "border-border bg-white",
                )}
              >
                {isChecked && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
