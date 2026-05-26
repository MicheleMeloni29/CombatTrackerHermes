// Cronologia degli eventi di combattimento, mostrata in una sidebar a destra su desktop o in un bottom sheet su mobile. Scorre automaticamente verso il basso quando arrivano nuovi eventi.
"use client";

import { useEffect, useRef } from "react";
import type { CombatLogEvent } from "../types/combatLog";

interface CombatHistoryProps {
  events: CombatLogEvent[];
  isOpen: boolean;
  onClose: () => void;
}

function formatTimestamp(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getEventIcon(type: CombatLogEvent["type"]): string {
  switch (type) {
    case "damage":
      return "⚔️";
    case "heal":
      return "💚";
    case "character_added":
      return "➕";
    case "character_deleted":
      return "➖";
    case "combat_started":
      return "⚡";
    case "combat_reset":
      return "🔄";
    case "turn_changed":
      return "👉";
    case "round_changed":
      return "🔁";
    case "spell_cast":
      return "✨";
    case "spell_expired":
      return "⌛";
    default:
      return "📝";
  }
}

function getEventColor(type: CombatLogEvent["type"]): string {
  switch (type) {
    case "damage":
      return "text-red-400";
    case "heal":
      return "text-emerald-400";
    case "character_added":
      return "text-sky-400";
    case "character_deleted":
      return "text-stone-400";
    case "combat_started":
      return "text-amber-400";
    case "combat_reset":
      return "text-orange-400";
    case "turn_changed":
      return "text-violet-400";
    case "round_changed":
      return "text-amber-300";
    case "spell_cast":
      return "text-purple-400";
    case "spell_expired":
      return "text-stone-500";
    default:
      return "text-stone-300";
  }
}

export default function CombatHistory({
  events,
  isOpen,
  onClose,
}: CombatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile: overlay backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Panel: mobile = bottom sheet / desktop = right sidebar */}
      <div
        className={`
          fixed z-50
          lg:static lg:z-auto
          bg-stone-900 border-amber-900/50
          flex flex-col

          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0
          max-h-[70vh]
          rounded-t-xl border-t
          lg:rounded-t-none

          /* Desktop: right sidebar */
          lg:bottom-auto lg:left-auto lg:right-auto
          lg:w-80 lg:max-h-none lg:h-auto lg:sticky lg:top-4
          lg:rounded-lg lg:border
          lg:flex-shrink-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700 lg:rounded-t-lg flex-shrink-0">
          <h2 className="text-amber-400 font-bold text-sm tracking-wide uppercase">
            Cronologia
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 transition-colors text-lg leading-none px-1"
            aria-label="Chiudi cronologia"
          >
            ✕
          </button>
        </div>

        {/* Events list */}
        <div
          ref={scrollRef}
          className="overflow-y-auto flex-1 min-h-0 overscroll-contain"
        >
          {events.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">
              <p className="text-2xl mb-2">📜</p>
              <p>Nessun evento registrato</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-4 py-2.5 hover:bg-stone-800/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs leading-relaxed ${getEventColor(event.type)}`}
                      >
                        {event.message}
                      </p>
                      <p className="text-stone-600 text-[10px] mt-0.5 font-mono">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
