"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          name: name || email.split("@")[0],
          email,
          password,
        });
        if (error) throw new Error(error.message);
        toast.success("Welcome to Discipline Builder 🎉");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* soft ambient backdrop */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-cat-pink/10 blur-[110px]" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-3 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <BrandMark className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Discipline Builder</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start building habits that stick"
                : "Welcome back"}
            </p>
          </div>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5"
        >
          {mode === "signup" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "signup" ? "signin" : "signup"))
            }
            className="font-medium text-primary hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}
