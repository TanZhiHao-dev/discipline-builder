"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Today" },
  { href: "/habits", label: "Habits" },
  { href: "/money", label: "Money" },
  { href: "/terminal", label: "Terminal" },
  { href: "/crypto", label: "Crypto" },
  { href: "/journal", label: "Journal" },
  { href: "/paper", label: "Paper" },
  { href: "/backtest", label: "Backtest" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/review", label: "Review" },
  { href: "/stats", label: "Stats" },
  { href: "/insights", label: "Insights" },
];

export function AppNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4">
        <Link href="/dashboard" className="mr-1 flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BrandMark className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-bold leading-tight tracking-tight">
            Discipline Builder
          </span>
        </Link>

        {/* Desktop nav — horizontal pills (scrolls if tight). Hidden below xl. */}
        <nav className="hidden min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-border bg-secondary/60 p-1 xl:flex">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href="/settings"
            title="Settings"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Hi, <span className="font-medium text-foreground">{name}</span>
          </Link>
          <Link
            href="/settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground xl:flex"
          >
            <LogOut className="h-4 w-4" />
          </button>
          {/* Hamburger — mobile / tablet only */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open ? (
        <nav className="border-t border-border bg-background px-3 py-3 xl:hidden">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-foreground hover:bg-accent",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" /> {name}&apos;s settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
