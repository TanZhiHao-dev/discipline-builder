import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Trades/pre-market analyses carry several compressed chart screenshots
      // (base64). Default Server Action body limit is 1 MB — too small once you
      // paste a few. 16 MB fits ~20 compressed screenshots plus notes.
      bodySizeLimit: "16mb",
    },
    // Client-side router cache lifetime. Next defaults dynamic routes to 0s
    // (every revisit re-hits the server). Caching them ~60s makes bouncing
    // between already-visited pages INSTANT (no server round-trip) and lightens
    // load on the small VPS. Mutations still call revalidatePath, which busts
    // the cache, so the user never sees stale data after their own edits.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
