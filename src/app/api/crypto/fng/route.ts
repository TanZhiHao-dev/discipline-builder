import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Crypto Fear & Greed Index (alternative.me — free, no key). Proxied server-side
// so the client stays same-origin; cached for an hour.
export const revalidate = 3600;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const json = (await res.json()) as {
      data?: { value?: string; value_classification?: string; timestamp?: string }[];
    };
    const d = json.data?.[0];
    const value = Number(d?.value);
    if (!Number.isFinite(value)) throw new Error("bad payload");
    return NextResponse.json({
      value,
      classification: d?.value_classification ?? "",
      at: d?.timestamp ? Number(d.timestamp) * 1000 : null,
    });
  } catch {
    // Graceful: the desk renders without the gauge.
    return NextResponse.json({ value: null }, { status: 200 });
  }
}
