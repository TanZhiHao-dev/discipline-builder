import { getTrades, getPlaybooks, getPremarkets } from "@/lib/trade-queries";
import { todayStr } from "@/lib/streak";
import { JournalView } from "@/components/journal/JournalView";
import type { PremarketPrefill } from "@/app/(app)/journal/page";

export default async function PaperPage() {
  const [rows, playbooks, premarkets] = await Promise.all([
    getTrades("paper"),
    getPlaybooks(),
    // Paper shares the SAME daily pre-market analysis as the live Journal —
    // same-day setups you're unsure about, one analysis, not two.
    getPremarkets("live"),
  ]);
  const today = todayStr();

  // Today's analysis per asset → a new paper trade inherits SOP steps 1–5.
  const premarketByAsset: Record<string, PremarketPrefill> = {};
  for (const p of premarkets) {
    if (p.date !== today) continue;
    premarketByAsset[p.asset] = {
      dailyBias: p.dailyBias,
      topDownAnalysis: p.topDownAnalysis,
      marketStructure: p.marketStructure,
      quarterlyTheory: p.quarterlyTheory,
      pdArray: p.pdArray,
      method: p.method,
    };
  }

  return (
    <JournalView
      mode="paper"
      rows={rows}
      playbooks={playbooks.map((p) => ({ id: p.id, name: p.name }))}
      premarkets={premarkets}
      today={today}
      premarketByAsset={premarketByAsset}
    />
  );
}
