#!/usr/bin/env node
// Safe, online, read-only backup of the live SQLite database.
// Uses better-sqlite3's backup API (consistent snapshot even while the app
// writes, thanks to WAL). Writes a timestamped copy into ./backups and keeps the
// most recent KEEP files. Run manually or on a schedule (launchd) — it never
// mutates the source database.
import Database from "better-sqlite3";
import {
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KEEP = 72; // e.g. hourly for ~3 days

// Same DATA_DIR override the app's db client uses (Docker/Coolify mounts a
// persistent volume there); defaults to the repo root for local/manual runs.
const root = process.env.DATA_DIR ?? dirname(dirname(fileURLToPath(import.meta.url)));
const dbPath = join(root, "habitline.db");
const backupDir = join(root, "backups");

if (!existsSync(dbPath)) {
  console.error(`[backup] no database at ${dbPath}`);
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });

const stamp = new Date()
  .toISOString()
  .replace(/[:]/g, "-")
  .replace(/\..+$/, "");
const dest = join(backupDir, `habitline-${stamp}.db`);

const db = new Database(dbPath, { readonly: true });
try {
  await db.backup(dest);
  console.log(`[backup] wrote ${dest}`);
} finally {
  db.close();
}

// Prune old backups, newest first.
const files = readdirSync(backupDir)
  .filter((f) => f.startsWith("habitline-") && f.endsWith(".db"))
  .map((f) => ({ f, t: statSync(join(backupDir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);
for (const { f } of files.slice(KEEP)) {
  rmSync(join(backupDir, f));
  console.log(`[backup] pruned ${f}`);
}
