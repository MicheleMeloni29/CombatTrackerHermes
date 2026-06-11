// Rappresenta una riga nella lista dei personaggi, con tutte le informazioni e le azioni possibili
"use client";

import { useState } from "react";
import type { Character, Spell } from "@/types/character";

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

  const [hpError, setHpError] = useState("");
  const [spellError, setSpellError] = useState("");

  const hpPercent = Math.max(0, (character.currentHp / character.maxHp) * 100);
  const isDead = character.currentHp <= 0;

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

    if (!trimmed) errors.push("nome obbligatorio");
    if (!spellDuration.trim()) errors.push("durata obbligatoria");
    else if (Number.isNaN(duration) || duration <= 0) errors.push("durata deve essere ≥ 1");

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
      className={`dd-card relative transition-all cursor-grab active:cursor-grabbing ${
        isDead
          ? "opacity-40 grayscale"
          : isActive
            ? "active-turn"
            : ""
      } ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "border-amber-400 border-dashed" : ""}`}
      style={{
        backgroundImage: `url('/dnd-bg-texture.png'), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.35) 100%)`,
        backgroundBlendMode: 'overlay',
      }}
    >
      <span className="absolute inset-0 bg-background/30 mix-blend-multiply pointer-events-none" aria-hidden="true" />
      

      <div className="p-2.5 sm:p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0 ${
              character.isMonster ? "bg-red-900/60" : "bg-emerald-900/60"
            }`}
          >
            {character.icon}
          </span>

          <h3
            className={`font-bold flex-1 truncate text-sm ${
              isDead ? "text-stone-600 line-through" : "text-foreground"
            }`}
          >
            {character.name}
          </h3>

          <span className="shrink-0 bg-parchment px-1.5 py-0.5 rounded border border-border-gold">
            <span className="text-[10px]">⚡</span>
            <span className="text-gold font-medieval text-[11px] font-bold ml-0.5">
              {character.initiative}
            </span>
          </span>

          <button
            onClick={() => onDelete(character.id)}
            className="w-5 h-5 flex items-center justify-center rounded text-stone-600 hover:text-red-400 hover:bg-red-900/30 text-[10px] transition-colors shrink-0"
            title="Rimuovi"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] w-4 text-center shrink-0">❤️</span>
          <div
            className={`hp-bar-container flex-1 h-4 overflow-hidden ${
              hpPercent <= 20 ? "dd-critical-border" : ""
            }`}
          >
            <div
              className={`hp-bar h-full ${hpPercent <= 20 ? "critical" : ""}`}
              style={{ width: `${hpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          {isDead && (
            <span className="text-red-500 text-[10px] font-bold shrink-0 animate-pulse">💀</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 text-[10px] w-4 text-center shrink-0">+/-</span>
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
            className={`fantasy-input flex-1 min-w-0 px-2 py-1.5 text-xs ${hpError ? "fantasy-input-error" : ""}`}
          />
          <button onClick={handleDamage} className="dd-btn dd-btn-sm">Danno</button>
          <button onClick={handleHeal} className="dd-btn dd-btn-sm">Cura</button>
        </div>
        {hpError && <p className="field-error ml-5">{hpError}</p>}

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 text-[10px] w-4 text-center shrink-0">✨</span>
            <input
              type="text"
              value={spellName}
              onChange={(e) => {
                setSpellName(e.target.value);
                if (spellError) setSpellError("");
              }}
              placeholder="Nome incantesimo"
              className="fantasy-input flex-1 min-w-0 px-2 py-1.5 text-xs"
            />
            <input
              type="number"
              value={spellDuration}
              onChange={(e) => {
                setSpellDuration(e.target.value);
                if (spellError) setSpellError("");
              }}
              placeholder="sec"
              min={1}
              className="fantasy-input w-16 sm:w-20 px-2 py-1.5 text-xs"
            />
            <button onClick={handleAddSpell} className="dd-btn dd-btn-sm">
              Aggiungi
            </button>
          </div>
          {spellError && <p className="field-error ml-5">{spellError}</p>}
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
                    className={`dd-card !p-2 flex items-center gap-2 ${
                      isExpiring ? "border-red-700/70" : "border-purple-700/50"
                    }`}
                    style={{
                      backgroundImage: isExpiring
                        ? "radial-gradient(circle at 50% 50%, rgba(255,80,80,0.08) 0%, rgba(0,0,0,0.2) 100%)"
                        : "radial-gradient(circle at 50% 50%, rgba(180,160,220,0.1) 0%, rgba(0,0,0,0.2) 100%)",
                    }}
                  >
                    <span className="text-purple-200 text-[11px] font-medium flex-1 truncate">{spell.name}</span>
                    <div className="flex-1 h-1.5 bg-parchment-light/80 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExpiring ? "bg-red-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${remainingPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold whitespace-nowrap ${
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
          {activeSpells.length === 0 && (
            <p className="text-[11px] text-gold-dim/50 ml-5">Nessun incantesimo attivo</p>
          )}
        </div>
      </div>
    </div>
  );
}
