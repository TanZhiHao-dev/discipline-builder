"use client";

import { memo, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import type { ChartConfig } from "@/lib/assets";

interface Props {
  symbol: string; // "FOREXCOM:XAUUSD"
  interval: string; // "M" | "W" | "D" | "60"
  label: string;
  config: ChartConfig;
  openUrl?: string; // user's saved TradingView layout URL
}

// Wraps TradingView's official "Advanced Chart" embed widget (real-time data,
// anonymous — no login/extension needed). Chart style, built-in studies and
// candle colors come from the saved chart template (`config`).
function TradingViewChartBase({ symbol, interval, label, config, openUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: config.style,
      locale: "en",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: true,
      withdateranges: true,
      studies: config.studies,
      backgroundColor: "rgba(9, 9, 11, 1)",
      gridColor: "rgba(38, 38, 38, 0.4)",
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": config.candles.up,
        "mainSeriesProperties.candleStyle.downColor": config.candles.down,
        "mainSeriesProperties.candleStyle.borderUpColor": config.candles.up,
        "mainSeriesProperties.candleStyle.borderDownColor": config.candles.down,
        "mainSeriesProperties.candleStyle.wickUpColor": config.candles.up,
        "mainSeriesProperties.candleStyle.wickDownColor": config.candles.down,
      },
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, [
    symbol,
    interval,
    config.style,
    config.candles.up,
    config.candles.down,
    config.studies.join(","),
  ]);

  const tvUrl = openUrl?.trim()
    ? openUrl
    : `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}&interval=${interval}`;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950">
      <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-border/60 px-2">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
          {label}
        </span>
        <a
          href={tvUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in TradingView (log in for LuxAlgo / community indicators)"
          className="ml-auto flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-3 w-3" />
          TV
        </a>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartBase);
