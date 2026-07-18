import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { BrandMark } from "@/components/BrandMark";

const NAV_LINKS = [
  { label: "What's inside", href: "#features" },
  { label: "Use case", href: "#use-case" },
  { label: "Metrics", href: "#metrics" },
  { label: "Smart Assist", href: "#smart-assist" },
] as const;

function LogoMark() {
  return <BrandMark className="h-[22px] w-[22px] text-brand" />;
}

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <Reveal className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6">
        {/* Left: logo pill */}
        <Link
          href="/"
          aria-label="Discipline Builder home"
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"
        >
          <LogoMark />
          <span className="font-headline text-lg font-semibold leading-none text-ink">
            Discipline Builder
          </span>
        </Link>

        {/* Center: nav links pill (desktop only) */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-sm md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-ink transition-opacity hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: log in pill (desktop only) */}
        <div className="hidden items-center rounded-full bg-white p-1.5 shadow-sm md:flex">
          <Link
            href="/login"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            Log in
          </Link>
        </div>

        {/* Mobile: single dark Log in pill */}
        <Link
          href="/login"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ink/90 md:hidden"
        >
          Log in
        </Link>
      </Reveal>
    </header>
  );
}
