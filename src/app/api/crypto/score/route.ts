import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Auto fundamental scorer — pulls a coin's CoinGecko detail and derives the 6
// AC-Protocol metrics (0-10 each) from the data that IS available on the free
// tier: categories, supply, sentiment, watchlist/telegram size, rank, age.
// Each metric carries a confidence flag so the UI can show what's a strong
// signal (supply/crowd) vs a rough proxy (founders/VC — free API lacks GitHub &
// VC data). Cached 1h. Accepts ?id=<coingecko-id> or ?q=<search>.
export const revalidate = 3600;

const REAL_UTILITY = [
  "decentralized exchange", "infrastructure", "smart contract", "lending",
  "real world assets", "rwa", "oracle", "depin", "artificial intelligence",
  "liquid staking", "derivatives", "layer 1", "layer 2", "scaling",
  "gaming", "bridge", "privacy", "storage", "identity",
];

type Metric = { score: number; why: string; confidence: "strong" | "proxy" };

function clamp(n: number) {
  return Math.max(0, Math.min(10, Math.round(n)));
}

async function resolveId(q: string): Promise<string | null> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`,
    { next: { revalidate: 3600 }, headers: { accept: "application/json" } },
  );
  if (!res.ok) return null;
  const j = (await res.json()) as { coins?: { id: string }[] };
  return j.coins?.[0]?.id ?? null;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  let id = url.searchParams.get("id");
  const q = url.searchParams.get("q");
  try {
    if (!id && q) id = await resolveId(q);
    if (!id) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`,
      { next: { revalidate: 3600 }, headers: { accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const d = (await res.json());

    const rank: number | null = d.market_cap_rank ?? null;
    const cats: string[] = (d.categories ?? []).filter(Boolean);
    const catLow = cats.map((c: string) => c.toLowerCase());
    const isMeme = catLow.some((c) => c.includes("meme")) &&
      !catLow.some((c) => REAL_UTILITY.some((u) => c.includes(u)));
    const hasUtility = catLow.some((c) => REAL_UTILITY.some((u) => c.includes(u)));

    const md = d.market_data ?? {};
    const circ = md.circulating_supply ?? null;
    const max = md.max_supply ?? null;
    const total = md.total_supply ?? null;
    const denom = max || total || circ || 0;
    const supplyRatio = denom ? (circ ?? 0) / denom : null;

    const cd = d.community_data ?? {};
    const watchlist: number = d.watchlist_portfolio_users ?? 0;
    const tg: number = cd.telegram_channel_user_count ?? 0;
    const sentUp: number | null = d.sentiment_votes_up_percentage ?? null;

    const genesis: string | null = d.genesis_date ?? null;
    const ageYears = genesis
      ? (Date.parse("2026-07-15") - Date.parse(genesis)) / (365.25 * 86400000)
      : rank && rank <= 100
        ? 2
        : 1;

    // ── metrics ──
    const rankScore = rank == null ? 4 : rank <= 20 ? 9 : rank <= 100 ? 7 : rank <= 300 ? 5 : 3;

    const value: Metric = {
      score: isMeme ? 3 : clamp(rankScore + (hasUtility ? 1 : 0)),
      why: isMeme
        ? "Kategori meme — value proposition lemah"
        : `Rank #${rank ?? "?"}${hasUtility ? " · kategori utilitas nyata" : ""}`,
      confidence: "proxy",
    };
    const money: Metric = {
      score: isMeme ? 3 : hasUtility ? 8 : 6,
      why: isMeme
        ? "Meme = cenderung ponzinomics (PvP)"
        : hasUtility
          ? `Utilitas: ${cats.slice(0, 2).join(", ")}`
          : "Model bisnis tidak jelas dari kategori",
      confidence: "proxy",
    };
    const supply: Metric = {
      score:
        supplyRatio == null
          ? 5
          : max == null
            ? clamp(supplyRatio * 8) // inflationary (no cap) → dibatasi
            : clamp(supplyRatio * 10),
      why:
        supplyRatio == null
          ? "Data supply tidak lengkap"
          : `${Math.round(supplyRatio * 100)}% beredar${max == null ? " · supply tak terbatas (inflationary)" : ""}`,
      confidence: "strong",
    };
    const founder: Metric = {
      score: clamp(rankScore * 0.5 + Math.min(ageYears, 5)),
      why: `Umur ±${ageYears.toFixed(1)} thn · rank #${rank ?? "?"} (proxy — data tim/GitHub tak tersedia gratis)`,
      confidence: "proxy",
    };
    const vc: Metric = {
      score: rank == null ? 4 : rank <= 30 ? 8 : rank <= 100 ? 6 : rank <= 300 ? 5 : 3,
      why: `Rank #${rank ?? "?"} + likuiditas exchange (proxy — data VC tak tersedia gratis)`,
      confidence: "proxy",
    };
    const crowdBase =
      watchlist >= 500_000 ? 10 : watchlist >= 100_000 ? 8 : watchlist >= 20_000 ? 6 : watchlist >= 5_000 ? 4 : 2;
    const crowd: Metric = {
      score: clamp(crowdBase + (sentUp != null && sentUp >= 70 ? 1 : sentUp != null && sentUp < 40 ? -1 : 0)),
      why: `${watchlist.toLocaleString("id-ID")} watchlist${tg ? ` · TG ${tg.toLocaleString("id-ID")}` : ""}${sentUp != null ? ` · sentimen ${Math.round(sentUp)}% bullish` : ""}`,
      confidence: "strong",
    };

    const scores = { value, money, supply, founder, vc, crowd };
    const total6 = Object.values(scores).reduce((a, m) => a + m.score, 0);
    const pct = Math.round((total6 / 60) * 100);

    // Auto-check computable conviction rules (indexes match CONVICTION_RULES)
    const conviction: number[] = [];
    if (supply.score >= 8) conviction.push(9); // tokenomics ~100% beredar
    if (pct >= 50) conviction.push(11); // fundamental >50
    if (money.score >= 7) conviction.push(6); // business model segar
    if (vc.score >= 7) conviction.push(7); // didukung VC
    if (crowd.score >= 7) conviction.push(8); // on-chain/komunitas hijau proxy

    return NextResponse.json({
      id,
      symbol: (d.symbol ?? "").toUpperCase(),
      name: d.name,
      categories: cats.slice(0, 4),
      scores,
      pct,
      conviction,
      at: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 200 });
  }
}
