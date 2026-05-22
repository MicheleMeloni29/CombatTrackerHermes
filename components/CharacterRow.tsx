// Rappresenta una riga nella lista dei personaggi, con tutte le informazioni e le azioni possibili
"use client";

import { useState } from "react";
import type { Character } from "../types/character";

interface CharacterRowProps {
  character: Character;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export default function CharacterRow({
  character,
  index,
  isActive,
  isDragging,
  isDragOver,
  onDamage,
  onHeal,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: CharacterRowProps) {
  const [hpInput, setHpInput] = useState("");

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
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-stone-500 text-lg select-none">::</span>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
              character.isMonster
                ? "bg-red-800 text-red-200"
                : "bg-emerald-800 text-emerald-200"
            }`}
          >
            {character.isMonster ? "MOSTRO" : "PG"}
          </span>

          <h3
            className={`font-bold flex-1 truncate ${
              isDead ? "text-stone-500 line-through" : "text-stone-100"
            }`}
          >
            {character.name}
          </h3>

          <span className="text-amber-400 font-mono font-bold text-sm shrink-0">
            INIT: {character.initiative}
          </span>

          <button
            onClick={() => onDelete(character.id)}
            className="w-7 h-7 flex items-center justify-center rounded bg-stone-700 text-stone-400 hover:bg-red-800 hover:text-red-200 text-xs transition-colors shrink-0"
            title="Rimuovi"
          >
            X
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-500 text-xs w-6 text-center shrink-0">
            HP
          </span>
          <div className={`flex-1 h-4 rounded-full ${hpBarBg} overflow-hidden relative`}>
            <div
              className={`h-full ${hpBarColor} transition-all duration-300 rounded-full`}
              style={{ width: `${hpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          {isDead && (
            <span className="text-red-500 text-xs font-bold shrink-0 animate-pulse">
              SCONFITTO
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-xs w-6 text-center shrink-0">
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
            className="flex-1 px-2 py-1.5 text-sm bg-stone-900 border border-stone-600 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <button
            onClick={handleDamage}
            className="px-3 py-1.5 text-sm font-bold bg-red-800 text-red-100 rounded hover:bg-red-700 active:bg-red-900 transition-colors shrink-0"
          >
            Danno (-)
          </button>
          <button
            onClick={handleHeal}
            className="px-3 py-1.5 text-sm font-bold bg-emerald-800 text-emerald-100 rounded hover:bg-emerald-700 active:bg-emerald-900 transition-colors shrink-0"
          >
            Cura (+)
          </button>
        </div>
      </div>
    </div>
  );
}
