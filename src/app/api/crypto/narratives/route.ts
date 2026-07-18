import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Live narratives = CoinGecko categories ranked by 24h market-cap change.
// Proxied server-side, cached 1h. Heating = top movers, cooling = worst.
export const revalidate = 3600;

type Category = {
  id: string;
  name: string;
  market_cap: number | null;
  market_cap_change_24h: number | null;
  volume_24h: number | null;
  top_3_coins: string[];
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/categories?order=market_cap_change_24h_desc",
      { next: { revalidate: 3600 }, headers: { accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const all = (await res.json()) as Category[];
    // Keep categories with real size (mc ≥ $20M) so we don't surface dust.
    const sized = all.filter((c) => (c.market_cap ?? 0) >= 20_000_000);
    const trim = (c: Category) => ({
      id: c.id,
      name: c.name,
      marketCap: c.market_cap,
      change24h: c.market_cap_change_24h,
      volume24h: c.volume_24h,
      coins: (c.top_3_coins ?? []).length,
    });
    const heating = sized.slice(0, 8).map(trim);
    const cooling = sized.slice(-5).reverse().map(trim);
    return NextResponse.json({ heating, cooling, at: Date.now() });
  } catch {
    return NextResponse.json({ heating: [], cooling: [] }, { status: 200 });
  }
}
