// Client-side image helpers for the trade journal. Compresses pasted / dropped
// / picked images to a bounded JPEG data URL so they can live in SQLite without
// bloating the DB. Runs in the browser only (uses Image + canvas).

const MAX_DIM = 1600; // longest edge
const QUALITY = 0.82;

function dataUrlFromCanvas(img: HTMLImageElement): string {
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas ctx");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

/** Compress a File/Blob (from paste, drop, or file picker) to a JPEG data URL. */
export function blobToCompressedDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const out = dataUrlFromCanvas(img);
        URL.revokeObjectURL(url);
        resolve(out);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

/** Pull image files out of a paste/drop event's DataTransfer (if any). */
export function imagesFromDataTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  const out: File[] = [];
  if (dt.files && dt.files.length) {
    for (const f of Array.from(dt.files)) {
      if (f.type.startsWith("image/")) out.push(f);
    }
  }
  if (out.length === 0 && dt.items) {
    for (const it of Array.from(dt.items)) {
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) out.push(f);
      }
    }
  }
  return out;
}
