"use client";

import { useState } from "react";
import { useCombatState } from "@/components/CombatContext";
import { useSessionAuth } from "@/components/SessionLoginGate";

export default function SessionToolbar() {
  const { logout } = useSessionAuth();
  const { characters, saveCurrentCombat, activeSavedCombatId } = useCombatState();
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [combatName, setCombatName] = useState("");
  const [error, setError] = useState("");

  const handleOpenSave = () => {
    if (characters.length === 0) return;
    setCombatName("");
    setError("");
    setIsSaveOpen(true);
  };

  const handleCloseSave = () => {
    setIsSaveOpen(false);
    setCombatName("");
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = combatName.trim();
    if (!trimmedName) {
      setError("Inserisci un nome per il combattimento.");
      return;
    }

    saveCurrentCombat(trimmedName);
    handleCloseSave();
  };

  return (
    <>
      {isSaveOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/45 px-4 py-20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border-gold bg-background/95 p-4 shadow-2xl shadow-black/60">
            <div className="mb-4">
              <h2 className="font-medieval text-lg text-gold">Salva combattimento</h2>
              <p className="mt-1 text-xs leading-relaxed text-gold-dim/60">
                Dai un nome a questo salvataggio. Se lo attivi, l&apos;autosalvataggio al minuto
                aggiornera&apos; sempre questo slot.
              </p>
            </div>

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
                  }}
                  className="fantasy-input w-full px-3 py-2.5 text-sm"
                  placeholder="Assalto alla Cripta"
                  maxLength={60}
                  autoFocus
                />
              </div>

              {error && <p className="field-error">{error}</p>}

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
                  className="flex-1 rounded-md border border-gold/50 bg-gold/20 px-3 py-2 text-xs font-bold text-gold transition-colors hover:border-gold hover:bg-gold/30"
                >
                  Salva
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
          onClick={logout}
          className="dd-btn dd-btn-sm sm:dd-btn"
        >
          Disconnetti
        </button>
      </div>
    </>
  );
}
