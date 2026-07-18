import { getTrades, getPlaybooks, getPremarkets } from "@/lib/trade-queries";
import { todayStr } from "@/lib/streak";
import { JournalView } from "@/components/journal/JournalView";

export type PremarketPrefill = {
  dailyBias: string;
  topDownAnalysis: string;
  marketStructure: string;
  quarterlyTheory: string;
  pdArray: string;
  method: string;
};

export default async function JournalPage() {
  const [rows, playbooks, premarkets] = await Promise.all([
    getTrades("live"),
    getPlaybooks(),
    getPremarkets(),
  ]);
  const today = todayStr();

  // Today's analysis per asset → so a new trade can inherit SOP steps 1–5.
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
      mode="live"
      rows={rows}
      playbooks={playbooks.map((p) => ({ id: p.id, name: p.name }))}
      premarkets={premarkets}
      today={today}
      premarketByAsset={premarketByAsset}
    />
  );
}
