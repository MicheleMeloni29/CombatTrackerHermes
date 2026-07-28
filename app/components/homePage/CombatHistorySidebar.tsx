"use client";

import { useCombatLog, useCombatState } from "./CombatContext";
import type { SavedCombat } from "@/types/combatSave";
import type { CombatLogEvent } from "@/types/combatLog";

function getEventIcon(type: CombatLogEvent["type"]): string {
  switch (type) {
    case "damage":
      return "Hit";
    case "heal":
      return "Heal";
    case "character_added":
      return "Add";
    case "character_deleted":
      return "Del";
    case "combat_started":
      return "Start";
    case "combat_reset":
      return "Reset";
    case "turn_changed":
      return "Turn";
    case "round_changed":
      return "Rnd";
    case "spell_cast":
      return "Cast";
    case "spell_expired":
      return "End";
    default:
      return "Log";
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
      return "text-gold-dim/50";
    case "combat_started":
      return "text-gold";
    case "combat_reset":
      return "text-orange-400";
    case "turn_changed":
      return "text-violet-400";
    case "round_changed":
      return "text-amber-300";
    case "spell_cast":
      return "text-purple-400";
    case "spell_expired":
      return "text-gold-dim/40";
    default:
      return "text-gold-dim/60";
  }
}

function formatTimestamp(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatSavedAt(savedAt: number) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(savedAt);
}

function getSavedCombatTitle(save: SavedCombat) {
  return save.name;
}

function EventList({ events }: { events: CombatLogEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-[11px] text-gold-dim/40">
        Nessun evento registrato in questo salvataggio.
      </p>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border-gold/15">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-sm px-1 py-2.5 transition-colors hover:bg-gold-dim/5"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 min-w-8 flex-shrink-0 text-[10px] font-bold uppercase text-gold-dim/50">
              {getEventIcon(event.type)}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs leading-relaxed ${getEventColor(event.type)}`}>
                {event.message}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-gold-dim/30">
                {formatTimestamp(event.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CombatHistorySidebar() {
  const { log } = useCombatLog();
  const {
    savedCombats,
    restoreSavedCombat,
    activeSavedCombatId,
    isRestoring,
    persistenceError,
    clearPersistenceError,
  } = useCombatState();

  return (
    <div className="space-y-6 p-4">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medieval text-base tracking-wide text-gold">Cronologia</h2>
          <span className="font-mono text-xs text-gold-dim/35">
            {savedCombats.length} salvataggi
          </span>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medieval text-sm uppercase tracking-[0.2em] text-gold-dim/80">
            Combattimenti salvati
          </h3>
        </div>

        {persistenceError && (
          <div className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
            <div className="flex items-center justify-between gap-3">
              <span>{persistenceError}</span>
              <button
                type="button"
                onClick={clearPersistenceError}
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-red-100/80"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}

        {savedCombats.length === 0 ? (
          <div className="rounded-lg border border-border-gold/15 bg-parchment/30 px-3 py-4 text-[11px] text-gold-dim/45">
            Usa il tasto Salva combattimento per creare fino a 5 salvataggi. Dopo il primo
            salvataggio, il combattimento corrente si aggiornera&apos; automaticamente ogni minuto
            sullo stesso slot.
          </div>
        ) : (
          <div className="space-y-3">
            {savedCombats.map((save) => (
              <details
                key={save.id}
                className="overflow-hidden rounded-lg border border-border-gold/20 bg-parchment/30"
              >
                <summary className="cursor-pointer list-none px-3 py-3 marker:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void restoreSavedCombat(save.id);
                          }}
                          className="truncate text-left text-sm font-bold text-gold-bright transition-colors hover:text-gold"
                        >
                          {getSavedCombatTitle(save)}
                        </button>
                        {activeSavedCombatId === save.id && (
                          <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Autosave
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-gold-dim/50">
                        Salvato il {formatSavedAt(save.savedAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-gold-dim/55">
                      <p>Round {save.round}</p>
                      <p>{save.characters.length} personaggi</p>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-border-gold/15 px-3 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-gold-dim/55">
                      Turno {save.currentTurnIndex + 1} / {save.characters.length} · Tempo{" "}
                      {formatTimestamp(
                        ((save.round - 1) * save.characters.length + save.currentTurnIndex) * 6
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => void restoreSavedCombat(save.id)}
                      disabled={isRestoring}
                      className="rounded-md border border-gold/35 px-2.5 py-1.5 text-[11px] font-bold text-gold transition-colors hover:border-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isRestoring ? "Ripristino..." : "Ripristina"}
                    </button>
                  </div>
                  <EventList events={save.log} />
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border-gold/20 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medieval text-sm uppercase tracking-[0.2em] text-gold-dim/80">
            Combattimento corrente
          </h3>
          {log.length > 0 && (
            <span className="font-mono text-xs text-gold-dim/40">{log.length} eventi</span>
          )}
        </div>

        {log.length === 0 ? (
          <div className="py-8 text-center text-gold-dim/30">
            <p className="text-xs">Nessun evento registrato</p>
            <p className="mt-1 text-[10px]">Inizia il combattimento per vedere la cronologia</p>
          </div>
        ) : (
          <EventList events={log} />
        )}
      </section>
    </div>
  );
}
