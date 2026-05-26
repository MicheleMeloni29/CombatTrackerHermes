export type CombatLogEventType =
  | "damage"
  | "heal"
  | "character_added"
  | "character_deleted"
  | "combat_started"
  | "combat_reset"
  | "turn_changed"
  | "round_changed"
  | "spell_cast"
  | "spell_expired";

export interface CombatLogEvent {
  id: string;
  type: CombatLogEventType;
  timestamp: number; // elapsedSeconds at the time of the event
  message: string;
}
