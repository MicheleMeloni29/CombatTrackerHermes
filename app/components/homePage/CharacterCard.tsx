"use client";

import { Clock3, HeartPulse, Shield, Skull, Sparkles, Swords } from "lucide-react";
import type { Character } from "@/types/character";

interface CharacterCardProps {
  character: Character;
  index: number;
  isActive: boolean;
  elapsedSeconds: number;
  onSelect: () => void;
}

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CharacterCard({
  character,
  index,
  isActive,
  elapsedSeconds,
  onSelect,
}: CharacterCardProps) {
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

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3 text-left shadow-lg shadow-black/20 transition active:scale-[0.99] ${
        isActive
          ? "border-gold bg-gold/10 ring-1 ring-gold/45"
          : "border-border-gold/20 bg-parchment/55 hover:border-border-gold/50"
      } ${isDead ? "opacity-55 grayscale" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl ${
            character.isMonster
              ? "border-red-500/20 bg-red-500/10"
              : "border-emerald-500/20 bg-emerald-500/10"
          }`}
        >
          {character.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {isActive && <Swords className="shrink-0 text-gold" size={15} />}
                <h3 className={`truncate text-base font-black ${isDead ? "line-through" : ""}`}>
                  {character.name}
                </h3>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-dim/60">
                <span className="flex items-center gap-1">
                  {character.isMonster ? <Skull size={12} /> : <Shield size={12} />}
                  {character.isMonster ? "Mostro" : "PG"}
                </span>
                <span>#{index + 1}</span>
                <span>Init {character.initiative}</span>
              </div>
            </div>
            <div className="rounded-full border border-border-gold/25 bg-background/50 px-2.5 py-1 text-xs font-black text-gold">
              {character.currentHp}/{character.maxHp}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <HeartPulse className={hpPercent <= 20 ? "text-red-300" : "text-emerald-300"} size={15} />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background/70">
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

            <div className="flex min-h-6 items-center justify-between gap-2 text-xs text-gold-dim/65">
              {activeSpells.length > 0 ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Sparkles className="shrink-0 text-purple-300" size={14} />
                  <span className="truncate">
                    {activeSpells.length} attivi
                    {nextExpiringSpell ? ` · ${nextExpiringSpell.name}` : ""}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gold-dim/40">
                  <Sparkles size={14} />
                  Nessun incantesimo
                </span>
              )}
              {nextExpiringSpell && (
                <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-purple-200">
                  <Clock3 size={13} />
                  {formatCountdown(nextExpiringSpell.remaining)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
