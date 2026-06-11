// Questo componente è un form per aggiungere nuovi combattenti al combattimento. Permette di inserire nome, HP massimi, iniziativa, scegliere se è un mostro o un personaggio giocante, e selezionare un'icona rappresentativa. Il form include validazione e mostra errori specifici per ogni campo. Inoltre, è possibile espandere o chiudere il form per una migliore esperienza utente durante il combattimento.

"use client";

import { useState } from "react";
import type { Character } from "@/types/character";

interface CharacterFormProps {
  onAdd: (char: Omit<Character, "id" | "currentHp" | "spells">) => void;
}

interface FormErrors {
  name?: string;
  maxHp?: string;
  initiative?: string;
}

const ICON_OPTIONS = [
  "\u2694\uFE0F", "\uD83D\uDDE1\uFE0F", "\uD83C\uDFF9", "\uD83D\uDEE1\uFE0F", "\uD83D\uDD2E", "\u2728", "\uD83D\uDD2B",
  "\uD83D\uDD25", "\u2744\uFE0F", "\u26A1\uFE0F", "\uD83C\uDF3F", "\uD83D\uDCAB", "\uD83C\uDF1F", "\u2604\uFE0F",
  "\uD83D\uDC80", "\uD83D\uDC09", "\uD83E\uDD81", "\uD83E\uDD85", "\uD83D\uDC3A", "\uD83E\uDD87",
  "\uD83D\uDC0D", "\uD83D\uDD77\uFE0F", "\uD83D\uDC79", "\uD83E\uDD7F", "\uD83E\uDDD9", "\uD83E\uDDDB",
  "\uD83E\uDDB8", "\uD83E\uDDC2", "\uD83E\uDDB1", "\uD83E\uDDC4", "\uD83E\uDD16", "\uD83D\uDC7B",
  "\uD83D\uDE08",
  "\uD83D\uDC51", "\uD83D\uDC8E", "\uD83C\uDFAF", "\uD83D\uDCFF", "\uD83D\uDD6F\uFE0F", "\uD83D\uDCDC",
  "\uD83E\uDDEA", "\uD83D\uDDDD\uFE0F", "\u2697\uFE0F",
  "\u2620\uFE0F", "\uD83E\uDDB4", "\uD83E\uDE78", "\u26D3\uFE0F", "\u2625", "\uD83D\uDD30", "\u269C\uFE0F",
];

export default function CharacterForm({ onAdd }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [initiative, setInitiative] = useState("");
  const [isMonster, setIsMonster] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedIcon, setSelectedIcon] = useState("\u2694\uFE0F");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const trimmed = name.trim();
    const parsedMaxHp = parseInt(maxHp);
    const parsedInitiative = parseInt(initiative);

    if (!trimmed) errs.name = "Il nome è obbligatorio";
    if (!maxHp) errs.maxHp = "Gli HP sono obbligatori";
    else if (Number.isNaN(parsedMaxHp) || parsedMaxHp < 1) errs.maxHp = "Gli HP devono essere almeno 1";
    if (initiative !== "" && (Number.isNaN(parsedInitiative) || parsedInitiative < 0))
      errs.initiative = "L'iniziativa deve essere un numero >= 0";

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    onAdd({
      name: name.trim(),
      maxHp: Math.max(1, parseInt(maxHp) || 0),
      initiative: Math.max(0, parseInt(initiative) || 0),
      isMonster,
      icon: selectedIcon,
    });

    setName("");
    setMaxHp("");
    setInitiative("");
    setIsMonster(false);
    setSelectedIcon("\u2694\uFE0F");
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="dd-card p-3 sm:p-4">
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)} className="dd-btn w-full py-2 text-xs sm:text-sm">
          {'\u2694\uFE0F'} Aggiungi Combattente
        </button>
      )}

      <div className={`collapsible-content ${isOpen ? "expanded" : "collapsed"}`}>
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medieval text-gold text-lg sm:text-xl flex items-center gap-2">{'\u2694\uFE0F'} Evoca Combattente</h2>
            <button type="button" onClick={() => setIsOpen(false)} className="text-gold-dim hover:text-gold transition-colors p-1" aria-label="Chiudi form">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="dd-divider my-2" />

          <div>
            <label className="block text-gold-dim text-xs mb-1">Nome</label>
            <div className="flex gap-1.5 sm:gap-2">
              <div className="flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker((v) => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-md bg-background/60 border border-gold-dim/30 text-lg hover:border-gold/50 transition-colors"
                >
                  {selectedIcon}
                </button>
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-background/95 border border-gold-dim/30 rounded-lg p-2 shadow-xl backdrop-blur-sm">
                    <div className="grid grid-cols-6 gap-1 w-52 max-h-44 overflow-y-auto">
                      {ICON_OPTIONS.map((icon, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }}
                          className={`w-7 h-7 flex items-center justify-center rounded text-base hover:bg-gold/20 transition-colors ${
                            selectedIcon === icon ? "bg-gold/20 border border-gold/40" : "border border-transparent"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
                placeholder="Es. Aragorn, Goblin #1..."
                className={`fantasy-input w-full px-2 py-1.5 text-xs sm:text-sm ${errors.name ? "fantasy-input-error" : ""}`}
                autoFocus
              />
            </div>
            {errors.name && <p className="field-error mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-gold-dim text-xs mb-1">HP Massimi</label>
              <input type="number" value={maxHp} onChange={(e) => { setMaxHp(e.target.value); clearError("maxHp"); }} placeholder="Es. 27" min={1}
                className={`fantasy-input w-full px-2 py-1.5 text-xs sm:text-sm ${errors.maxHp ? "fantasy-input-error" : ""}`} />
              {errors.maxHp && <p className="field-error mt-1">{errors.maxHp}</p>}
            </div>
            <div>
              <label className="block text-gold-dim text-xs mb-1">Iniziativa</label>
              <input type="number" value={initiative} onChange={(e) => { setInitiative(e.target.value); clearError("initiative"); }} placeholder="Es. 15" min={0} max={30}
                className={`fantasy-input w-full px-2 py-1.5 text-xs sm:text-sm ${errors.initiative ? "fantasy-input-error" : ""}`} />
              {errors.initiative && <p className="field-error mt-1">{errors.initiative}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isMonster} onChange={(e) => setIsMonster(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-stone-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-700" />
            </label>
            <span className="text-xs">
              {isMonster ? (
                <span className="text-red-400 font-bold flex items-center gap-1">{'\uD83D\uDC80'} Nemico — MOSTRO</span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">{'\uD83D\uDEE1\uFE0F'} PG</span>
              )}
            </span>
          </div>

          <button type="submit" className="dd-btn w-full py-2 text-xs sm:text-sm">Aggiungi al Combattimento</button>
        </form>
      </div>
    </div>
  );
}
