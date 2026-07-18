"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import {
  KJ_INTRO,
  KJ_TOPICS,
  kjLessonsByTopic,
  type KJLesson,
  type KJTopic,
} from "@/lib/kevin-method";
import { cn } from "@/lib/utils";

export function KevinMethod() {
  const groups = useMemo(() => kjLessonsByTopic(), []);
  const [topic, setTopic] = useState<KJTopic | "all">("all");

  const present = groups.map((g) => g.topic);
  const shown = topic === "all" ? groups : groups.filter((g) => g.topic === topic);
  const total = groups.reduce((n, g) => n + g.lessons.length, 0);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Materi metode belum tersedia.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <h2 className="font-semibold text-ink">🎓 Metode Kevin Jonathan</h2>
        <p className="mt-1 text-sm text-muted-foreground">{KJ_INTRO}</p>
      </div>

      {/* Topic filter */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip active={topic === "all"} onClick={() => setTopic("all")}>
          Semua ({total})
        </Chip>
        {KJ_TOPICS.filter((t) => present.includes(t.key)).map((t) => (
          <Chip key={t.key} active={topic === t.key} onClick={() => setTopic(t.key)}>
            {t.emoji} {t.label}
          </Chip>
        ))}
      </div>

      {/* Grouped lessons */}
      <div className="mt-4 space-y-6">
        {shown.map((g) => (
          <div key={g.topic}>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
              <span>{g.emoji}</span> {g.label}
            </h3>
            <div className="space-y-2">
              {g.lessons.map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function LessonCard({ lesson }: { lesson: KJLesson }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {/* Video thumbnail — each lesson comes from this video. Shown on every
            size (smaller on phones) since that's where it's read most. */}
        <span className="relative block shrink-0 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-[54px] w-24 object-cover sm:h-[62px] sm:w-28"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <Play className="h-4 w-4 fill-white text-white sm:h-5 sm:w-5" />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="font-semibold text-ink">{lesson.title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{lesson.thesis}</span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <ul className="space-y-1.5">
            {lesson.points.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {p}
              </li>
            ))}
          </ul>

          {lesson.tips?.length ? (
            <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand">
                💡 Tips / rumus
              </div>
              <ul className="space-y-1">
                {lesson.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-done" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <a
            href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            <Play className="h-3.5 w-3.5" />
            Tonton: {lesson.videoTitle}
          </a>
        </div>
      ) : null}
    </div>
  );
}
