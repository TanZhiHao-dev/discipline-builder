"use client";

import { useEffect, useState } from "react";
import { Activity, Bitcoin, Calculator, CalendarClock, Clock, Plus } from "lucide-react";
import { ChartGrid } from "@/components/ChartGrid";
import { ChartSettings } from "@/components/ChartSettings";
import { CryptoDeskDialog, CryptoStrip } from "@/components/CryptoDesk";
import { OnChainDialog } from "@/components/OnChainDesk";
import { MyChartLink } from "@/components/MyChartLink";
import { TemplateReminder } from "@/components/TemplateReminder";
import { TradeForm } from "@/components/journal/TradeForm";
import {
  ASSETS,
  ASSET_KEYS,
  DEFAULT_CHART_CONFIG,
  isCryptoAsset,
  type AssetKey,
  type ChartConfig,
} from "@/lib/assets";
import { openTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

const CONFIG_KEY = "habitline_chart_config";
const TV_URLS_KEY = "habitline_tv_urls";

// The pro trading terminal — multi-timeframe TradingView grid + chart tools +
// quick access to risk / killzone / economic tools + one-tap trade logging.
export function TerminalWorkspace() {
  const [asset, setAsset] = useState<AssetKey>("XAUUSD");
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CHART_CONFIG);
  const [tvUrls, setTvUrls] = useState<Record<string, string>>({});
  const [logOpen, setLogOpen] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [onChainOpen, setOnChainOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) setConfig({ ...DEFAULT_CHART_CONFIG, ...JSON.parse(saved) });
      const savedUrls = localStorage.getItem(TV_URLS_KEY);
      if (savedUrls) setTvUrls(JSON.parse(savedUrls));
    } catch {
      /* ignore */
    }
  }, []);

  function updateConfig(c: ChartConfig) {
    setConfig(c);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  }

  function updateTvUrl(url: string) {
    setTvUrls((prev) => {
      const next = { ...prev, [asset]: url };
      localStorage.setItem(TV_URLS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-11 shrink-0 flex-wrap items-center gap-2 border-b border-border px-3">
        <div className="flex rounded-md border border-border p-0.5">
          {ASSET_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setAsset(key)}
              className={cn(
                "rounded px-3 py-1 text-xs font-semibold transition-colors",
                asset === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{ASSETS[asset].name}</span>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Tools */}
          <ToolButton icon={Bitcoin} label="Crypto" onClick={() => setDeskOpen(true)} />
          <ToolButton icon={Activity} label="On-chain" onClick={() => setOnChainOpen(true)} />
          <ToolButton icon={Calculator} label="Risk" onClick={() => openTool("risk")} />
          <ToolButton icon={Clock} label="Killzones" onClick={() => openTool("sessions")} />
          <ToolButton
            icon={CalendarClock}
            label="Events"
            onClick={() => openTool("events")}
          />
          <div className="mx-1 h-5 w-px bg-border" />
          <MyChartLink
            key={asset}
            asset={asset}
            url={tvUrls[asset] ?? ""}
            onChange={updateTvUrl}
          />
          <TemplateReminder />
          <ChartSettings config={config} onChange={updateConfig} />
          <button
            onClick={() => setLogOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Log trade
          </button>
        </div>
      </div>

      {/* Crypto context strip (cycle phase + sentiment) for crypto assets */}
      {isCryptoAsset(asset) ? (
        <CryptoStrip onOpenDesk={() => setDeskOpen(true)} />
      ) : null}

      {/* Charts */}
      <div className="min-h-0 flex-1">
        <ChartGrid asset={asset} config={config} openUrl={tvUrls[asset] ?? ""} />
      </div>

      {logOpen ? (
        <TradeForm mode="live" open={logOpen} onOpenChange={setLogOpen} />
      ) : null}

      {deskOpen ? (
        <CryptoDeskDialog open={deskOpen} onOpenChange={setDeskOpen} />
      ) : null}

      {onChainOpen ? (
        <OnChainDialog open={onChainOpen} onOpenChange={setOnChainOpen} />
      ) : null}
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Calculator;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
