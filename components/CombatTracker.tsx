// Componente principale che gestisce lo stato del combattimento, la lista dei personaggi, il turno attivo, il round e le funzioni per modificare questi stati. Contiene anche la logica per il drag-and-drop dei personaggi per riordinare l'iniziativa.
"use client";

import { useCallback, useRef, useState } from "react";
import type { Character, Spell } from "../types/character";
import CharacterForm from "./CharacterForm";
import CharacterRow from "./CharacterRow";
import CombatBar from "./CombatBar";

function createCharacterId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CombatTracker() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCombatStarted, setIsCombatStarted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  const addCharacter = (data: Omit<Character, "id" | "currentHp" | "spells">) => {
    const newChar: Character = {
      ...data,
      id: createCharacterId(),
      currentHp: data.maxHp,
      spells: [],
    };
    setCharacters((prev) => [...prev, newChar]);
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => {
      const newList = prev.filter((c) => c.id !== id);
      if (currentTurnIndex >= newList.length) {
        setCurrentTurnIndex(Math.max(0, newList.length - 1));
      }
      if (newList.length === 0) {
        setIsCombatStarted(false);
        setRound(1);
      }
      return newList;
    });
  };

  const applyDamage = (id: string, amount: number) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, currentHp: Math.max(0, c.currentHp - amount) } : c
      )
    );
  };

  const applyHeal = (id: string, amount: number) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, currentHp: Math.min(c.maxHp, c.currentHp + amount) } : c
      )
    );
  };

  const addSpell = (characterId: string, spell: Omit<Spell, "id">) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === characterId
          ? {
              ...c,
              spells: [
                ...c.spells,
                {
                  ...spell,
                  id: createCharacterId(),
                },
              ],
            }
          : c
      )
    );
  };

  const removeSpell = (characterId: string, spellId: string) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === characterId
          ? { ...c, spells: c.spells.filter((s) => s.id !== spellId) }
          : c
      )
    );
  };

  const sortByInitiative = () => {
    setCharacters((prev) => [...prev].sort((a, b) => b.initiative - a.initiative));
    setCurrentTurnIndex(0);
  };

  const startCombat = () => {
    if (characters.length === 0) return;
    setCharacters((prev) => [...prev].sort((a, b) => b.initiative - a.initiative));
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(true);
  };

  const nextTurn = useCallback(() => {
    if (characters.length === 0) return;
    const aliveCharacters = characters.filter((c) => c.currentHp > 0);
    if (aliveCharacters.length === 0) return;

    let nextIndex = currentTurnIndex + 1;
    if (nextIndex >= characters.length) {
      nextIndex = 0;
      setRound((r) => r + 1);
    }
    setCurrentTurnIndex(nextIndex);
  }, [characters, currentTurnIndex]);

  const prevTurn = () => {
    if (characters.length === 0) return;

    let prevIndex = currentTurnIndex - 1;
    if (prevIndex < 0) {
      prevIndex = characters.length - 1;
      setRound((r) => Math.max(1, r - 1));
    }
    setCurrentTurnIndex(prevIndex);
  };

  const resetCombat = () => {
    setCharacters([]);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(false);
  };

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
    dragNodeRef.current = index;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      setDragOverIndex(index);
    },
    [draggedIndex]
  );

  const handleDrop = useCallback(
    (_e: React.DragEvent, dropIndex: number) => {
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      setCharacters((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, moved);
        return updated;
      });

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  }, []);

  const elapsedSeconds = isCombatStarted
    ? ((round - 1) * characters.length + currentTurnIndex) * 6
    : 0;

  const aliveCount = characters.filter((c) => c.currentHp > 0).length;
  const deadCount = characters.length - aliveCount;
  const activeCharacter = characters[currentTurnIndex] ?? null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <CharacterForm onAdd={addCharacter} />

      {characters.length > 0 && (
        <CombatBar
          isCombatStarted={isCombatStarted}
          round={round}
          currentTurnIndex={currentTurnIndex}
          totalTurns={characters.length}
          activeCharacterName={activeCharacter?.name ?? null}
          elapsedSeconds={elapsedSeconds}
          aliveCount={aliveCount}
          deadCount={deadCount}
          onSort={sortByInitiative}
          onStart={startCombat}
          onPrevTurn={prevTurn}
          onNextTurn={nextTurn}
          onReset={resetCombat}
        />
      )}

      {characters.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <p className="text-4xl mb-3">Combat</p>
          <p className="text-lg font-semibold">Nessun combattente</p>
          <p className="text-sm mt-1">
            Aggiungi personaggi sopra per iniziare il combattimento
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {characters.map((char, index) => (
            <CharacterRow
              key={char.id}
              character={char}
              index={index}
              isActive={isCombatStarted && index === currentTurnIndex}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
              elapsedSeconds={elapsedSeconds}
              onDamage={applyDamage}
              onHeal={applyHeal}
              onDelete={deleteCharacter}
              onAddSpell={addSpell}
              onRemoveSpell={removeSpell}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
