"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  GripVertical,
  HeartPulse,
  Minus,
  Play,
  Plus,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatSpellCountdown } from "@/lib/spellDuration";
import type { Character } from "@/types/character";

interface CharacterCardProps {
  character: Character;
  index: number;
  total: number;
  isActive: boolean;
  isCombatStarted: boolean;
  isManageMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  elapsedSeconds: number;
  onSelect: () => void;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onSetActive: () => void;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

export default function CharacterCard({
  character,
  index,
  total,
  isActive,
  isCombatStarted,
  isManageMode,
  isDragging,
  isDragOver,
  elapsedSeconds,
  onSelect,
  onDamage,
  onHeal,
  onDelete,
  onMove,
  onSetActive,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: CharacterCardProps) {
  const [quickAmount, setQuickAmount] = useState("1");
  const [amountError, setAmountError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hpPercent = Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100));
  const isDead = character.currentHp <= 0;
  const activeSpells = character.spells.filter(
    (spell) => elapsedSeconds - spell.castAtElapsedSeconds < spell.durationSeconds
  );
  const nextExpiringSpell = activeSpells
    .map((spell) => ({
      ...spell,
      remaining: spell.durationSeconds - (elapsedSeconds - spell.castAtElapsedSeconds),
    }))
    .sort((left, right) => left.remaining - right.remaining)[0];

  const runHealthAction = (action: "damage" | "heal") => {
    const amount = Number.parseInt(quickAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError(true);
      return;
    }

    setAmountError(false);
    if (action === "damage") onDamage(amount);
    else onHeal(amount);
  };

  return (
    <article
      onDragOver={isManageMode ? onDragOver : undefined}
      onDrop={isManageMode ? onDrop : undefined}
      className={`w-full rounded-xl border p-2.5 text-left shadow-md shadow-black/15 transition ${
        isActive
          ? "border-gold bg-gold/10 ring-1 ring-gold/45"
          : "border-border-gold/20 bg-parchment/55 hover:border-border-gold/50"
      } ${isDead ? "opacity-65" : ""} ${isDragging ? "scale-[0.99] opacity-40" : ""} ${
        isDragOver ? "border-gold border-dashed bg-gold/15" : ""
      }`}
    >
      <div
        className={`grid gap-2 ${
          isManageMode ? "" : "sm:grid-cols-[minmax(0,1fr)_268px] sm:items-center"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isManageMode && (
            <div
              draggable
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              className="flex h-10 w-7 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border-gold/20 text-gold-dim/65 active:cursor-grabbing"
              aria-hidden="true"
              title="Trascina per riordinare"
            >
              <GripVertical size={16} />
            </div>
          )}

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${
              character.isMonster
                ? "border-red-500/20 bg-red-500/10"
                : "border-emerald-500/20 bg-emerald-500/10"
            }`}
          >
            {character.icon}
          </div>

          <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5">
              {isActive && <Swords className="shrink-0 text-gold" size={14} />}
              <h3 className={`truncate text-sm font-black ${isDead ? "line-through" : ""}`}>
                {character.name}
              </h3>
              <span className="shrink-0 rounded-md border border-border-gold/20 bg-background/45 px-1.5 py-0.5 text-[10px] font-black text-gold">
                {character.currentHp}/{character.maxHp}
              </span>
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-dim/60">
              <span className="flex shrink-0 items-center gap-1">
                {character.isMonster ? <Skull size={11} /> : <Shield size={11} />}
                {character.isMonster ? "Mostro" : "PG"}
              </span>
              <span className="shrink-0">#{index + 1}</span>
              <span className="shrink-0">Init {character.initiative}</span>
              <span className="flex min-w-0 items-center gap-1 normal-case tracking-normal text-purple-200/75">
                <Sparkles className="shrink-0" size={11} />
                <span className="truncate">
                  {activeSpells.length}
                  {nextExpiringSpell
                    ? ` · ${formatSpellCountdown(nextExpiringSpell.remaining)}`
                    : ""}
                </span>
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              <HeartPulse
                className={hpPercent <= 20 ? "text-red-300" : "text-emerald-300"}
                size={12}
              />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background/70">
                <div
                  className={`h-full rounded-full transition-all ${
                    hpPercent <= 20
                      ? "bg-red-400"
                      : hpPercent <= 50
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </button>
        </div>

        {!isManageMode && (
          <div className="grid grid-cols-[52px_1fr_1fr_40px] gap-1.5 border-t border-border-gold/15 pt-2 sm:border-l sm:border-t-0 sm:pl-2 sm:pt-0">
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={quickAmount}
              onChange={(event) => {
                setQuickAmount(event.target.value);
                setAmountError(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") runHealthAction("damage");
              }}
              className={`fantasy-input h-10 w-full px-1.5 text-center font-mono text-xs font-black ${
                amountError ? "fantasy-input-error" : ""
              }`}
              aria-label={`Quantita punti ferita per ${character.name}`}
            />
            <button
              type="button"
              onClick={() => runHealthAction("damage")}
              className="flex h-10 items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-1.5 text-[11px] font-black text-red-200 transition hover:bg-red-500/20"
            >
              <Minus size={14} />
              Danno
            </button>
            <button
              type="button"
              onClick={() => runHealthAction("heal")}
              className="flex h-10 items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[11px] font-black text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <Plus size={14} />
              Cura
            </button>
            <button
              type="button"
              onClick={onSelect}
              className="flex h-10 items-center justify-center rounded-lg border border-border-gold/25 text-gold"
              aria-label={`Apri tutte le azioni per ${character.name}`}
              title="Tutte le azioni"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>

      {isManageMode && (
        <div className="mt-2 space-y-1.5 border-t border-border-gold/15 pt-2">
          <div className="grid grid-cols-[1fr_40px_40px_40px_40px] gap-1.5">
            {isCombatStarted ? (
              <button
                type="button"
                onClick={onSetActive}
                disabled={isActive}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-2 text-[11px] font-black text-gold disabled:cursor-default disabled:opacity-50"
              >
                {isActive ? <Swords size={14} /> : <Play size={14} />}
                {isActive ? "Turno attivo" : "Passa il turno qui"}
              </button>
            ) : (
              <span className="flex h-9 items-center px-2 text-[11px] font-bold text-gold-dim/65">
                Posizione {index + 1} di {total}
              </span>
            )}
            <button
              type="button"
              onClick={() => onMove("up")}
              disabled={index === 0}
              className="flex h-9 items-center justify-center rounded-lg border border-border-gold/25 text-gold disabled:opacity-30"
              aria-label={`Sposta ${character.name} su`}
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => onMove("down")}
              disabled={index === total - 1}
              className="flex h-9 items-center justify-center rounded-lg border border-border-gold/25 text-gold disabled:opacity-30"
              aria-label={`Sposta ${character.name} giu`}
            >
              <ArrowDown size={15} />
            </button>
            {!confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={onSelect}
                  className="flex h-9 items-center justify-center rounded-lg border border-border-gold/20 text-gold-dim"
                  aria-label={`Apri dettagli di ${character.name}`}
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex h-9 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-200"
                  aria-label={`Rimuovi ${character.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex h-9 items-center justify-center rounded-lg border border-border-gold/20 text-gold-dim"
                  aria-label="Annulla rimozione"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-9 items-center justify-center rounded-lg bg-red-600 text-white"
                  aria-label={`Conferma rimozione di ${character.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
          {confirmDelete && (
            <p className="text-center text-[11px] font-bold text-red-100">
              Confermi la rimozione di {character.name}?
            </p>
          )}
        </div>
      )}
    </article>
  );
}
