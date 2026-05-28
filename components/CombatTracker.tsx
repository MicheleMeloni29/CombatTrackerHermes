"use client";

import { useCallback, useRef, useState } from "react";
import type { Character, Spell } from "../types/character";
import { useCombatState } from "./CombatContext";
import CharacterForm from "./CharacterForm";
import CharacterRow from "./CharacterRow";
import CombatHistory from "./CombatHistory";

export default function CombatTracker() {
  const {
    characters, currentTurnIndex, isCombatStarted, elapsedSeconds,
    showHistory, activeCharacterName,
    addCharacter, deleteCharacter, applyDamage, applyHeal, addSpell, removeSpell,
    setCharacterRef, requestResetCombat, cancelResetCombat, confirmResetCombat,
  } = useCombatState();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  const handleDragStart = useCallback((i: number) => { setDraggedIndex(i); dragNodeRef.current = i; }, [draggedIndex]);
  const handleDragOver = useCallback((e: React.DragEvent, i: number) => { e.preventDefault(); if (draggedIndex === null || draggedIndex === i) return; setDragOverIndex(i); }, [draggedIndex]);
  const handleDrop = useCallback((_e: React.DragEvent, di: number) => {
    if (draggedIndex === null || draggedIndex === di) return;
    // Il drag-and-drop riordinera' l'array nel provider
    setDraggedIndex(null); setDragOverIndex(null);
  }, [draggedIndex]);
  const handleDragEnd = useCallback(() => { setDraggedIndex(null); setDragOverIndex(null); dragNodeRef.current = null; }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <CharacterForm onAdd={addCharacter} />

      {characters.length === 0 ? (
        <div className="fantasy-card animate-fade-in-up text-center py-16 sm:py-20 px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-3xl sm:text-4xl opacity-60 -rotate-12">🛡️</span>
            <span className="text-4xl sm:text-5xl">⚔️</span>
            <span className="text-3xl sm:text-4xl opacity-60 rotate-12">🐉</span>
          </div>
          <h2 className="font-medieval text-gold text-2xl sm:text-3xl mb-3">La Battaglia Attende...</h2>
          <div className="ornament-divider mb-4 max-w-xs mx-auto"><span className="ornament-divider-icon">✦</span></div>
          <p className="text-gold-dim/60 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            Evoca i tuoi guerrieri e le creature della notte per dare inizio allo scontro
          </p>
          <p className="text-stone-600 text-xs mt-6 flex items-center justify-center gap-1.5">
            <span>👆</span> Usa il form sopra per aggiungere il primo combattente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {characters.map((char, index) => (
            <div key={char.id} ref={(el) => setCharacterRef(char.id, el)}>
              <CharacterRow
                character={char} index={index}
                isActive={isCombatStarted && index === currentTurnIndex}
                isDragging={draggedIndex === index} isDragOver={dragOverIndex === index}
                elapsedSeconds={elapsedSeconds} onDamage={applyDamage} onHeal={applyHeal}
                onDelete={deleteCharacter} onAddSpell={addSpell} onRemoveSpell={removeSpell}
                onDragStart={handleDragStart} onDragOver={handleDragOver}
                onDragEnd={handleDragEnd} onDrop={handleDrop}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
