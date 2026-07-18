"use client";

import { LayoutTemplate } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  BUILTIN_STUDIES,
  CHART_STYLES,
  DEFAULT_CHART_CONFIG,
  type ChartConfig,
} from "@/lib/assets";
import { cn } from "@/lib/utils";

const COLOR_PRESETS: { name: string; up: string; down: string }[] = [
  { name: "Classic", up: "#26a69a", down: "#ef5350" },
  { name: "Green/Red", up: "#22c55e", down: "#ef4444" },
  { name: "Mono", up: "#e5e7eb", down: "#6b7280" },
  { name: "Blue/Orange", up: "#3b82f6", down: "#f97316" },
];

interface Props {
  config: ChartConfig;
  onChange: (c: ChartConfig) => void;
}

// Savable chart template: chart style + built-in indicators + candle colors.
// Persisted by the parent so the chart looks the same every time it reopens.
// (Drawings and community/invite-only indicators like LuxAlgo cannot be saved
// by the free embed — use the "TV" button on a chart to open TradingView for
// those.)
export function ChartSettings({ config, onChange }: Props) {
  function toggleStudy(id: string) {
    const has = config.studies.includes(id);
    onChange({
      ...config,
      studies: has
        ? config.studies.filter((s) => s !== id)
        : [...config.studies, id],
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <LayoutTemplate className="h-4 w-4" />
          Chart template
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Chart template</h4>
          <button
            onClick={() => onChange(DEFAULT_CHART_CONFIG)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        {/* Chart style */}
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Chart type
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {CHART_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => onChange({ ...config, style: s.value })}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-xs transition-colors",
                  config.style === s.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Built-in indicators */}
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Built-in indicators (auto-load)
          </div>
          <div className="grid grid-cols-2 gap-1">
            {BUILTIN_STUDIES.map((st) => (
              <label
                key={st.id}
                className="flex cursor-pointer items-center gap-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={config.studies.includes(st.id)}
                  onChange={() => toggleStudy(st.id)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                {st.label}
              </label>
            ))}
          </div>
        </div>

        {/* Candle colors */}
        <div className="mb-2">
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Candle colors
          </div>
          <div className="mb-2 flex gap-3">
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="color"
                value={config.candles.up}
                onChange={(e) =>
                  onChange({
                    ...config,
                    candles: { ...config.candles, up: e.target.value },
                  })
                }
                className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
              />
              Bullish
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="color"
                value={config.candles.down}
                onChange={(e) =>
                  onChange({
                    ...config,
                    candles: { ...config.candles, down: e.target.value },
                  })
                }
                className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
              />
              Bearish
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() =>
                  onChange({ ...config, candles: { up: p.up, down: p.down } })
                }
                className="flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[11px] transition-colors hover:bg-secondary"
              >
                <span className="flex gap-0.5">
                  <span
                    className="h-3 w-1.5 rounded-sm"
                    style={{ background: p.up }}
                  />
                  <span
                    className="h-3 w-1.5 rounded-sm"
                    style={{ background: p.down }}
                  />
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
          Saved automatically. Drawings &amp; community indicators (LuxAlgo)
          can&apos;t be saved in the embed — use the{" "}
          <span className="font-medium text-foreground">TV</span> button on a
          chart to open TradingView.
        </p>
      </PopoverContent>
    </Popover>
  );
}
