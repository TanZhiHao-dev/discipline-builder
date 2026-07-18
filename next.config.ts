import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Trades/pre-market analyses carry several compressed chart screenshots
      // (base64). Default Server Action body limit is 1 MB — too small once you
      // paste a few. 16 MB fits ~20 compressed screenshots plus notes.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
