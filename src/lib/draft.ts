"use client";

// Best-effort form drafts kept in localStorage so in-progress writing survives a
// refresh, tab switch, crash, or accidental close. A draft is cleared only on an
// explicit Cancel or a successful save — never on X / Escape / navigation.
// Images (heavy base64) are intentionally NOT stored here to avoid blowing the
// ~5MB quota; only text/selection fields are drafted.

const PREFIX = "db:draft:";

export function draftKey(parts: (string | null | undefined)[]): string {
  return PREFIX + parts.map((p) => p ?? "").join(":");
}

export function readDraft<T = Record<string, unknown>>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota / serialization errors — drafts are best-effort
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
