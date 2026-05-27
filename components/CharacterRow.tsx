// Rappresenta una riga nella lista dei personaggi, con tutte le informazioni e le azioni possibili
"use client";

import { useState } from "react";
import type { Character, Spell } from "../types/character";

interface CharacterRowProps {
  character: Character;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  elapsedSeconds: number;
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onAddSpell: (characterId: string, spell: Omit<Spell, "id">) => void;
  onRemoveSpell: (characterId: string, spellId: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "0:00";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CharacterRow({
  character,
  index,
  isActive,
  isDragging,
  isDragOver,
  elapsedSeconds,
  onDamage,
  onHeal,
  onDelete,
  onAddSpell,
  onRemoveSpell,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: CharacterRowProps) {
  const [hpInput, setHpInput] = useState("");
  const [spellName, setSpellName] = useState("");
  const [spellDuration, setSpellDuration] = useState("");

  // Stato per gli errori di validazione
  const [hpError, setHpError] = useState("");
  const [spellError, setSpellError] = useState("");

  const hpPercent = Math.max(0, (character.currentHp / character.maxHp) * 100);
  const isDead = character.currentHp <= 0;

  // Classe gradiente per la barra HP in base alla percentuale
  const hpBarColor =
    hpPercent > 50 ? "hp-bar-green" : hpPercent > 25 ? "hp-bar-yellow" : "hp-bar-red";

  const validateHp = (): boolean => {
    const value = parseInt(hpInput);
    if (!hpInput.trim()) {
      setHpError("Inserisci un valore");
      return false;
    }
    if (Number.isNaN(value) || value <= 0) {
      setHpError("Il valore deve essere ≥ 1");
      return false;
    }
    setHpError("");
    return true;
  };

  const handleDamage = () => {
    if (!validateHp()) return;
    const value = parseInt(hpInput);
    onDamage(character.id, value);
    setHpInput("");
    setHpError("");
  };

  const handleHeal = () => {
    if (!validateHp()) return;
    const value = parseInt(hpInput);
    onHeal(character.id, value);
    setHpInput("");
    setHpError("");
  };

  const handleAddSpell = () => {
    const trimmed = spellName.trim();
    const duration = parseInt(spellDuration);
    const errors: string[] = [];

    if (!trimmed) {
      errors.push("nome obbligatorio");
    }
    if (!spellDuration.trim()) {
      errors.push("durata obbligatoria");
    } else if (Number.isNaN(duration) || duration <= 0) {
      errors.push("durata deve essere ≥ 1");
    }

    if (errors.length > 0) {
      setSpellError(errors.map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(", "));
      return;
    }

    setSpellError("");
    onAddSpell(character.id, {
      name: trimmed,
      durationSeconds: duration,
      castAtElapsedSeconds: elapsedSeconds,
    });
    setSpellName("");
    setSpellDuration("");
  };

  // Filtra gli incantesimi scaduti
  const activeSpells = character.spells.filter(
    (s) => elapsedSeconds - s.castAtElapsedSeconds < s.durationSeconds
  );

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className={`fantasy-card relative transition-all cursor-grab active:cursor-grabbing ${
        isDead
          ? "opacity-40 grayscale"
          : isActive
            ? "animate-glow-pulse"
            : ""
      } ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "border-amber-400 border-dashed" : ""}`}
    >
      {/* Indicatore turno attivo */}
      {isActive && (
        <span className="absolute top-0 right-0 text-xs bg-gold text-parchment px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg font-bold z-10">
          🎯
        </span>
      )}

      <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-3">
        {/* Riga 1: maniglia trascinamento + badge + nome + INIT + elimina */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-gold-dim/40 text-base sm:text-lg select-none shrink-0">⠿</span>

          {/* Icona */}
          <span
            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm shrink-0 ${
              character.isMonster
                ? "bg-red-900/60"
                : "bg-emerald-900/60"
            }`}
          >
            {character.icon}
          </span>

          <h3
            className={`font-bold flex-1 truncate text-sm sm:text-base ${
              isDead ? "text-stone-600 line-through" : "text-foreground"
            }`}
          >
            {character.name}
          </h3>

          <span className="shrink-0 bg-parchment px-2 py-0.5 rounded border border-border-gold">
            <span className="text-xs">⚡</span>
            <span className="text-gold font-medieval text-xs sm:text-sm font-bold ml-0.5">
              {character.initiative}
            </span>
          </span>

          <button
            onClick={() => onDelete(character.id)}
            className="w-7 h-7 flex items-center justify-center rounded text-stone-600 hover:text-red-400 hover:bg-red-900/30 text-xs transition-colors shrink-0"
            title="Rimuovi"
          >
            ✕
          </button>
        </div>

        {/* Riga 2: barra HP */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs w-5 sm:w-6 text-center shrink-0">
            ❤️
          </span>
          <div className="flex-1 h-5 sm:h-6 rounded-full bg-parchment overflow-hidden relative">
            <div
              className={`h-full ${hpBarColor} transition-all duration-300 rounded-full`}
              style={{ width: `${hpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          {isDead && (
            <span className="text-red-500 text-[10px] sm:text-xs font-bold shrink-0 animate-pulse">
              💀 SCONFITTO
            </span>
          )}
        </div>

        {/* Riga 3: input HP + pulsanti danno/cura */}
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-stone-500 text-[10px] sm:text-xs w-5 sm:w-6 text-center shrink-0">
              +/-
            </span>
            <input
              type="number"
              value={hpInput}
              onChange={(e) => {
                setHpInput(e.target.value);
                if (hpError) setHpError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDamage();
              }}
              placeholder="Valore..."
              min={0}
              className={`fantasy-input flex-1 min-w-0 px-2 py-2 sm:py-1.5 text-sm ${hpError ? "fantasy-input-error" : ""}`}
            />
            <button
              onClick={handleDamage}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-red-900/80 text-red-200 border border-red-700/50 rounded hover:bg-red-800 active:bg-red-900 transition-colors shrink-0"
            >
              ⚔️ Danno
            </button>
            <button
              onClick={handleHeal}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700/50 rounded hover:bg-emerald-800 active:bg-emerald-900 transition-colors shrink-0"
            >
              💚 Cura
            </button>
          </div>
          {hpError && (
            <p className="field-error ml-7 sm:ml-8">{hpError}</p>
          )}
        </div>

        {/* Riga 4: form incantesimo */}
        <div>
          <div className="spell-divider mb-2 sm:mb-3" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-purple-300 font-medieval text-sm shrink-0">✨ Incantesimi</span>
            <input
              type="text"
              value={spellName}
              onChange={(e) => {
                setSpellName(e.target.value);
                if (spellError) setSpellError("");
              }}
              placeholder="Nome incantesimo..."
              className={`fantasy-input flex-1 min-w-0 px-2 py-2 sm:py-1.5 text-sm focus:border-purple-500/50 focus:shadow-[0_0_8px_rgba(168,85,247,0.15)] ${spellError ? "fantasy-input-error" : ""}`}
            />
            <input
              type="number"
              value={spellDuration}
              onChange={(e) => {
                setSpellDuration(e.target.value);
                if (spellError) setSpellError("");
              }}
              placeholder="Sec"
              min={1}
              className={`fantasy-input w-14 sm:w-16 px-2 py-2 sm:py-1.5 text-sm text-center focus:border-purple-500/50 focus:shadow-[0_0_8px_rgba(168,85,247,0.15)] ${spellError ? "fantasy-input-error" : ""}`}
            />
            <button
              onClick={handleAddSpell}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded hover:bg-purple-800 active:bg-purple-900 transition-colors shrink-0"
            >
              ✨ Lancia
            </button>
          </div>
          {spellError && (
            <p className="field-error mt-1.5">{spellError}</p>
          )}
        </div>

        {/* Riga 5: incantesimi attivi */}
        {activeSpells.length > 0 && (
          <div className="space-y-1">
            {activeSpells.map((spell) => {
              const remaining = spell.durationSeconds - (elapsedSeconds - spell.castAtElapsedSeconds);
              const remainingMax = spell.durationSeconds;
              const remainingPercent = Math.max(0, (remaining / remainingMax) * 100);
              const isExpiring = remaining <= 10;

              return (
                <div
                  key={spell.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                    isExpiring ? "bg-parchment border border-red-800/40" : "bg-parchment border border-purple-800/30"
                  }`}
                >
                  <span className="text-purple-200 text-xs font-medium flex-1 truncate">
                    {spell.name}
                  </span>
                  <div className="flex-1 h-2 bg-parchment-light rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExpiring ? "bg-red-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${remainingPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-mono font-bold whitespace-nowrap ${
                      isExpiring ? "text-red-400 animate-pulse" : "text-purple-300"
                    }`}
                  >
                    {formatCountdown(remaining)}
                  </span>
                  <button
                    onClick={() => onRemoveSpell(character.id, spell.id)}
                    className="w-5 h-5 flex items-center justify-center rounded text-stone-500 hover:text-red-400 text-[10px] transition-colors shrink-0"
                    title="Rimuovi incantesimo"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
