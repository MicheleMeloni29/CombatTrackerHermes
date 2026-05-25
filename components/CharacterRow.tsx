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

  const hpPercent = Math.max(0, (character.currentHp / character.maxHp) * 100);
  const isDead = character.currentHp <= 0;

  const hpBarColor =
    hpPercent > 50 ? "bg-emerald-500" : hpPercent > 25 ? "bg-yellow-500" : "bg-red-500";
  const hpBarBg =
    hpPercent > 50
      ? "bg-emerald-900/40"
      : hpPercent > 25
        ? "bg-yellow-900/40"
        : "bg-red-900/40";

  const handleDamage = () => {
    const value = parseInt(hpInput);
    if (Number.isNaN(value) || value <= 0) return;
    onDamage(character.id, value);
    setHpInput("");
  };

  const handleHeal = () => {
    const value = parseInt(hpInput);
    if (Number.isNaN(value) || value <= 0) return;
    onHeal(character.id, value);
    setHpInput("");
  };

  const handleAddSpell = () => {
    const trimmed = spellName.trim();
    const duration = parseInt(spellDuration);
    if (!trimmed || Number.isNaN(duration) || duration <= 0) return;
    onAddSpell(character.id, {
      name: trimmed,
      durationSeconds: duration,
      castAtElapsedSeconds: elapsedSeconds,
    });
    setSpellName("");
    setSpellDuration("");
  };

  // Filter out expired spells
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
      className={`rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
        isDead
          ? "border-stone-700 bg-stone-900/60 opacity-50"
          : isActive
            ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30 ring-1 ring-amber-500/30"
            : "border-stone-700 bg-stone-800 hover:border-stone-600"
      } ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "border-amber-400 border-dashed" : ""}`}
    >
      <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-3">
        {/* Row 1: drag handle + badge + name + INIT + delete */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-stone-500 text-base sm:text-lg select-none shrink-0">::</span>

          <span
            className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded shrink-0 ${
              character.isMonster
                ? "bg-red-800 text-red-200"
                : "bg-emerald-800 text-emerald-200"
            }`}
          >
            {character.isMonster ? "MOSTRO" : "PG"}
          </span>

          <h3
            className={`font-bold flex-1 truncate text-sm sm:text-base ${
              isDead ? "text-stone-500 line-through" : "text-stone-100"
            }`}
          >
            {character.name}
          </h3>

          <span className="text-amber-400 font-mono font-bold text-xs sm:text-sm shrink-0">
            INIT {character.initiative}
          </span>

          <button
            onClick={() => onDelete(character.id)}
            className="w-7 h-7 flex items-center justify-center rounded bg-stone-700 text-stone-400 hover:bg-red-800 hover:text-red-200 text-xs transition-colors shrink-0"
            title="Rimuovi"
          >
            X
          </button>
        </div>

        {/* Row 2: HP bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-stone-500 text-[10px] sm:text-xs w-5 sm:w-6 text-center shrink-0">
            HP
          </span>
          <div className={`flex-1 h-3.5 sm:h-4 rounded-full ${hpBarBg} overflow-hidden relative`}>
            <div
              className={`h-full ${hpBarColor} transition-all duration-300 rounded-full`}
              style={{ width: `${hpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          {isDead && (
            <span className="text-red-500 text-[10px] sm:text-xs font-bold shrink-0 animate-pulse">
              SCONFITTO
            </span>
          )}
        </div>

        {/* Row 3: HP input + damage/heal buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-stone-500 text-[10px] sm:text-xs w-5 sm:w-6 text-center shrink-0">
            +/-
          </span>
          <input
            type="number"
            value={hpInput}
            onChange={(e) => setHpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleDamage();
            }}
            placeholder="Valore..."
            min={0}
            className="flex-1 min-w-0 px-2 py-2 sm:py-1.5 text-sm bg-stone-900 border border-stone-600 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <button
            onClick={handleDamage}
            className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-red-800 text-red-100 rounded hover:bg-red-700 active:bg-red-900 transition-colors shrink-0"
          >
            Danno
          </button>
          <button
            onClick={handleHeal}
            className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-emerald-800 text-emerald-100 rounded hover:bg-emerald-700 active:bg-emerald-900 transition-colors shrink-0"
          >
            Cura
          </button>
        </div>

        {/* Row 4: Spell form */}
        <div className="border-t border-stone-700 pt-2 sm:pt-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-purple-400 text-xs sm:text-sm shrink-0">Spell</span>
            <input
              type="text"
              value={spellName}
              onChange={(e) => setSpellName(e.target.value)}
              placeholder="Nome incantesimo..."
              className="flex-1 min-w-0 px-2 py-2 sm:py-1.5 text-sm bg-stone-900 border border-stone-600 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <input
              type="number"
              value={spellDuration}
              onChange={(e) => setSpellDuration(e.target.value)}
              placeholder="Sec"
              min={1}
              className="w-14 sm:w-16 px-2 py-2 sm:py-1.5 text-sm bg-stone-900 border border-stone-600 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
            />
            <button
              onClick={handleAddSpell}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-bold bg-purple-700 text-purple-100 rounded hover:bg-purple-600 active:bg-purple-800 transition-colors shrink-0"
            >
              Lancia
            </button>
          </div>
        </div>

        {/* Row 5: Active spells */}
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
                    isExpiring ? "bg-red-900/40" : "bg-purple-900/30"
                  }`}
                >
                  <span className="text-purple-300 text-xs font-medium flex-1 truncate">
                    {spell.name}
                  </span>
                  <div className="flex-1 h-1.5 bg-stone-700 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExpiring ? "bg-red-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${remainingPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold whitespace-nowrap ${
                      isExpiring ? "text-red-400 animate-pulse" : "text-purple-300"
                    }`}
                  >
                    {formatCountdown(remaining)}
                  </span>
                  <button
                    onClick={() => onRemoveSpell(character.id, spell.id)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-stone-700 text-stone-400 hover:bg-red-800 hover:text-red-200 text-[10px] transition-colors shrink-0"
                    title="Rimuovi incantesimo"
                  >
                    X
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
