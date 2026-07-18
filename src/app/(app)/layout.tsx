import { requireUser } from "@/lib/session";
import { AppNav } from "@/components/AppNav";
import { ToolsHost } from "@/components/ToolsHost";
import { CommandPalette } from "@/components/CommandPalette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const firstName = (user.name || user.email).split(" ")[0].split("@")[0];

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav name={firstName} />
      <main className="flex-1">{children}</main>
      {/* Trading tools + Cmd/Ctrl+K palette, available app-wide */}
      <ToolsHost />
      <CommandPalette />
    </div>
  );
}
