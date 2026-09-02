"use client";

import {
  BookMarked,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Search,
  Shield,
  Skull,
  Swords,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CharacterInput, MemorizedSpell } from "@/types/character";
import type { SavedCharacter } from "@/types/savedCharacter";
import { useCombatState } from "./CombatContext";

interface CharacterFormProps {
  onAdd: (char: CharacterInput) => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  maxHp?: string;
  initiative?: string;
}

const ICON_OPTIONS = [
  "⚔️", "🗡️", "🏹", "🛡️", "🔮", "✨",
  "🔥", "❄️", "⚡️", "🌿", "💫", "🌟",
  "💀", "🐉", "🦁", "🦅", "🐺", "🦇",
  "🐍", "🕷️", "👹", "🧙", "🧝", "🦸",
  "👑", "💎", "🎯", "📿", "📜", "⚗️",
  "☠️", "🦴", "⛓️", "🔰", "⚜️",
];

export default function CharacterForm({ onAdd, onCancel }: CharacterFormProps) {
  const {
    savedCharacters,
    updateSavedCharacter,
    deleteSavedCharacter,
    isCharacterLibraryLoading,
  } = useCombatState();
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [initiative, setInitiative] = useState("");
  const [isMonster, setIsMonster] = useState(false);
  const [memorizedSpells, setMemorizedSpells] = useState<MemorizedSpell[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedIcon, setSelectedIcon] = useState("⚔️");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);
  const [editingHp, setEditingHp] = useState("");
  const [editingInitiative, setEditingInitiative] = useState("");
  const [editingError, setEditingError] = useState("");
  const [isUpdatingSaved, setIsUpdatingSaved] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  const filteredSavedCharacters = useMemo(() => {
    const query = savedSearchQuery.trim().toLowerCase();
    if (!query) return savedCharacters;
    return savedCharacters.filter((char) =>
      char.name.toLowerCase().includes(query)
    );
  }, [savedCharacters, savedSearchQuery]);

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
    setMemorizedSpells([]);
    setSelectedIcon("⚔️");
    setShowIconPicker(false);
    setErrors({});
  };

  const preloadSavedCharacter = (character: SavedCharacter) => {
    setName(character.name);
    setMaxHp(String(character.maxHp));
    setInitiative(character.initiative > 0 ? String(character.initiative) : "");
    setIsMonster(character.isMonster);
    setMemorizedSpells(character.memorizedSpells);
    setSelectedIcon(character.icon);
    setShowIconPicker(false);
    setErrors({});
  };

  const startEditingSavedCharacter = (character: SavedCharacter) => {
    setEditingSavedId(character.id);
    setEditingHp(String(character.maxHp));
    setEditingInitiative(String(character.initiative));
    setEditingError("");
  };

  const cancelEditingSavedCharacter = () => {
    setEditingSavedId(null);
    setEditingHp("");
    setEditingInitiative("");
    setEditingError("");
  };

  const handleSaveEditedCharacter = async (id: string) => {
    const parsedHp = parseInt(editingHp);
    const parsedInit = parseInt(editingInitiative);

    if (!editingHp.trim() || Number.isNaN(parsedHp) || parsedHp < 1) {
      setEditingError("Gli HP devono essere almeno 1");
      return;
    }
    if (editingInitiative.trim() !== "" && (Number.isNaN(parsedInit) || parsedInit < 0)) {
      setEditingError("L'iniziativa deve essere un numero >= 0");
      return;
    }

    setIsUpdatingSaved(true);
    setEditingError("");
    const success = await updateSavedCharacter(id, {
      maxHp: parsedHp,
      initiative: Number.isNaN(parsedInit) ? 0 : Math.max(0, parsedInit),
    });
    setIsUpdatingSaved(false);
    if (success) {
      setEditingSavedId(null);
    }
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
      memorizedSpells,
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

      {(isCharacterLibraryLoading || savedCharacters.length > 0) && (
        <section className="mb-4 rounded-2xl border border-border-gold/20 bg-background/35 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-gold-dim/70">
              <BookMarked size={15} />
              Personaggi salvati
            </p>
            <span className="text-[11px] font-bold text-gold-dim/45">
              Compila la scheda
            </span>
          </div>

          <p className="mb-2 text-[11px] font-bold text-gold-dim/50">
            Riempie la scheda con nome, icona, HP e iniziativa salvata.
          </p>

          {isCharacterLibraryLoading ? (
            <p className="py-2 text-xs text-gold-dim/50">
              Caricamento raccolta...
            </p>
          ) : (
            <>
              {savedCharacters.length > 0 && (
                <div className="relative mb-2">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gold-dim/50"
                    size={13}
                  />
                  <input
                    type="text"
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    placeholder="Cerca personaggio salvato..."
                    className="fantasy-input min-h-8 w-full pl-8 pr-7 text-xs"
                  />
                  {savedSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSavedSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-dim/50 hover:text-gold"
                      aria-label="Cancella ricerca"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {filteredSavedCharacters.length === 0 ? (
                <p className="py-3 text-center text-xs text-gold-dim/50">
                  Nessun personaggio trovato per &quot;{savedSearchQuery}&quot;
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {filteredSavedCharacters.map((character) =>
                    editingSavedId === character.id ? (
                      <div
                        key={character.id}
                        className="rounded-xl border border-gold/40 bg-parchment/60 p-2.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/55 text-base">
                              {character.icon}
                            </span>
                            <p className="truncate text-xs font-black text-foreground">
                              Modifica {character.name}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dim/60">
                            {character.isMonster ? "Mostro" : "PG"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-[10px] font-bold text-gold-dim" htmlFor={`edit-hp-${character.id}`}>
                              HP massimi
                            </label>
                            <input
                              id={`edit-hp-${character.id}`}
                              type="number"
                              min={1}
                              value={editingHp}
                              onChange={(e) => {
                                setEditingHp(e.target.value);
                                if (editingError) setEditingError("");
                              }}
                              className="fantasy-input min-h-8 w-full px-2 py-1 text-xs"
                              placeholder="HP"
                              disabled={isUpdatingSaved}
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-bold text-gold-dim" htmlFor={`edit-init-${character.id}`}>
                              Iniziativa
                            </label>
                            <input
                              id={`edit-init-${character.id}`}
                              type="number"
                              min={0}
                              value={editingInitiative}
                              onChange={(e) => {
                                setEditingInitiative(e.target.value);
                                if (editingError) setEditingError("");
                              }}
                              className="fantasy-input min-h-8 w-full px-2 py-1 text-xs"
                              placeholder="Iniziativa"
                              disabled={isUpdatingSaved}
                            />
                          </div>
                        </div>

                        {editingError && (
                          <p className="text-[11px] font-bold text-red-300">{editingError}</p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={cancelEditingSavedCharacter}
                            disabled={isUpdatingSaved}
                            className="flex h-8 items-center gap-1 rounded-lg border border-border-gold/20 px-2.5 text-[11px] font-bold text-gold-dim hover:text-gold transition disabled:opacity-50"
                          >
                            Annulla
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSaveEditedCharacter(character.id)}
                            disabled={isUpdatingSaved}
                            className="flex h-8 items-center gap-1 rounded-lg bg-gold px-3 text-[11px] font-black text-background hover:bg-gold-bright transition disabled:opacity-50"
                          >
                            {isUpdatingSaved ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Salva
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={character.id}
                        className="flex items-center gap-2 rounded-xl border border-border-gold/15 bg-parchment/40 p-2"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/55 text-lg">
                          {character.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-foreground">
                            {character.name}
                          </p>
                          <p className="text-[11px] font-bold text-gold-dim/50">
                            {character.maxHp} HP · Init {character.initiative} · {character.isMonster ? "Mostro" : "PG"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => preloadSavedCharacter(character)}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-gold px-2.5 text-[11px] font-black text-background transition hover:bg-gold-bright"
                          title={`Compila la scheda con ${character.name}`}
                        >
                          Usa
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingSavedCharacter(character)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-gold/30 text-gold-dim transition hover:border-gold hover:text-gold hover:bg-gold/10"
                          aria-label={`Modifica ${character.name}`}
                          title="Modifica iniziativa e HP"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteSavedCharacter(character.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/20 text-red-200 transition hover:bg-red-500/10"
                          aria-label={`Rimuovi ${character.name} dai personaggi salvati`}
                          title="Rimuovi dalla raccolta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

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
              autoFocus
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
