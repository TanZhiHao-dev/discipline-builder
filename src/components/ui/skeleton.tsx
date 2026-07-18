import { cn } from "@/lib/utils";

/**
 * Lightweight shimmer block for loading states. Pure CSS (animate-pulse), no JS,
 * so a route's loading.tsx paints instantly on click while the server streams
 * the real content in behind it.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-foreground/10", className)}
    />
  );
}
