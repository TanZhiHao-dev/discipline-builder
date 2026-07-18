"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Reveal } from "@/components/landing/Reveal";
import { BrandMark } from "@/components/BrandMark";

/* ------------------------------------------------------------------ */
/* Decorative QR code (no QR asset ships with the template, so we      */
/* render a deterministic QR-style pattern — purely decorative).       */
/* ------------------------------------------------------------------ */

const QR_MODULES = 21;

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildQrPattern(): boolean[][] {
  const rand = seededRandom(20260710);
  const grid: boolean[][] = Array.from({ length: QR_MODULES }, () =>
    Array.from({ length: QR_MODULES }, () => false),
  );

  const finderOrigins: Array<[number, number]> = [
    [0, 0],
    [QR_MODULES - 7, 0],
    [0, QR_MODULES - 7],
  ];

  const inFinderZone = (r: number, c: number) =>
    (r <= 7 && c <= 7) ||
    (r <= 7 && c >= QR_MODULES - 8) ||
    (r >= QR_MODULES - 8 && c <= 7);

  // Finder squares: 7x7 ring + 3x3 core
  for (const [or, oc] of finderOrigins) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[or + r][oc + c] = ring || core;
      }
    }
  }

  for (let r = 0; r < QR_MODULES; r++) {
    for (let c = 0; c < QR_MODULES; c++) {
      if (inFinderZone(r, c)) continue;
      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0; // timing pattern
      } else {
        grid[r][c] = rand() > 0.52;
      }
    }
  }

  return grid;
}

const QR_PATTERN = buildQrPattern();

function DecorativeQr() {
  return (
    <svg
      viewBox={`0 0 ${QR_MODULES} ${QR_MODULES}`}
      className="h-40 w-40"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {QR_PATTERN.flatMap((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              className="fill-ink"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Store pills (icon paths from the template's downloaded SVG assets)  */
/* ------------------------------------------------------------------ */

function AppleIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.001 0h.142c.114 1.41-.424 2.464-1.078 3.228-.642.757-1.521 1.493-2.943 1.381-.095-1.39.444-2.366 1.098-3.127C9.826.772 10.937.14 12 0Zm4.304 14.68v.04c-.4 1.21-.97 2.247-1.665 3.21-.635.874-1.413 2.05-2.802 2.05-1.2 0-1.998-.772-3.229-.793-1.301-.021-2.017.645-3.207.813h-.406c-.874-.127-1.579-.819-2.093-1.442C1.388 16.715.218 14.335 0 11.29v-.895c.092-2.18 1.151-3.952 2.56-4.811.742-.457 1.764-.846 2.9-.672.488.075.986.242 1.423.407.413.16.93.441 1.42.426.333-.01.663-.182.997-.304.98-.354 1.941-.76 3.208-.57 1.522.23 2.602.907 3.27 1.95-1.288.82-2.306 2.054-2.132 4.163.155 1.915 1.268 3.036 2.66 3.697Z"
      />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.439 20c.668 0 1.252-.583 1.252-1.252v-2.924h.835c.502 0 .836-.334.836-.835v-8.35H3.34v8.35c0 .501.335.835.836.835h.836v2.924c0 .669.583 1.252 1.252 1.252s1.252-.583 1.252-1.252v-2.924h1.672v2.924c0 .669.583 1.252 1.252 1.252Zm5.011-5.011c.669 0 1.252-.584 1.252-1.252V7.89c0-.666-.583-1.252-1.252-1.252s-1.252.586-1.252 1.252v5.847c0 .668.583 1.252 1.252 1.252m-14.198 0c.669 0 1.252-.584 1.252-1.252V7.89c0-.666-.583-1.252-1.252-1.252S0 7.224 0 7.89v5.847c0 .668.583 1.252 1.252 1.252M12.36.126a.4.4 0 0 0-.584 0l-1.121 1.118-.052.051q-.996-.499-2.24-.5H8.34q-1.245.001-2.24.5l-.052-.051L4.926.126a.4.4 0 0 0-.583 0 .4.4 0 0 0 0 .583l1.084 1.084a4.5 4.5 0 0 0-.942.846c-.66.782-1.08 1.8-1.138 2.902l-.002.034a5 5 0 0 0-.006.227h10.023q0-.114-.005-.227l-.002-.034a4.9 4.9 0 0 0-1.139-2.902 4.5 4.5 0 0 0-.941-.846L12.358.71a.4.4 0 0 0 0-.583ZM6.261 4.342a.626.626 0 1 1 0-1.252.626.626 0 0 1 0 1.252m4.178 0a.626.626 0 1 1 0-1.252.626.626 0 0 1 0 1.252"
      />
    </svg>
  );
}

function StorePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
    >
      {icon}
      {label}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Footer link columns                                                 */
/* ------------------------------------------------------------------ */

type FooterLink = { label: string; href: string };

const QUICK_LINKS: FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-case" },
  { label: "Social proof", href: "#reviews" },
  { label: "Numbers", href: "#metrics" },
  { label: "AI Suggestions", href: "#smart-assist" },
];

const PAGES_LINKS: FooterLink[] = [
  { label: "About", href: "#" },
  { label: "Waitlist", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Error 404", href: "#" },
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: "FAQs", href: "#faq" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-white/40">{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="block py-1.5 text-sm text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Social icons (lucide v1 dropped brand icons — simple inline glyphs) */
/* ------------------------------------------------------------------ */

function SocialCircle({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        {children}
      </svg>
    </a>
  );
}

function SocialRow() {
  return (
    <div className="flex items-center gap-2">
      <SocialCircle label="Instagram">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
      </SocialCircle>
      <SocialCircle label="X (Twitter)">
        <path d="M4 4l16 16" />
        <path d="M20 4L4 20" />
      </SocialCircle>
      <SocialCircle label="YouTube">
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
      </SocialCircle>
      <SocialCircle label="LinkedIn">
        <line x1="6" y1="10" x2="6" y2="18" />
        <circle cx="6" cy="6" r="0.5" fill="currentColor" />
        <path d="M11 18v-8" />
        <path d="M11 13.5c0-2 1.5-3.5 3.5-3.5S18 11.5 18 13.5V18" />
      </SocialCircle>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main export                                                         */
/* ------------------------------------------------------------------ */

export function CtaFooter() {
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("You're on the list!");
    e.currentTarget.reset();
  };

  return (
    <>
      {/* ============ PART 1 — CTA ============ */}
      <section id="download" className="relative overflow-hidden bg-paper py-28">
        {/* Decorative clouds */}
        <Image
          src="/landing/c5yKOUxAULPtn3CoxX5b92vgJ8U.png"
          alt=""
          width={2994}
          height={589}
          aria-hidden="true"
          className="pointer-events-none absolute -left-44 top-8 w-[760px] max-w-none select-none opacity-80"
        />
        <Image
          src="/landing/Z13RlvdoTurS0rPL8TlEtyXaTWA.png"
          alt=""
          width={575}
          height={191}
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-12 w-[460px] max-w-none select-none opacity-80"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-3">
          {/* LEFT — copy + store pills */}
          <Reveal>
            <h2 className="font-headline text-4xl font-medium text-ink">
              Build better habits with less effort
            </h2>
            <p className="mt-4 text-muted-foreground">
              Track what matters, stay organized, and improve at your own pace.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row md:flex-col lg:flex-row">
              <StorePill icon={<AppleIcon />} label="Download for iPhone" />
              <StorePill icon={<AndroidIcon />} label="Get it on Android" />
            </div>
          </Reveal>

          {/* CENTER — phone in hand */}
          <Reveal delay={120}>
            <Image
              src="/landing/Yxyz4xAO2Afi4x2mrtShsiVlWA.png"
              alt="Hand holding a phone showing the Discipline Builder dashboard"
              width={1046}
              height={1600}
              className="mx-auto h-auto w-[320px]"
            />
          </Reveal>

          {/* RIGHT — QR card */}
          <Reveal delay={240} className="md:justify-self-end">
            <h3 className="font-headline text-2xl font-medium text-ink">
              Scan the QR code to download the app
            </h3>
            <div className="mt-6 w-fit rounded-[1.5rem] border border-border bg-white p-4">
              <DecorativeQr />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ PART 2 — FOOTER ============ */}
      <footer className="bg-ink pb-8 pt-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* Col 1 — brand + newsletter */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                  <BrandMark className="h-4 w-4" />
                </span>
                <span className="font-headline text-xl font-medium text-white">
                  Discipline Builder
                </span>
              </div>
              <p className="mt-6 font-medium">Stay on top of your habits</p>
              <p className="mt-1.5 text-sm text-white/50">
                No spam. Just simple advice for staying consistent.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="mt-4 flex max-w-sm gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <FooterCol title="Quick links" links={QUICK_LINKS} />
            <FooterCol title="Pages" links={PAGES_LINKS} />
            <FooterCol title="Support" links={SUPPORT_LINKS} />
          </div>

          {/* Bottom row */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
            <p>
              &copy; 2026 Discipline Builder. Rebuilt as real code &mdash; original
              design by Webestica.
            </p>
            <SocialRow />
          </div>
        </div>
      </footer>
    </>
  );
}
