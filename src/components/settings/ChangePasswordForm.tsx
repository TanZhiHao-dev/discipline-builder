"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit =
    current.length > 0 && next.length >= 8 && confirm === next && !pending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: revokeOthers,
      });
      if (error) {
        toast.error(
          error.message?.toLowerCase().includes("invalid") ||
            error.message?.toLowerCase().includes("password")
            ? "Current password is incorrect"
            : (error.message ?? "Couldn't change password"),
        );
        return;
      }
      toast.success("Password changed ✓");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      toast.error("Couldn't change password — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">Change password</h2>
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Current password">
          <PwInput
            value={current}
            onChange={setCurrent}
            show={show}
            placeholder="Your current password"
            autoComplete="current-password"
          />
        </Field>

        <Field label="New password">
          <PwInput
            value={next}
            onChange={setNext}
            show={show}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          {tooShort ? (
            <p className="mt-1 text-[11px] text-destructive">
              Must be at least 8 characters.
            </p>
          ) : null}
        </Field>

        <Field label="Confirm new password">
          <PwInput
            value={confirm}
            onChange={setConfirm}
            show={show}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
          {mismatch ? (
            <p className="mt-1 text-[11px] text-destructive">
              Passwords don&apos;t match.
            </p>
          ) : null}
        </Field>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {show ? "Hide" : "Show"} passwords
          </button>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={revokeOthers}
              onChange={(e) => setRevokeOthers(e.target.checked)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Sign out other devices
          </label>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "w-full bg-brand text-white hover:bg-brand/90",
            !canSubmit && "opacity-60",
          )}
        >
          {pending ? "Saving…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PwInput({
  value,
  onChange,
  show,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  );
}
