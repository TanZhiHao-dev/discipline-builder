"use client";

import { useState } from "react";
import { ChevronDown, Play, Quote } from "lucide-react";
import {
  MINDSET_STORIES,
  MINDSET_TOPIC_META,
  type MindsetStory,
  type MindsetTheme,
} from "@/lib/crypto-mindset";
import { cn } from "@/lib/utils";

export function MindsetLibrary() {
  if (MINDSET_STORIES.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Belum ada materi mindset.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <h2 className="font-semibold text-ink">🧭 Mindset & Perjalanan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pelajaran mental, disiplin, dan keputusan dari perjalanan trader crypto
          — sisi manusia dari trading yang sering menentukan hasil akhir.
        </p>
      </div>

      <div className="mt-4 space-y-6">
        {MINDSET_STORIES.map((s) => (
          <StoryBlock key={s.id} story={s} />
        ))}
      </div>
    </div>
  );
}

function StoryBlock({ story }: { story: MindsetStory }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Header + video thumbnail */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <a
          href={`https://www.youtube.com/watch?v=${story.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group/thumb relative block shrink-0 overflow-hidden rounded-xl border border-border sm:w-48"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${story.videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-32 w-full object-cover sm:h-28"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover/thumb:bg-black/40">
            <Play className="h-7 w-7 fill-white text-white" />
          </span>
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-ink px-2 py-0.5 text-xs font-bold text-white">
              {story.person}
            </span>
            <span className="text-xs text-muted-foreground">{story.source}</span>
          </div>
          <p className="mt-2 text-sm text-foreground">{story.oneLineStory}</p>
        </div>
      </div>

      {/* Quotes */}
      {story.quotes.length ? (
        <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-secondary/40 p-3">
          {story.quotes.map((q, i) => (
            <div key={i} className="flex gap-2 text-[13px] italic text-foreground">
              <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
              <span>{q}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Themes */}
      <div className="mt-3 space-y-2">
        {story.themes.map((t, i) => (
          <ThemeCard key={i} theme={t} />
        ))}
      </div>

      <a
        href={`https://www.youtube.com/watch?v=${story.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
      >
        <Play className="h-3.5 w-3.5" />
        Tonton wawancara penuh
      </a>
    </div>
  );
}

function ThemeCard({ theme }: { theme: MindsetTheme }) {
  const [open, setOpen] = useState(false);
  const meta = MINDSET_TOPIC_META[theme.topic];
  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 p-3 text-left"
      >
        <span className="mt-0.5 text-base">{meta.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-semibold text-ink">{theme.title}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {meta.label}
            </span>
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{theme.thesis}</span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul className="space-y-1.5 border-t border-border px-3 pb-3 pt-2.5">
          {theme.points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {p}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
