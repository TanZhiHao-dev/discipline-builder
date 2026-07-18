import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { join } from "node:path";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

// HMR-safe singleton — cache the client on globalThis so Next dev doesn't open a
// new SQLite handle (and re-migrate) on every module reload.
const globalForDb = globalThis as unknown as {
  __habitlineDb?: ReturnType<typeof createDb>;
};

// DATA_DIR lets the DB file live outside the app code directory (e.g. a
// mounted persistent volume in Docker/Coolify) so it survives redeploys.
// Unset locally — defaults to cwd, unchanged from before.
const DATA_DIR = process.env.DATA_DIR ?? process.cwd();

function createDb() {
  const sqlite = new Database(join(DATA_DIR, "habitline.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema: { ...schema, ...authSchema } });

  try {
    migrate(db, { migrationsFolder: "./drizzle" });
  } catch (err) {
    console.error("[db] migration failed:", err);
  }

  return db;
}

export const db = globalForDb.__habitlineDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__habitlineDb = db;
}
