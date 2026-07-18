"use client";

import { memo, useEffect, useRef } from "react";

// TradingView economic calendar — high/medium-impact events for the markets
// that move gold & indices (US / EU / GB / JP). Anonymous embed.
function EconomicEventsBase() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
      countryFilter: "us,eu,gb,jp",
      importanceFilter: "0,1",
      width: "100%",
      height: "100%",
    });
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div className="h-[460px] w-full overflow-hidden rounded-md border border-border">
      <div ref={ref} className="tradingview-widget-container h-full" />
    </div>
  );
}

export const EconomicEvents = memo(EconomicEventsBase);
