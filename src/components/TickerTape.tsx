"use client";

import { memo, useEffect, useRef } from "react";
import { TICKER_SYMBOLS } from "@/lib/assets";

// Global live ticker across the top — TradingView's ticker-tape embed. Anonymous
// data, no login needed. Gives constant context on gold / indices / DXY / rates.
function TickerTapeBase() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: TICKER_SYMBOLS,
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "compact",
      colorTheme: "dark",
      locale: "en",
    });
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div className="h-9 shrink-0 overflow-hidden border-b border-border bg-background">
      <div ref={ref} className="tradingview-widget-container h-full" />
    </div>
  );
}

export const TickerTape = memo(TickerTapeBase);
