import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Live coin screener = CoinGecko top markets, annotated per AC Protocol with a
// COMPUTABLE screen (supply maturity · momentum · liquidity). This is NOT the
// full 6-metric fundamental score (founders/VC/community need your judgment) —
// it's an auto watchlist to shortlist candidates. Cached 1h.
export const revalidate = 3600;

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap_rank: number | null;
  market_cap: number | null;
  total_volume: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
};

function tier(rank: number | null): "big" | "mid" | "low" {
  if (rank == null) return "low";
  if (rank <= 20) return "big";
  if (rank <= 100) return "mid";
  return "low";
}

// Triangular reward: peaks at +10% over 7d, zero at -30% and +80% (overextended).
function momentumScore(m7: number | null): number {
  if (m7 == null) return 15;
  if (m7 <= -30 || m7 >= 80) return 0;
  const peak = 10;
  const span = m7 < peak ? peak - -30 : 80 - peak;
  return Math.round(30 * (1 - Math.abs(m7 - peak) / span));
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=7d",
      { next: { revalidate: 3600 }, headers: { accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const rows = (await res.json()) as Market[];

    const coins = rows
      // Skip stablecoins & wrapped (near-zero volatility) so the list is tradeable.
      .filter((r) => {
        const chg = Math.abs(r.price_change_percentage_24h ?? 0);
        return chg > 0.4 && (r.market_cap ?? 0) > 0;
      })
      .map((r) => {
        const denom = r.max_supply || r.total_supply || r.circulating_supply || 0;
        const supplyRatio = denom ? (r.circulating_supply ?? 0) / denom : null;
        const supplyScore = supplyRatio == null ? 20 : Math.round(supplyRatio * 40);
        const mom = momentumScore(r.price_change_percentage_7d_in_currency);
        const volMc = r.market_cap ? (r.total_volume ?? 0) / r.market_cap : 0;
        const liq = Math.round(Math.min(volMc / 0.15, 1) * 30);
        return {
          id: r.id,
          symbol: (r.symbol ?? "").toUpperCase(),
          name: r.name,
          image: r.image,
          rank: r.market_cap_rank,
          tier: tier(r.market_cap_rank),
          price: r.current_price,
          change24h: r.price_change_percentage_24h,
          change7d: r.price_change_percentage_7d_in_currency,
          supplyRatio,
          screen: supplyScore + mom + liq, // /100
        };
      })
      .sort((a, b) => b.screen - a.screen);

    return NextResponse.json({ coins, at: Date.now() });
  } catch {
    return NextResponse.json({ coins: [] }, { status: 200 });
  }
}
