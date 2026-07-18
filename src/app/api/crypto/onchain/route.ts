import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ONCHAIN_METRICS } from "@/lib/onchain";

// CryptoQuant on-chain metrics, proxied server-side. The API key lives ONLY in
// the server env (CRYPTOQUANT_API_KEY) and never reaches the browser. Each
// metric returns its latest value; missing/unauthorized metrics degrade to null
// so the panel still renders. Cached 10 min.
export const revalidate = 600;

const BASE = "https://api.cryptoquant.com/v1";

type Row = Record<string, unknown> & { date?: string; datetime?: string };
type CqResponse = { status?: { code?: number }; result?: { window?: string; data?: Row[] } };

async function fetchMetric(m: (typeof ONCHAIN_METRICS)[number], key: string) {
  const qs = new URLSearchParams({ ...m.params, limit: "1" }).toString();
  try {
    const res = await fetch(`${BASE}${m.path}?${qs}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 600 },
    });
    if (!res.ok) return { key: m.key, value: null, error: res.status };
    const json = (await res.json()) as CqResponse;
    const row = json.result?.data?.[0];
    const raw = row ? row[m.field] : undefined;
    const value = typeof raw === "number" ? raw : Number(raw);
    return {
      key: m.key,
      value: Number.isFinite(value) ? value : null,
      at: row?.datetime ?? row?.date ?? null,
    };
  } catch {
    return { key: m.key, value: null };
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.CRYPTOQUANT_API_KEY;
  if (!key) {
    // Not configured yet — tell the client so it can show a setup hint.
    return NextResponse.json({ configured: false, metrics: [] });
  }

  const metrics = await Promise.all(ONCHAIN_METRICS.map((m) => fetchMetric(m, key)));
  return NextResponse.json({ configured: true, metrics });
}
