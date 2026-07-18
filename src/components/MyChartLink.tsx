"use client";

import { useState } from "react";
import { ExternalLink, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSETS, type AssetKey } from "@/lib/assets";
import { openTiledCharts } from "@/lib/popupCharts";

interface Props {
  asset: AssetKey;
  url: string;
  onChange: (url: string) => void;
}

// Opens the trader's real TradingView (login + LuxAlgo + drawings + template).
// Popup windows are first-party tradingview.com, so login works — unlike an
// embedded iframe, which the browser keeps logged-out via cookie/storage
// partitioning.
export function MyChartLink({ asset, url, onChange }: Props) {
  const [val, setVal] = useState(url);
  const symbol = ASSETS[asset].symbol;

  function openTiled() {
    const blocked = openTiledCharts(symbol, url);
    if (blocked > 0) {
      toast.error(
        `${blocked} window(s) blocked. Allow pop-ups for this site, then click again.`,
      );
    } else {
      toast.success("4 TradingView charts opened & tiled 2×2.");
    }
  }

  function openSingle() {
    const u = url.trim();
    window.open(
      u ||
        `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={url.trim() ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
        >
          <LayoutGrid className="h-4 w-4" />
          My chart
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        <h4 className="mb-1 text-sm font-semibold">
          My TradingView chart · {asset}
        </h4>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Open your real TradingView (LuxAlgo, drawings &amp; template). In
          TradingView: <b>Save layout</b> → <b>Share → Copy link</b>, paste it
          here so each chart opens your layout.
        </p>
        <div className="mb-3 flex gap-2">
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="https://www.tradingview.com/chart/xxxxxx/"
            className="text-xs"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(val.trim())}
          >
            Save
          </Button>
        </div>

        <Button className="w-full" size="sm" onClick={openTiled}>
          <LayoutGrid className="mr-1.5 h-4 w-4" />
          Open 4 tiled charts (real TV)
        </Button>
        <button
          onClick={openSingle}
          className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          or open 1 chart in a new tab
        </button>

        <p className="mt-3 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
          The browser may block pop-ups the first time — choose{" "}
          <b>Always allow</b> for this site, then click again. Pop-ups = your
          TradingView login works (unlike the embed, which is always guest).
        </p>
      </PopoverContent>
    </Popover>
  );
}
