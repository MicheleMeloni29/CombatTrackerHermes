"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { CombatLogEvent } from "@/types/combatLog";

interface CombatLogContextType {
  log: CombatLogEvent[];
  addEvent: (type: CombatLogEvent["type"], message: string, timestamp?: number) => void;
  clearLog: () => void;
}

const CombatLogContext = createContext<CombatLogContextType | null>(null);

export function CombatLogProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<CombatLogEvent[]>([]);

  const addEvent = useCallback(
    (type: CombatLogEvent["type"], message: string, timestamp = 0) => {
      setLog((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type,
          timestamp,
          message,
        },
      ]);
    },
    []
  );

  const clearLog = useCallback(() => setLog([]), []);

  return (
    <CombatLogContext.Provider value={{ log, addEvent, clearLog }}>
      {children}
    </CombatLogContext.Provider>
  );
}

export function useCombatLog() {
  const ctx = useContext(CombatLogContext);
  if (!ctx) throw new Error("useCombatLog must be used within CombatLogProvider");
  return ctx;
}

export { CombatLogContext };
