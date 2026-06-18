"use client";

import {
  HeartPulse,
  ListRestart,
  PlusCircle,
  RotateCcw,
  ScrollText,
  ShieldX,
  Sparkles,
  Swords,
  TimerReset,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCombatLog } from "./CombatContext";
import type { CombatLogEvent } from "@/types/combatLog";

interface EventMeta {
  Icon: LucideIcon;
  color: string;
  label: string;
}

function getEventMeta(type: CombatLogEvent["type"]): EventMeta {
  switch (type) {
    case "damage":
      return { Icon: ShieldX, color: "text-red-300", label: "Danno" };
    case "heal":
      return { Icon: HeartPulse, color: "text-emerald-300", label: "Cura" };
    case "character_added":
      return { Icon: PlusCircle, color: "text-sky-300", label: "Add" };
    case "character_deleted":
      return { Icon: Trash2, color: "text-stone-300", label: "Del" };
    case "combat_started":
      return { Icon: Swords, color: "text-gold", label: "Start" };
    case "combat_reset":
      return { Icon: RotateCcw, color: "text-orange-300", label: "Reset" };
    case "turn_changed":
      return { Icon: TimerReset, color: "text-violet-300", label: "Turno" };
    case "round_changed":
      return { Icon: ListRestart, color: "text-amber-300", label: "Round" };
    case "spell_cast":
      return { Icon: Sparkles, color: "text-purple-300", label: "Spell" };
    case "spell_expired":
      return { Icon: Sparkles, color: "text-gold-dim/50", label: "Fine" };
    default:
      return { Icon: ScrollText, color: "text-gold-dim", label: "Log" };
  }
}

function formatTimestamp(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function CombatTimeline() {
  const { log } = useCombatLog();
  const orderedEvents = [...log].reverse();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 pb-24 lg:pb-6">
      <div className="rounded-3xl border border-border-gold/20 bg-background/45 p-4 shadow-xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/60">
          Diario sessione
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-medieval text-3xl text-gold">Cronologia</h1>
          <span className="rounded-full border border-border-gold/20 bg-parchment/60 px-3 py-1 text-xs font-black text-gold-dim">
            {log.length} eventi
          </span>
        </div>
      </div>

      {orderedEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-gold/25 bg-parchment/35 p-8 text-center">
          <ScrollText className="mx-auto mb-3 text-gold-dim/45" size={34} />
          <h2 className="font-medieval text-2xl text-gold">Nessun evento</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gold-dim/55">
            La cronologia si popola quando inizi il combattimento o modifichi HP e incantesimi.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orderedEvents.map((event) => {
            const { Icon, color, label } = getEventMeta(event.type);
            return (
              <article
                key={event.id}
                className="rounded-2xl border border-border-gold/15 bg-parchment/50 p-3 shadow-lg shadow-black/15"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/55 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dim/50">
                        {label}
                      </span>
                      <time className="font-mono text-xs font-bold text-gold-dim/45">
                        {formatTimestamp(event.timestamp)}
                      </time>
                    </div>
                    <p className={`mt-1 text-sm leading-relaxed ${color}`}>{event.message}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
