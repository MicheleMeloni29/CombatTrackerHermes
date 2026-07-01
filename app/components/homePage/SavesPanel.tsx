"use client";

import { CheckCircle2, Clock3, Database, RefreshCcw, Save, ScrollText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCombatState } from "./CombatContext";
import type { SavedCombat } from "@/types/combatSave";

function formatSavedAt(savedAt: number) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(savedAt);
}

function formatSnapshotTime(save: SavedCombat) {
  const totalSeconds = ((save.round - 1) * save.characters.length + save.currentTurnIndex) * 6;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function SavesPanel() {
  const {
    characters,
    savedCombats,
    activeSavedCombatId,
    saveCurrentCombat,
    restoreSavedCombat,
    deleteSavedCombat,
    persistenceError,
    clearPersistenceError,
    isHydrating,
    isSaving,
    isRestoring,
    isAutosaving,
  } = useCombatState();
  const [combatName, setCombatName] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = combatName.trim();

    if (!trimmedName) {
      setError("Inserisci un nome per il combattimento.");
      return;
    }

    const didSave = await saveCurrentCombat(trimmedName);
    if (didSave) {
      setCombatName("");
      setError("");
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 pb-24 lg:pb-6">
      <div className="rounded-3xl border border-border-gold/20 bg-background/45 p-4 shadow-xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/60">
          Persistenza remota
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-medieval text-3xl text-gold">Salvataggi</h1>
          <span className="rounded-full border border-border-gold/20 bg-parchment/60 px-3 py-1 text-xs font-black text-gold-dim">
            {savedCombats.length}/5 slot
          </span>
        </div>
        <p className="mt-2 text-xs text-gold-dim/55">
          {isHydrating
            ? "Caricamento salvataggi remoti..."
            : isAutosaving
              ? "Autosalvataggio remoto in corso."
              : "Salvataggi sincronizzati con il backend Django."}
        </p>
      </div>

      {persistenceError && (
        <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-3">
            <p>{persistenceError}</p>
            <button
              type="button"
              onClick={clearPersistenceError}
              className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-red-100/80"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-border-gold/20 bg-parchment/50 p-4 shadow-xl shadow-black/20"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <Save size={21} />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Crea salvataggio</h2>
            <p className="mt-1 text-sm leading-relaxed text-gold-dim/60">
              Dopo il primo salvataggio, l&apos;autosave aggiorna lo stesso slot ogni minuto.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={combatName}
            onChange={(event) => {
              setCombatName(event.target.value);
              if (error) setError("");
              if (persistenceError) clearPersistenceError();
            }}
            placeholder="Assalto alla Cripta"
            maxLength={60}
            disabled={characters.length === 0 || isSaving}
            className={`fantasy-input min-h-12 px-3 text-sm ${error ? "fantasy-input-error" : ""}`}
          />
          <button
            type="submit"
            disabled={characters.length === 0 || isSaving}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-sm font-black text-background transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save size={17} />
            {isSaving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
        {characters.length === 0 && (
          <p className="mt-2 text-xs text-gold-dim/45">
            Aggiungi almeno un combattente prima di salvare.
          </p>
        )}
      </form>

      {savedCombats.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-gold/25 bg-parchment/35 p-8 text-center">
          <Database className="mx-auto mb-3 text-gold-dim/45" size={34} />
          <h2 className="font-medieval text-2xl text-gold">Nessun salvataggio</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gold-dim/55">
            Quando crei il primo save, snapshot, turni e cronologia vengono sincronizzati col backend.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCombats.map((save) => {
            const isActive = activeSavedCombatId === save.id;

            return (
              <article
                key={save.id}
                className="rounded-3xl border border-border-gold/20 bg-parchment/50 p-4 shadow-xl shadow-black/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-black text-gold-bright">{save.name}</h2>
                      {isActive && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                          <CheckCircle2 size={12} />
                          Autosave
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-gold-dim/55">
                      <span className="flex items-center gap-1">
                        <Clock3 size={13} />
                        {formatSavedAt(save.savedAt)}
                      </span>
                      <span>Round {save.round}</span>
                      <span>{save.characters.length} personaggi</span>
                      <span>{formatSnapshotTime(save)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void restoreSavedCombat(save.id)}
                    disabled={isRestoring}
                    className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 px-3 text-sm font-black text-gold transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <RefreshCcw size={16} />
                    <span className="hidden sm:inline">{isRestoring ? "Ripristino..." : "Ripristina"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteSavedCombat(save.id)}
                    className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-500/25 px-3 text-sm font-black text-red-200 transition hover:border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Elimina</span>
                  </button>
                </div>

                {save.log.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-border-gold/10 bg-background/35 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-gold-dim/50">
                      <ScrollText size={13} />
                      Ultimi eventi
                    </p>
                    <div className="space-y-1.5">
                      {save.log.slice(-3).reverse().map((event) => (
                        <p key={event.id} className="truncate text-xs text-gold-dim/65">
                          {event.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
