import { cn } from "@/lib/utils";

export type StatTone = "bull" | "bear" | "warn" | "neutral";

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  tone?: StatTone;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border/80">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mono-nums mt-1 text-2xl font-bold tabular-nums leading-none",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
