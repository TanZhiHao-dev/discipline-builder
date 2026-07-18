// In-process automatic backups. Runs inside the Next.js server (Node runtime):
// a consistent, read-only snapshot of habitline.db on boot and every hour while
// the app is running — which is exactly when data can change. Snapshots land in
// ./backups (timestamped), pruned to the most recent KEEP. Never mutates the
// live DB. This is durability insurance; it is not a substitute for Postgres.
import Database from "better-sqlite3";
import {
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";

const KEEP = 72; // hourly ≈ 3 days of history
const INTERVAL_MS = 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __dbBackupTimer: ReturnType<typeof setInterval> | undefined;
}

function runBackup() {
  try {
    // Same DATA_DIR the db client uses — keeps DB + backups on the same
    // (ideally mounted-volume) path in Docker/Coolify.
    const root = process.env.DATA_DIR ?? process.cwd();
    const dbPath = join(root, "habitline.db");
    if (!existsSync(dbPath)) return;

    const backupDir = join(root, "backups");
    mkdirSync(backupDir, { recursive: true });

    const stamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+$/, "");
    const dest = join(backupDir, `habitline-${stamp}.db`);

    const db = new Database(dbPath, { readonly: true });
    db.backup(dest)
      .then(() => {
        const files = readdirSync(backupDir)
          .filter((f) => f.startsWith("habitline-") && f.endsWith(".db"))
          .map((f) => ({ f, t: statSync(join(backupDir, f)).mtimeMs }))
          .sort((a, b) => b.t - a.t);
        for (const { f } of files.slice(KEEP)) rmSync(join(backupDir, f));
      })
      .catch(() => {})
      .finally(() => db.close());
  } catch {
    // best-effort — never let a backup failure affect the app
  }
}

export function startBackupScheduler() {
  if (globalThis.__dbBackupTimer) return; // guard against HMR double-registration
  runBackup(); // snapshot on boot
  const timer = setInterval(runBackup, INTERVAL_MS);
  timer.unref?.(); // don't keep the process alive just for backups
  globalThis.__dbBackupTimer = timer;
}
