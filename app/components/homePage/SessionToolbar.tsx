"use client";

import { useState } from "react";
import { useCombatState } from "./CombatContext";
import { useSessionAuth } from "@/app/components/loginPage/SessionAuthProvider";

export default function SessionToolbar() {
  const { logout } = useSessionAuth();
  const {
    characters,
    savedCombats,
    saveCurrentCombat,
    activeSavedCombatId,
    persistenceError,
    clearPersistenceError,
    isSaving,
  } = useCombatState();
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [combatName, setCombatName] = useState("");
  const [error, setError] = useState("");
  const activeSave = savedCombats.find((save) => save.id === activeSavedCombatId) ?? null;

  const handleOpenSave = () => {
    if (characters.length === 0) return;
    setCombatName("");
    setError("");
    clearPersistenceError();
    setIsSaveOpen(true);
  };

  const handleCloseSave = () => {
    setIsSaveOpen(false);
    setCombatName("");
    setError("");
    clearPersistenceError();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = combatName.trim();
    if (!trimmedName) {
      setError("Inserisci un nome per il combattimento.");
      return;
    }

    const didSave = await saveCurrentCombat(trimmedName);
    if (didSave) {
      handleCloseSave();
    }
  };

  const handleOverwrite = async () => {
    if (!activeSave) return;

    const didSave = await saveCurrentCombat(activeSave.name, {
      overwriteId: activeSave.id,
    });

    if (didSave) {
      handleCloseSave();
    }
  };

  return (
    <>
      {isSaveOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/45 px-4 py-20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border-gold bg-background/95 p-4 shadow-2xl shadow-black/60">
            <div className="mb-4">
              <h2 className="font-medieval text-lg text-gold">Salva combattimento</h2>
              <p className="mt-1 text-xs leading-relaxed text-gold-dim/60">
                Crea un nuovo salvataggio oppure aggiorna quello attivo.
              </p>
            </div>

            {activeSave && (
              <div className="mb-3 rounded-xl border border-border-gold/20 bg-parchment/35 p-3 text-xs text-gold-dim/70">
                Salvataggio attivo: <span className="font-black text-gold">{activeSave.name}</span>
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gold" htmlFor="combat-save-name">
                  Nome combattimento
                </label>
                <input
                  id="combat-save-name"
                  type="text"
                  value={combatName}
                  onChange={(event) => {
                    setCombatName(event.target.value);
                    if (error) setError("");
                    if (persistenceError) clearPersistenceError();
                  }}
                  className="fantasy-input w-full px-3 py-2.5 text-sm"
                  placeholder="Assalto alla Cripta"
                  maxLength={60}
                  autoFocus
                />
              </div>

              {error && <p className="field-error">{error}</p>}
              {!error && persistenceError && <p className="field-error">{persistenceError}</p>}

              {activeSave && (
                <button
                  type="button"
                  onClick={() => void handleOverwrite()}
                  disabled={isSaving}
                  className="w-full rounded-md border border-gold/40 bg-parchment/45 px-3 py-2 text-xs font-bold text-gold transition-colors hover:border-gold hover:bg-parchment/60 disabled:opacity-45"
                >
                  {isSaving ? "Salvataggio..." : `Sovrascrivi "${activeSave.name}"`}
                </button>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseSave}
                  className="flex-1 rounded-md border border-border-gold/50 px-3 py-2 text-xs font-bold text-stone-300 transition-colors hover:border-border-gold-strong hover:bg-parchment"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-md border border-gold/50 bg-gold/20 px-3 py-2 text-xs font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30"
                >
                  {isSaving ? "Salvataggio..." : "Salva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={handleOpenSave}
          disabled={characters.length === 0}
          className="dd-btn dd-btn-sm sm:dd-btn disabled:opacity-60"
          title={
            activeSavedCombatId
              ? "Crea un nuovo salvataggio nominato e sposta l'autosalvataggio su quello slot"
              : "Crea un nuovo salvataggio nominato del combattimento corrente"
          }
        >
          Salva combattimento
        </button>
        <button
          type="button"
          onClick={() => {
            void logout().catch(() => { });
          }}
          className="dd-btn dd-btn-sm sm:dd-btn"
        >
          Disconnetti
        </button>
      </div>
    </>
  );
}
