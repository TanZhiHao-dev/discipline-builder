"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Calculator,
  CheckCircle,
  Clock,
  FlaskConical,
  LayoutGrid,
  LineChart,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { onOpenCommand, openTool } from "@/lib/tools";

// Cmd/Ctrl+K command palette — keyboard-first navigation + tools.
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = onOpenCommand(() => setOpen(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };
  const tool = (t: "risk" | "sessions" | "events") => {
    setOpen(false);
    // let the dialog close before opening the tool dialog
    setTimeout(() => openTool(t), 60);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages or tools…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/dashboard")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Today
          </CommandItem>
          <CommandItem onSelect={() => go("/terminal")}>
            <LineChart className="mr-2 h-4 w-4" />
            Terminal
          </CommandItem>
          <CommandItem onSelect={() => go("/journal")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Journal
          </CommandItem>
          <CommandItem onSelect={() => go("/backtest")}>
            <FlaskConical className="mr-2 h-4 w-4" />
            Backtest
          </CommandItem>
          <CommandItem onSelect={() => go("/stats")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Stats
          </CommandItem>
          <CommandItem onSelect={() => go("/habits")}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Habits
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Trading tools">
          <CommandItem onSelect={() => tool("risk")}>
            <Calculator className="mr-2 h-4 w-4" />
            Risk / Position Calculator
          </CommandItem>
          <CommandItem onSelect={() => tool("sessions")}>
            <Clock className="mr-2 h-4 w-4" />
            Killzones / Sessions
          </CommandItem>
          <CommandItem onSelect={() => tool("events")}>
            <CalendarClock className="mr-2 h-4 w-4" />
            Economic Events
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
