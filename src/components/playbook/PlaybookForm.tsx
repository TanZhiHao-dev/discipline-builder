"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { savePlaybook, deletePlaybook } from "@/server/playbook";
import type { PlaybookRow } from "@/db/schema";
import { cn } from "@/lib/utils";

export const PLAYBOOK_COLORS = [
  "green",
  "blue",
  "teal",
  "amber",
  "pink",
  "lavender",
] as const;

// Full class strings so Tailwind keeps them in the build (no dynamic names).
export const PLAYBOOK_DOT: Record<string, string> = {
  green: "bg-cat-green",
  blue: "bg-cat-blue",
  teal: "bg-cat-teal",
  amber: "bg-cat-amber",
  pink: "bg-cat-pink",
  lavender: "bg-cat-lavender",
};

export const PLAYBOOK_SOFT: Record<string, string> = {
  green: "bg-cat-green/12",
  blue: "bg-cat-blue/12",
  teal: "bg-cat-teal/12",
  amber: "bg-cat-amber/12",
  pink: "bg-cat-pink/12",
  lavender: "bg-cat-lavender/12",
};

export function PlaybookForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: PlaybookRow | null;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [color, setColor] = useState(editing?.color ?? "blue");
  const [rules, setRules] = useState(editing?.rules ?? "");
  const [checklist, setChecklist] = useState(editing?.checklist ?? "");

  function submit() {
    if (!name.trim()) {
      toast.error("Name your playbook");
      return;
    }
    startTransition(async () => {
      try {
        await savePlaybook({
          id: editing?.id,
          name: name.trim(),
          description: description.trim(),
          rules,
          checklist,
          color,
        });
        toast.success(editing ? "Playbook updated" : "Playbook added");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function remove() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await deletePlaybook(editing.id);
        toast.success("Playbook deleted");
        onOpenChange(false);
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {editing ? "Edit playbook" : "New playbook"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Name</Label>
            <Input
              placeholder="e.g. London Silver Bullet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Description</Label>
            <Input
              placeholder="One-line summary of the setup"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2">
              {PLAYBOOK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-2 transition-all",
                    PLAYBOOK_DOT[c],
                    color === c && "ring-2 ring-ink",
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Rules</Label>
            <textarea
              placeholder="One rule per line…"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Checklist</Label>
            <textarea
              placeholder="One checklist item per line…"
              value={checklist}
              onChange={(e) => setChecklist(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {editing ? (
            <Button
              variant="ghost"
              onClick={remove}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={submit}
            disabled={pending}
            className="bg-brand text-white hover:bg-brand/90"
          >
            {pending ? "Saving…" : editing ? "Save" : "Add playbook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
