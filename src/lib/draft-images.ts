"use client";

// Draft screenshots live in IndexedDB (not localStorage) so a form's pasted
// charts survive an accidental close/refresh alongside the text draft. Images
// are multi-MB base64 — localStorage's ~5MB cap would fail; IndexedDB holds far
// more. Keyed by the same draftKey as the text draft; cleared together.

const DB_NAME = "db_drafts";
const STORE = "images";

type Shots = Record<string, string[]>;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no-idb"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getImageDraft(key: string): Promise<Shots | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Shots) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setImageDraft(key: string, shots: Shots): Promise<void> {
  try {
    const empty = Object.values(shots).every((a) => !a || a.length === 0);
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      if (empty) store.delete(key);
      else store.put(shots, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* best-effort */
  }
}

export async function clearImageDraft(key: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* best-effort */
  }
}
