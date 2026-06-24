"use client";

import {
  ArrowDown,
  ArrowUp,
  HeartPulse,
  Minus,
  Plus,
  Shield,
  Skull,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Character, Spell } from "@/types/character";

interface CharacterDetailSheetProps {
  character: Character | null;
  index: number;
  total: number;
  isActive: boolean;
  elapsedSeconds: number;
  onClose: () => void;
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onAddSpell: (characterId: string, spell: Omit<Spell, "id">) => void;
  onRemoveSpell: (characterId: string, spellId: string) => void;
  onMoveCharacter: (id: string, direction: "up" | "down") => void;
}

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CharacterDetailSheet({
  character,
  index,
  total,
  isActive,
  elapsedSeconds,
  onClose,
  onDamage,
  onHeal,
  onDelete,
  onAddSpell,
  onRemoveSpell,
  onMoveCharacter,
}: CharacterDetailSheetProps) {
  const [hpInput, setHpInput] = useState("");
  const [spellName, setSpellName] = useState("");
  const [spellDuration, setSpellDuration] = useState("");
  const [hpError, setHpError] = useState("");
  const [spellError, setSpellError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!character) return null;

  const hpPercent = Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100));
  const isDead = character.currentHp <= 0;
  const activeSpells = character.spells.filter(
    (spell) => elapsedSeconds - spell.castAtElapsedSeconds < spell.durationSeconds
  );

  const validateHp = () => {
    const value = parseInt(hpInput);
    if (!hpInput.trim()) {
      setHpError("Inserisci un valore");
      return null;
    }
    if (Number.isNaN(value) || value <= 0) {
      setHpError("Il valore deve essere almeno 1");
      return null;
    }
    setHpError("");
    return value;
  };

  const handleDamage = () => {
    const value = validateHp();
    if (value === null) return;
    onDamage(character.id, value);
    setHpInput("");
  };

  const handleHeal = () => {
    const value = validateHp();
    if (value === null) return;
    onHeal(character.id, value);
    setHpInput("");
  };

  const handleAddSpell = () => {
    const trimmedName = spellName.trim();
    const duration = parseInt(spellDuration);

    if (!trimmedName) {
      setSpellError("Inserisci il nome dell'incantesimo");
      return;
    }
    if (!spellDuration.trim() || Number.isNaN(duration) || duration <= 0) {
      setSpellError("La durata deve essere almeno 1 secondo");
      return;
    }

    setSpellError("");
    onAddSpell(character.id, {
      name: trimmedName,
      durationSeconds: duration,
      castAtElapsedSeconds: elapsedSeconds,
    });
    setSpellName("");
    setSpellDuration("");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 px-2 pt-6 backdrop-blur-sm sm:px-4 sm:pt-10 lg:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Chiudi dettaglio"
        onClick={onClose}
      />
      <section className="relative flex max-h-[min(92vh,calc(100dvh-0.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-border-gold/25 bg-background shadow-2xl shadow-black/70 sm:max-h-[min(90vh,calc(100dvh-2rem))] sm:rounded-[1.75rem]">
        <div className="sticky top-0 z-10 shrink-0 border-b border-border-gold/15 bg-parchment/75 p-3 backdrop-blur sm:p-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl sm:h-14 sm:w-14 sm:text-2xl ${
                character.isMonster
                  ? "border-red-500/25 bg-red-500/10"
                  : "border-emerald-500/25 bg-emerald-500/10"
              }`}
            >
              {character.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`min-w-0 truncate text-lg font-black sm:text-xl ${
                    isDead ? "line-through text-stone-400" : "text-foreground"
                  }`}
                >
                  {character.name}
                </h2>
                {isActive && (
                  <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-gold">
                    Turno
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-dim/60">
                <span className="flex items-center gap-1">
                  {character.isMonster ? <Skull size={13} /> : <Shield size={13} />}
                  {character.isMonster ? "Mostro" : "PG"}
                </span>
                <span>Posizione {index + 1}/{total}</span>
                <span>Init {character.initiative}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-gold/20 text-gold-dim transition hover:border-border-gold hover:text-gold"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:space-y-4 sm:p-4">
          <section className="rounded-2xl border border-border-gold/15 bg-parchment/45 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartPulse className={hpPercent <= 20 ? "text-red-300" : "text-emerald-300"} size={18} />
                <span className="text-sm font-black text-gold">Punti ferita</span>
              </div>
              <span className="font-mono text-lg font-black text-foreground">
                {character.currentHp}/{character.maxHp}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-background/70">
              <div
                className={`h-full rounded-full transition-all ${
                  hpPercent <= 20 ? "bg-red-400" : hpPercent <= 50 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                type="number"
                min={1}
                value={hpInput}
                onChange={(event) => {
                  setHpInput(event.target.value);
                  if (hpError) setHpError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleDamage();
                }}
                placeholder="Valore"
                className={`fantasy-input min-h-12 px-3 text-sm ${hpError ? "fantasy-input-error" : ""}`}
              />
              <button
                type="button"
                onClick={handleDamage}
                className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-red-500/35 bg-red-500/10 px-3 text-sm font-black text-red-200 transition hover:bg-red-500/20 sm:px-4"
              >
                <Minus size={16} />
                Danno
              </button>
              <button
                type="button"
                onClick={handleHeal}
                className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-500/20 sm:px-4"
              >
                <Plus size={16} />
                Cura
              </button>
            </div>
            {hpError && <p className="field-error">{hpError}</p>}
          </section>

          <section className="rounded-2xl border border-border-gold/15 bg-parchment/45 p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="text-purple-300" size={18} />
              <h3 className="text-sm font-black text-gold">Incantesimi attivi</h3>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_88px_auto]">
              <input
                type="text"
                value={spellName}
                onChange={(event) => {
                  setSpellName(event.target.value);
                  if (spellError) setSpellError("");
                }}
                placeholder="Nome"
                className="fantasy-input min-h-11 px-3 text-sm"
              />
              <input
                type="number"
                min={1}
                value={spellDuration}
                onChange={(event) => {
                  setSpellDuration(event.target.value);
                  if (spellError) setSpellError("");
                }}
                placeholder="sec"
                className="fantasy-input min-h-11 px-3 text-sm"
              />
              <button
                type="button"
                onClick={handleAddSpell}
                className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-purple-400/35 bg-purple-400/10 px-3 text-sm font-black text-purple-100 transition hover:bg-purple-400/20"
                aria-label="Aggiungi incantesimo"
              >
                <Plus size={17} />
                <span className="sm:hidden">Aggiungi incantesimo</span>
              </button>
            </div>
            {spellError && <p className="field-error">{spellError}</p>}

            <div className="mt-3 space-y-2">
              {activeSpells.length === 0 ? (
                <p className="rounded-xl border border-border-gold/10 bg-background/35 px-3 py-3 text-sm text-gold-dim/45">
                  Nessun incantesimo attivo.
                </p>
              ) : (
                activeSpells.map((spell) => {
                  const remaining = spell.durationSeconds - (elapsedSeconds - spell.castAtElapsedSeconds);
                  const percent = Math.max(0, (remaining / spell.durationSeconds) * 100);
                  const isExpiring = remaining <= 10;

                  return (
                    <div
                      key={spell.id}
                      className={`rounded-xl border p-3 ${
                        isExpiring ? "border-red-500/35 bg-red-500/10" : "border-purple-400/25 bg-purple-400/10"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="min-w-0 truncate text-sm font-bold text-foreground">{spell.name}</span>
                        <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                          <span className={`font-mono text-xs font-black ${isExpiring ? "text-red-200" : "text-purple-200"}`}>
                            {formatCountdown(remaining)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveSpell(character.id, spell.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gold-dim transition hover:bg-red-500/15 hover:text-red-200"
                            aria-label="Rimuovi incantesimo"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
                        <div
                          className={`h-full rounded-full ${isExpiring ? "bg-red-300" : "bg-purple-300"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border-gold/15 bg-parchment/45 p-3 sm:p-4">
            <h3 className="mb-3 text-sm font-black text-gold">Ordine e gestione</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={index <= 0}
                onClick={() => onMoveCharacter(character.id, "up")}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-gold/25 px-3 text-sm font-bold text-gold transition hover:border-gold disabled:opacity-35"
              >
                <ArrowUp size={16} />
                Su
              </button>
              <button
                type="button"
                disabled={index >= total - 1}
                onClick={() => onMoveCharacter(character.id, "down")}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-gold/25 px-3 text-sm font-bold text-gold transition hover:border-gold disabled:opacity-35"
              >
                <ArrowDown size={16} />
                Giu
              </button>
            </div>
            <div className="mt-2">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-sm font-black text-red-200 transition hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Rimuovi combattente
                </button>
              ) : (
                <div className="rounded-xl border border-red-500/35 bg-red-500/10 p-2">
                  <p className="mb-2 text-center text-xs font-bold text-red-100">
                    Confermi la rimozione di {character.name}?
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="min-h-10 rounded-lg border border-border-gold/20 px-3 text-xs font-black text-gold-dim"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(character.id);
                        onClose();
                      }}
                      className="min-h-10 rounded-lg bg-red-500 px-3 text-xs font-black text-white"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
