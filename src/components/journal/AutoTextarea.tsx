"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea that grows to fit its content (no more clipping multi-line analysis
 * to 2 rows). Height is recomputed on every value change and on mount, so
 * copied/restored/edited text is fully visible; the dialog around it scrolls.
 * Still user-resizable.
 */
export function AutoTextarea({
  value,
  className,
  minRows = 2,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      className={cn(
        "w-full resize-y overflow-hidden rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring",
        className,
      )}
      {...props}
    />
  );
}
