"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";
import { useCombatState } from "./CombatContext";

interface SaveCombatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveCombatDialog({ isOpen, onClose }: SaveCombatDialogProps) {
  const {
    characters,
    saveCurrentCombat,
    activeSavedCombatId,
    persistenceError,
    clearPersistenceError,
    isSaving,
  } = useCombatState();
  const [combatName, setCombatName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setCombatName("");
    setError("");
    clearPersistenceError();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = combatName.trim();

    if (!trimmedName) {
      setError("Inserisci un nome per il combattimento.");
      return;
    }

    const didSave = await saveCurrentCombat(trimmedName);
    if (didSave) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/65 px-3 pb-6 backdrop-blur-sm sm:items-center sm:pb-0">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Chiudi salvataggio"
        onClick={handleClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-3xl border border-border-gold/25 bg-background p-4 shadow-2xl shadow-black/70"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dim/60">
              Salvataggio remoto
            </p>
            <h2 className="mt-1 font-medieval text-xl text-gold">Salva combattimento</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gold/20 text-gold-dim"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gold-dim/65">
          {activeSavedCombatId
            ? "Crea un nuovo slot e sposta l'autosave su quel nome."
            : "Dai un nome allo snapshot corrente. Potrai ripristinarlo dalla tab Salvataggi."}
        </p>

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
          disabled={characters.length === 0}
          autoFocus
          className={`fantasy-input min-h-12 w-full px-3 text-sm ${error ? "fantasy-input-error" : ""}`}
        />
        {error && <p className="field-error">{error}</p>}
        {!error && persistenceError && <p className="field-error">{persistenceError}</p>}
        {characters.length === 0 && (
          <p className="mt-2 text-xs text-gold-dim/45">
            Aggiungi almeno un combattente prima di salvare.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-12 rounded-xl border border-border-gold/25 px-3 text-sm font-black text-gold-dim transition hover:border-border-gold"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={characters.length === 0 || isSaving}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-3 text-sm font-black text-background transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save size={17} />
            {isSaving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}
