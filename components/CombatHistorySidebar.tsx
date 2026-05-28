// Questo componente mostra la cronologia degli eventi di combattimento, con icone e colori per ogni tipo di evento.

"use client";

import { useCombatLog } from "@/components/CombatContext";
import type { CombatLogEvent } from "@/types/combatLog";

function getEventIcon(type: CombatLogEvent["type"]): string {
  switch (type) {
    case "damage": return "⚔️";
    case "heal": return "💚";
    case "character_added": return "➕";
    case "character_deleted": return "➖";
    case "combat_started": return "⚡";
    case "combat_reset": return "🔄";
    case "turn_changed": return "👉";
    case "round_changed": return "🔁";
    case "spell_cast": return "✨";
    case "spell_expired": return "⌛";
    default: return "📝";
  }
}

function getEventColor(type: CombatLogEvent["type"]): string {
  switch (type) {
    case "damage": return "text-red-400";
    case "heal": return "text-emerald-400";
    case "character_added": return "text-sky-400";
    case "character_deleted": return "text-gold-dim/50";
    case "combat_started": return "text-gold";
    case "combat_reset": return "text-orange-400";
    case "turn_changed": return "text-violet-400";
    case "round_changed": return "text-amber-300";
    case "spell_cast": return "text-purple-400";
    case "spell_expired": return "text-gold-dim/40";
    default: return "text-gold-dim/60";
  }
}

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CombatHistorySidebar() {
  const { log } = useCombatLog();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medieval text-gold text-base tracking-wide">
          📜 Cronologia
        </h2>
        {log.length > 0 && (
          <span className="text-gold-dim/40 text-xs font-mono">
            {log.length} eventi
          </span>
        )}
      </div>

      {log.length === 0 ? (
        <div className="text-center py-12 text-gold-dim/30">
          <p className="text-2xl mb-2">📜</p>
          <p className="text-xs">Nessun evento registrato</p>
          <p className="text-[10px] mt-1">Inizia il combattimento per vedere la cronologia</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-border-gold/15">
          {log.map((event) => (
            <div
              key={event.id}
              className="py-2.5 hover:bg-gold-dim/5 transition-colors rounded-sm px-1"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-relaxed ${getEventColor(event.type)}`}>
                    {event.message}
                  </p>
                  <p className="text-gold-dim/30 text-[10px] mt-0.5 font-mono">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
