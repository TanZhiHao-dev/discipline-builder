import { requireUser } from "@/lib/session";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-medium text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account.
        </p>
      </div>

      {/* Account */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate font-semibold text-ink">
              {user.name || "—"}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
