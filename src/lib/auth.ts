import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as authSchema from "@/db/auth-schema";

// Trust localhost + any private-LAN origin on port 3020 so the app works when
// opened from a phone/other device on the same Wi-Fi (http://192.168.x.x:3020),
// not just from the host machine. Extra origins can be added via
// TRUSTED_ORIGINS (comma-separated) without a code change.
const trustedOrigins = [
  "http://localhost:3000",
  "http://localhost:3020",
  "http://127.0.0.1:3020",
  // common private LAN ranges (Better Auth supports wildcard patterns)
  "http://192.168.*.*:3020",
  "http://10.*.*.*:3020",
  "http://172.16.*.*:3020",
  // public tunnels (Cloudflare quick tunnel / ngrok) — any random subdomain
  "https://*.trycloudflare.com",
  "https://*.ngrok-free.app",
  "https://*.ngrok.app",
  ...(process.env.TRUSTED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
];

export const auth = betterAuth({
  // No fixed baseURL — infer per request so login works on localhost AND the LAN IP.
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  plugins: [nextCookies()], // must be last
});
