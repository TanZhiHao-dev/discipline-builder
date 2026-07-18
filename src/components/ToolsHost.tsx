"use client";

import { useEffect, useState } from "react";
import { Calculator, CalendarClock, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiskCalculator } from "./RiskCalculator";
import { KillzoneBoard } from "./KillzoneBoard";
import { EconomicEvents } from "./EconomicEvents";
import { onOpenTool, type ToolKey } from "@/lib/tools";

// Renders the global tool dialogs once; opened from anywhere via openTool().
export function ToolsHost() {
  const [tool, setTool] = useState<ToolKey | null>(null);

  useEffect(() => onOpenTool(setTool), []);

  return (
    <>
      <Dialog open={tool === "risk"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-primary" />
              Risk / Position Size
            </DialogTitle>
          </DialogHeader>
          <RiskCalculator />
        </DialogContent>
      </Dialog>

      <Dialog open={tool === "sessions"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Killzones / Sessions
            </DialogTitle>
          </DialogHeader>
          <KillzoneBoard />
        </DialogContent>
      </Dialog>

      <Dialog open={tool === "events"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" />
              Economic Events
            </DialogTitle>
          </DialogHeader>
          <EconomicEvents />
        </DialogContent>
      </Dialog>
    </>
  );
}
