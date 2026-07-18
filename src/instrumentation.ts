// Next.js instrumentation — runs once when the server process starts.
export async function register() {
  // Node runtime only (skip Edge). Backups need better-sqlite3 + fs.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startBackupScheduler } = await import("@/server/backup-scheduler");
  startBackupScheduler();
}
