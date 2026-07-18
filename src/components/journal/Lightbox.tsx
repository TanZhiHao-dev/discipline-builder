"use client";

// Fullscreen image viewer for chart review: zoom in/out (buttons or
// double-tap), pan by scrolling/dragging (native scroll — works with touch),
// arrows between images, Esc / X / backdrop to close. Dependency-free.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ZOOM_STEPS = [1, 1.5, 2, 3, 4, 6];

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const src = images[index];
  const many = images.length > 1;

  // Reset zoom when switching images.
  useEffect(() => setZoom(1), [index]);

  const step = useCallback((dir: 1 | -1) => {
    setZoom((z) => {
      const i = ZOOM_STEPS.findIndex((s) => Math.abs(s - z) < 0.01);
      const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, (i === -1 ? 0 : i) + dir))];
      return next;
    });
  }, []);

  const prev = useCallback(
    () => onIndex((index - 1 + images.length) % images.length),
    [index, images.length, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % images.length),
    [index, images.length, onIndex],
  );

  // Keyboard: Esc close, arrows navigate, +/- zoom.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
      else if (e.key === "+" || e.key === "=") step(1);
      else if (e.key === "-") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, step, many]);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        {many ? (
          <span className="tnum text-xs font-medium text-white/70">
            {index + 1} / {images.length}
          </span>
        ) : null}
        <div className="ml-auto flex items-center gap-1.5">
          <Tool onClick={() => step(-1)} label="Zoom out" disabled={zoom <= 1}>
            <Minus className="h-4 w-4" />
          </Tool>
          <span className="tnum w-12 text-center text-xs font-semibold text-white/80">
            {Math.round(zoom * 100)}%
          </span>
          <Tool
            onClick={() => step(1)}
            label="Zoom in"
            disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
          >
            <Plus className="h-4 w-4" />
          </Tool>
          <Tool onClick={() => setZoom(1)} label="Reset zoom" disabled={zoom === 1}>
            <RotateCcw className="h-4 w-4" />
          </Tool>
          <Tool onClick={onClose} label="Close">
            <X className="h-4 w-4" />
          </Tool>
        </div>
      </div>

      {/* Image area — scrollable when zoomed (native pan, touch-friendly) */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain"
        onClick={(e) => {
          // Tap the dark backdrop (not the image) closes.
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={cn(
            "min-h-full min-w-full",
            zoom === 1 && "flex items-center justify-center p-4",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onDoubleClick={() => setZoom((z) => (z === 1 ? 2.5 : 1))}
            className={cn("select-none", zoom === 1 && "max-h-full max-w-full object-contain")}
            style={
              zoom === 1
                ? undefined
                : { width: `${zoom * 100}%`, maxWidth: "none", height: "auto" }
            }
            draggable={false}
          />
        </div>
      </div>

      {/* Prev / next */}
      {many ? (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <p className="shrink-0 pb-3 text-center text-[11px] text-white/50">
        Double-tap to zoom · drag to pan · Esc to close
      </p>
    </div>
  );
}

function Tool({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
