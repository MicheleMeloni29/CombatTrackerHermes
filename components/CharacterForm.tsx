// Form per aggiungere un nuovo personaggio al combattimento
"use client";

import { useState } from "react";
import type { Character } from "../types/character";

interface CharacterFormProps {
  onAdd: (char: Omit<Character, "id" | "currentHp" | "spells">) => void;
}

interface FormErrors {
  name?: string;
  maxHp?: string;
  initiative?: string;
}

export default function CharacterForm({ onAdd }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [initiative, setInitiative] = useState("");
  const [isMonster, setIsMonster] = useState(false);
  // Stato per il pannello collassabile
  const [isOpen, setIsOpen] = useState(true);
  // Stato per gli errori di validazione
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const trimmed = name.trim();
    const parsedMaxHp = parseInt(maxHp);
    const parsedInitiative = parseInt(initiative);

    if (!trimmed) {
      errs.name = "Il nome è obbligatorio";
    }

    if (!maxHp) {
      errs.maxHp = "Gli HP sono obbligatori";
    } else if (Number.isNaN(parsedMaxHp) || parsedMaxHp < 1) {
      errs.maxHp = "Gli HP devono essere almeno 1";
    }

    if (initiative !== "" && (Number.isNaN(parsedInitiative) || parsedInitiative < 0)) {
      errs.initiative = "L'iniziativa deve essere un numero ≥ 0";
    }

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Pulizia errori
    setErrors({});

    const trimmed = name.trim();
    const parsedMaxHp = Math.max(1, parseInt(maxHp) || 0);
    const parsedInitiative = Math.max(0, parseInt(initiative) || 0);

    onAdd({
      name: trimmed,
      maxHp: parsedMaxHp,
      initiative: parsedInitiative,
      isMonster,
    });

    setName("");
    setMaxHp("");
    setInitiative("");
    setIsMonster(false);
  };

  // Rimuove l'errore di un campo specifico quando l'utente inizia a digitare
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="fantasy-card p-4 sm:p-5">
      {/* Pulsante di apertura quando il form è chiuso */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fantasy-btn fantasy-btn-gold w-full py-3 text-base"
        >
          ⚔️ Aggiungi Combattente
        </button>
      )}

      {/* Contenuto collassabile del form */}
      <div
        className={`collapsible-content ${isOpen ? "expanded" : "collapsed"}`}
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Intestazione con titolo medievale e pulsante di chiusura */}
          <div className="flex items-center justify-between">
            <h2 className="font-medieval text-gold text-xl flex items-center gap-2">
              ⚔️ Evoca Combattente
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gold-dim hover:text-gold transition-colors p-1"
              aria-label="Chiudi form"
            >
              {/* Icona chevron su */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Divisore ornamentale */}
          <div className="ornament-divider">
            <span className="ornament-divider-icon">✦</span>
          </div>

          {/* Campo nome */}
          <div>
            <label className="block text-gold-dim text-sm mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Es. Aragorn, Goblin #1..."
              className={`fantasy-input w-full px-3 py-2 ${errors.name ? "fantasy-input-error" : ""}`}
              autoFocus
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Campi HP e Iniziativa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gold-dim text-sm mb-1">
                HP Massimi
              </label>
              <input
                type="number"
                value={maxHp}
                onChange={(e) => {
                  setMaxHp(e.target.value);
                  clearError("maxHp");
                }}
                placeholder="Es. 27"
                min={1}
                className={`fantasy-input w-full px-3 py-2.5 text-base ${errors.maxHp ? "fantasy-input-error" : ""}`}
              />
              {errors.maxHp && <p className="field-error">{errors.maxHp}</p>}
            </div>

            <div>
              <label className="block text-gold-dim text-sm mb-1">
                Iniziativa
              </label>
              <input
                type="number"
                value={initiative}
                onChange={(e) => {
                  setInitiative(e.target.value);
                  clearError("initiative");
                }}
                placeholder="Es. 15"
                min={0}
                max={30}
                className={`fantasy-input w-full px-3 py-2.5 text-base ${errors.initiative ? "fantasy-input-error" : ""}`}
              />
              {errors.initiative && (
                <p className="field-error">{errors.initiative}</p>
              )}
            </div>
          </div>

          {/* Toggle mostro/personaggio */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMonster}
                onChange={(e) => setIsMonster(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700" />
            </label>
            <span className="text-sm">
              {isMonster ? (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  💀 Nemico — MOSTRO
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🛡️ Personaggio Giocante
                </span>
              )}
            </span>
          </div>

          {/* Pulsante di invio */}
          <button
            type="submit"
            className="fantasy-btn fantasy-btn-gold w-full py-3 text-base"
          >
            Aggiungi al Combattimento
          </button>
        </form>
      </div>
    </div>
  );
}
