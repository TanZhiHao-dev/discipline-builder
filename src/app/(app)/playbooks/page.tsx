import { getPlaybooks, getTrades } from "@/lib/trade-queries";
import { groupBy } from "@/lib/trade-analytics";
import { PlaybooksView } from "@/components/playbook/PlaybooksView";

export type PlaybookStat = {
  trades: number;
  winRate: number;
  netR: number;
  expectancy: number;
};

export default async function PlaybooksPage() {
  const [playbooks, rows] = await Promise.all([getPlaybooks(), getTrades("live")]);

  // Per-playbook performance, keyed by playbook id. groupBy already filters to
  // measured (closed, R-recorded) trades and computes the stats we surface.
  const stats = groupBy(rows, (r) => r.playbookId ?? "");
  const statsByPlaybook: Record<string, PlaybookStat> = {};
  for (const pb of playbooks) {
    const g = stats.find((s) => s.key === pb.id);
    statsByPlaybook[pb.id] = {
      trades: g?.trades ?? 0,
      winRate: g?.winRate ?? 0,
      netR: g?.netR ?? 0,
      expectancy: g?.expectancy ?? 0,
    };
  }

  return <PlaybooksView playbooks={playbooks} statsByPlaybook={statsByPlaybook} />;
}
