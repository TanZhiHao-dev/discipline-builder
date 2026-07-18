"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "sop_template_items";

const DEFAULT_ITEMS = [
  "HTF bias (Monthly & Weekly) marked",
  "Killzone / session time active",
  "Liquidity (BSL / SSL) marked",
  "FVG & Order Block drawn",
  "PD Array (Premium / Discount) plotted",
  "Entry, SL & TP levels clear",
];

// A quick pre-trade "chart template" reminder. The item list is editable and
// persisted to localStorage; the checkmarks are per-session (reset on reload)
// so every analysis starts from a clean checklist.
export function TemplateReminder() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  function saveEdits() {
    const next = draft
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setItems(next);
    setChecked({});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEditing(false);
  }

  const doneCount = items.filter((_, i) => checked[i]).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <ClipboardList className="h-4 w-4" />
          Checklist
          <span className="ml-0.5 rounded bg-secondary px-1 text-[10px] tabular-nums">
            {doneCount}/{items.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Chart checklist</h4>
          <button
            onClick={() => {
              setDraft(items.join("\n"));
              setEditing((v) => !v);
            }}
            className="text-muted-foreground hover:text-foreground"
            title="Edit checklist"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              rows={7}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="One item per line…"
              className="text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdits}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!checked[i]}
                    onChange={(e) =>
                      setChecked((c) => ({ ...c, [i]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span
                    className={
                      checked[i] ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
