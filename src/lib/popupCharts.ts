import { TIMEFRAMES } from "./assets";

// Opens the 4 timeframes as real TradingView popup windows, tiled 2x2 across
// the screen. Popups are first-party tradingview.com, so the user's login (and
// LuxAlgo) work — no third-party-cookie / storage-partition problem.
// Returns how many windows the browser blocked (0 = all opened).
export function openTiledCharts(symbol: string, layoutUrl?: string): number {
  const sw = window.screen.availWidth;
  const sh = window.screen.availHeight;
  const w = Math.floor(sw / 2);
  const h = Math.floor(sh / 2);
  const quadrants = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];

  const base = layoutUrl?.trim()
    ? layoutUrl.trim().split("?")[0].split("#")[0]
    : "https://www.tradingview.com/chart/";

  let blocked = 0;
  TIMEFRAMES.forEach((tf, i) => {
    const p = quadrants[i] ?? quadrants[0];
    const url = `${base}?symbol=${encodeURIComponent(symbol)}&interval=${tf.interval}`;
    const features = `popup=yes,width=${w},height=${h},left=${p.x},top=${p.y}`;
    const win = window.open(url, `tvchart_${tf.interval}`, features);
    if (!win) blocked++;
  });
  return blocked;
}
