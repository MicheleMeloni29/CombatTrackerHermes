"use client";

import { Check, ChevronDown, Shield, Skull, Swords, X } from "lucide-react";
import { useState } from "react";
import type { Character } from "@/types/character";

interface CharacterFormProps {
  onAdd: (char: Omit<Character, "id" | "currentHp" | "spells" | "memorizedSpells">) => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  maxHp?: string;
  initiative?: string;
}

const ICON_OPTIONS = [
  "\u2694\uFE0F", "\uD83D\uDDE1\uFE0F", "\uD83C\uDFF9", "\uD83D\uDEE1\uFE0F", "\uD83D\uDD2E", "\u2728",
  "\uD83D\uDD25", "\u2744\uFE0F", "\u26A1\uFE0F", "\uD83C\uDF3F", "\uD83D\uDCAB", "\uD83C\uDF1F",
  "\uD83D\uDC80", "\uD83D\uDC09", "\uD83E\uDD81", "\uD83E\uDD85", "\uD83D\uDC3A", "\uD83E\uDD87",
  "\uD83D\uDC0D", "\uD83D\uDD77\uFE0F", "\uD83D\uDC79", "\uD83E\uDDD9", "\uD83E\uDDDB", "\uD83E\uDDB8",
  "\uD83D\uDC51", "\uD83D\uDC8E", "\uD83C\uDFAF", "\uD83D\uDCFF", "\uD83D\uDCDC", "\u2697\uFE0F",
  "\u2620\uFE0F", "\uD83E\uDDB4", "\u26D3\uFE0F", "\uD83D\uDD30", "\u269C\uFE0F",
];

export default function CharacterForm({ onAdd, onCancel }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [initiative, setInitiative] = useState("");
  const [isMonster, setIsMonster] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedIcon, setSelectedIcon] = useState("\u2694\uFE0F");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const parsedMaxHp = parseInt(maxHp);
    const parsedInitiative = parseInt(initiative);

    if (!name.trim()) nextErrors.name = "Il nome e' obbligatorio";
    if (!maxHp) nextErrors.maxHp = "Gli HP sono obbligatori";
    else if (Number.isNaN(parsedMaxHp) || parsedMaxHp < 1) {
      nextErrors.maxHp = "Gli HP devono essere almeno 1";
    }
    if (initiative !== "" && (Number.isNaN(parsedInitiative) || parsedInitiative < 0)) {
      nextErrors.initiative = "L'iniziativa deve essere un numero >= 0";
    }

    return nextErrors;
  };

  const clearError = (field: keyof FormErrors) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setMaxHp("");
    setInitiative("");
    setIsMonster(false);
    setSelectedIcon("\u2694\uFE0F");
    setShowIconPicker(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border-gold/20 bg-parchment/55 p-3 shadow-lg shadow-black/20 sm:p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dim/65">
            Nuovo combattente
          </p>
          <h2 className="mt-1 font-medieval text-xl text-gold">Prepara la scheda</h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gold/20 text-gold-dim transition hover:border-border-gold hover:text-gold"
            aria-label="Chiudi form"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-gold-dim" htmlFor="character-name">
            Nome
          </label>
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowIconPicker((value) => !value)}
                className="flex h-11 w-12 items-center justify-center rounded-xl border border-border-gold/30 bg-background/70 text-xl text-foreground transition hover:border-gold/60"
                aria-label="Scegli icona"
              >
                <span>{selectedIcon}</span>
                <ChevronDown className="absolute bottom-1 right-1 text-gold-dim/60" size={12} />
              </button>
              {showIconPicker && (
                <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-2xl border border-border-gold/30 bg-background/95 p-2 shadow-2xl shadow-black/50 backdrop-blur">
                  <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(icon);
                          setShowIconPicker(false);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition ${
                          selectedIcon === icon
                            ? "border-gold/70 bg-gold/15"
                            : "border-transparent hover:bg-gold/10"
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
              id="character-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              placeholder="Aragorn, Goblin #1..."
              className={`fantasy-input min-h-11 w-full px-3 text-sm ${errors.name ? "fantasy-input-error" : ""}`}
            />
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gold-dim" htmlFor="character-hp">
              HP massimi
            </label>
            <input
              id="character-hp"
              type="number"
              value={maxHp}
              onChange={(event) => {
                setMaxHp(event.target.value);
                clearError("maxHp");
              }}
              placeholder="27"
              min={1}
              className={`fantasy-input min-h-11 w-full px-3 text-sm ${errors.maxHp ? "fantasy-input-error" : ""}`}
            />
            {errors.maxHp && <p className="field-error">{errors.maxHp}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gold-dim" htmlFor="character-initiative">
              Iniziativa
            </label>
            <input
              id="character-initiative"
              type="number"
              value={initiative}
              onChange={(event) => {
                setInitiative(event.target.value);
                clearError("initiative");
              }}
              placeholder="15"
              min={0}
              className={`fantasy-input min-h-11 w-full px-3 text-sm ${errors.initiative ? "fantasy-input-error" : ""}`}
            />
            {errors.initiative && <p className="field-error">{errors.initiative}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-background/45 p-1">
          <button
            type="button"
            onClick={() => setIsMonster(false)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
              !isMonster ? "bg-emerald-500/15 text-emerald-300" : "text-gold-dim/60 hover:text-gold"
            }`}
            aria-pressed={!isMonster}
          >
            <Shield size={17} />
            PG
          </button>
          <button
            type="button"
            onClick={() => setIsMonster(true)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
              isMonster ? "bg-red-500/15 text-red-300" : "text-gold-dim/60 hover:text-gold"
            }`}
            aria-pressed={isMonster}
          >
            <Skull size={17} />
            Mostro
          </button>
        </div>

        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-black uppercase tracking-[0.16em] text-background transition hover:bg-gold-bright"
        >
          <Swords size={17} />
          Aggiungi
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}
