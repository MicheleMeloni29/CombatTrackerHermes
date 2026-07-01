import type { Character } from "@/types/character";
import type { CombatLogEvent } from "@/types/combatLog";

export interface CombatSnapshot {
  characters: Character[];
  currentTurnIndex: number;
  round: number;
  isCombatStarted: boolean;
  log: CombatLogEvent[];
}

export interface SavedCombat extends CombatSnapshot {
  id: string;
  name: string;
  savedAt: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastAutosavedAt?: string | null;
}
