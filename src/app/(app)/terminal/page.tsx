import { TickerTape } from "@/components/TickerTape";
import { StatusBar } from "@/components/StatusBar";
import { TerminalWorkspace } from "@/components/TerminalWorkspace";

// Pro trading terminal — dark, full-height workspace (ticker + multi-timeframe
// charts + tools + session status bar). Scoped `dark` so the terminal keeps its
// terminal look regardless of the rest of the app being light.
export default function TerminalPage() {
  return (
    <div className="dark flex min-h-[calc(100vh-3.5rem)] flex-col bg-background text-foreground md:h-[calc(100vh-3.5rem)]">
      <TickerTape />
      <div className="min-h-0 flex-1">
        <TerminalWorkspace />
      </div>
      <StatusBar />
    </div>
  );
}
