"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Instant click feedback. A capture-phase click listener flips a fixed top
 * progress bar ON *synchronously* the moment any internal link is clicked —
 * before React re-renders and before the server responds — so every click
 * (warm OR cold) gets a visible response in the same frame (~1ms), not after a
 * network round-trip. The bar trickles while the route loads and completes when
 * the pathname changes. Pure DOM writes (no React state on the hot path) keep it
 * as fast as the browser allows.
 */
export function TopProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const progRef = useRef(0);
  const activeRef = useRef(false);

  // Complete the bar whenever navigation actually lands on a new path.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !activeRef.current) return;
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    bar.style.width = "100%";
    bar.style.opacity = "1";
    const t = setTimeout(() => {
      bar.style.transition = "opacity 200ms ease";
      bar.style.opacity = "0";
      setTimeout(() => {
        bar.style.transition = "";
        bar.style.width = "0%";
        progRef.current = 0;
      }, 220);
    }, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    function trickle() {
      // ease toward ~90% while we wait for the route to load
      progRef.current += (90 - progRef.current) * 0.06 + 0.4;
      if (progRef.current > 90) progRef.current = 90;
      if (bar) bar.style.width = progRef.current + "%";
      rafRef.current = requestAnimationFrame(trickle);
    }

    function onClick(e: MouseEvent) {
      // ignore modified / non-primary clicks (new tab, etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = e.target as Element | null;
      const a = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      // only in-app navigations that actually change the path
      if (!href.startsWith("/") || href.startsWith("/#")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const dest = href.split(/[?#]/)[0];
      if (dest === window.location.pathname) return;

      // === the instant response: synchronous DOM write, same click frame ===
      activeRef.current = true;
      progRef.current = 8;
      bar!.style.transition = "";
      bar!.style.opacity = "1";
      bar!.style.width = "8%";
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(trickle);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5"
    >
      <div
        ref={barRef}
        className="h-full w-0 bg-primary shadow-[0_0_8px_var(--color-primary)]"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
