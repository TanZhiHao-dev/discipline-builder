"use client";

import { ASSETS, TIMEFRAMES, type AssetKey, type ChartConfig } from "@/lib/assets";
import { TradingViewChart } from "./TradingViewChart";

interface Props {
  asset: AssetKey;
  config: ChartConfig;
  openUrl?: string; // user's saved TradingView layout for this asset
}

// 2x2 grid of the four timeframes for the selected asset (anonymous embeds).
export function ChartGrid({ asset, config, openUrl }: Props) {
  const symbol = ASSETS[asset].symbol;

  return (
    // Mobile: single column, each chart a usable height, the terminal scrolls.
    // md+: locked 2×2 grid filling the terminal height.
    <div className="grid w-full grid-cols-1 gap-px bg-border md:h-full md:grid-cols-2 md:grid-rows-2">
      {TIMEFRAMES.map((tf) => (
        <div key={tf.interval} className="h-[65vh] md:h-full">
          <TradingViewChart
            symbol={symbol}
            interval={tf.interval}
            label={tf.label}
            config={config}
            openUrl={openUrl}
          />
        </div>
      ))}
    </div>
  );
}
