// Tiny global event bus so any surface (command palette, status bar, dashboard
// header) can open the global tool dialogs rendered once in ToolsHost.

export type ToolKey = "risk" | "sessions" | "events";

export function openTool(tool: ToolKey) {
  window.dispatchEvent(new CustomEvent("sop:tool", { detail: tool }));
}

export function onOpenTool(cb: (tool: ToolKey) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ToolKey>).detail);
  window.addEventListener("sop:tool", handler);
  return () => window.removeEventListener("sop:tool", handler);
}

export function openCommand() {
  window.dispatchEvent(new CustomEvent("sop:cmdk"));
}

export function onOpenCommand(cb: () => void) {
  window.addEventListener("sop:cmdk", cb);
  return () => window.removeEventListener("sop:cmdk", cb);
}
