// Componente principale che gestisce lo stato del combattimento, la lista dei personaggi, il turno attivo, il round e le funzioni per modificare questi stati. Contiene anche la logica per il drag-and-drop dei personaggi per riordinare l'iniziativa.
"use client";

import { useCallback, useRef, useState } from "react";
import type { Character, Spell } from "../types/character";
import { useCombatLog } from "./CombatLogProvider";
import CharacterForm from "./CharacterForm";
import CharacterRow from "./CharacterRow";
import CombatBar from "./CombatBar";
import CombatHistory from "./CombatHistory";

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
  const [showHistory, setShowHistory] = useState(false);
  const dragNodeRef = useRef<number | null>(null);
  const { addEvent: logEvent } = useCombatLog();

  const addCharacter = (data: Omit<Character, "id" | "currentHp" | "spells">) => {
    const newChar: Character = {
      ...data,
      id: createCharacterId(),
      currentHp: data.maxHp,
      spells: [],
    };
    setCharacters((prev) => [...prev, newChar]);
    logEvent("character_added", `${data.name} si è unito al combattimento`, 0);
  };

  const deleteCharacter = (id: string) => {
    const charName = characters.find((c) => c.id === id)?.name ?? "Personaggio";
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
    logEvent("character_deleted", `${charName} è stato rimosso dal combattimento`, elapsedSeconds);
  };

  const applyDamage = (id: string, amount: number) => {
    let charName = "";
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          charName = c.name;
          return { ...c, currentHp: Math.max(0, c.currentHp - amount) };
        }
        return c;
      })
    );
    logEvent("damage", `${charName} ha ricevuto ${amount} danni`, elapsedSeconds);
  };

  const applyHeal = (id: string, amount: number) => {
    let charName = "";
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          charName = c.name;
          return { ...c, currentHp: Math.min(c.maxHp, c.currentHp + amount) };
        }
        return c;
      })
    );
    logEvent("heal", `${charName} è stato curato di ${amount} HP`, elapsedSeconds);
  };

  const addSpell = (characterId: string, spell: Omit<Spell, "id">) => {
    let charName = "";
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          charName = c.name;
          return {
            ...c,
            spells: [
              ...c.spells,
              {
                ...spell,
                id: createCharacterId(),
              },
            ],
          };
        }
        return c;
      })
    );
    logEvent("spell_cast", `${charName} lancia ${spell.name}`, elapsedSeconds);
  };

  const removeSpell = (characterId: string, spellId: string) => {
    let spellName = "";
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          const spell = c.spells.find((s) => s.id === spellId);
          if (spell) spellName = spell.name;
          return { ...c, spells: c.spells.filter((s) => s.id !== spellId) };
        }
        return c;
      })
    );
    logEvent("spell_expired", `${spellName} è terminato`, elapsedSeconds);
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
    logEvent("combat_started", "Il combattimento è iniziato!", 0);
  };

  const nextTurn = useCallback(() => {
    if (characters.length === 0) return;
    const aliveCharacters = characters.filter((c) => c.currentHp > 0);
    if (aliveCharacters.length === 0) return;

    let nextIndex = currentTurnIndex + 1;
    let newRound = round;
    if (nextIndex >= characters.length) {
      nextIndex = 0;
      newRound = round + 1;
      setRound((r) => r + 1);
    }
    const activeName = characters[nextIndex]?.name ?? "Sconosciuto";
    if (newRound !== round) {
      logEvent("round_changed", `Inizia il round ${newRound}!`, elapsedSeconds);
    }
    logEvent("turn_changed", `Turno di ${activeName}`, elapsedSeconds);
    setCurrentTurnIndex(nextIndex);
  }, [characters, currentTurnIndex, round, logEvent]);

  const prevTurn = () => {
    if (characters.length === 0) return;

    let prevIndex = currentTurnIndex - 1;
    if (prevIndex < 0) {
      prevIndex = characters.length - 1;
      const newRound = Math.max(1, round - 1);
      setRound(newRound);
      logEvent("round_changed", `Si torna al round ${newRound}`, elapsedSeconds);
    }
    const activeName = characters[prevIndex]?.name ?? "Sconosciuto";
    logEvent("turn_changed", `Turno di ${activeName}`, elapsedSeconds);
    setCurrentTurnIndex(prevIndex);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const requestResetCombat = () => {
    setShowResetConfirm(true);
  };

  const cancelResetCombat = () => {
    setShowResetConfirm(false);
  };

  const confirmResetCombat = () => {
    setCharacters([]);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(false);
    setShowResetConfirm(false);
    logEvent("combat_reset", "Il combattimento è stato resettato", 0);
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
          onRequestReset={requestResetCombat}
          onToggleHistory={() => setShowHistory((v) => !v)}
        />
      )}

      {characters.length === 0 ? (
        <div className="fantasy-card animate-fade-in-up text-center py-16 sm:py-20 px-6">
          {/* Icone fantasy decorative */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-3xl sm:text-4xl opacity-60 -rotate-12">🛡️</span>
            <span className="text-4xl sm:text-5xl">⚔️</span>
            <span className="text-3xl sm:text-4xl opacity-60 rotate-12">🐉</span>
          </div>

          {/* Titolo evocativo */}
          <h2 className="font-medieval text-gold text-2xl sm:text-3xl mb-3">
            La Battaglia Attende...
          </h2>

          {/* Ornamento divisore */}
          <div className="ornament-divider mb-4 max-w-xs mx-auto">
            <span className="ornament-divider-icon">✦</span>
          </div>

          {/* Sottotitolo */}
          <p className="text-gold-dim/60 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            Evoca i tuoi guerrieri e le creature della notte per dare inizio
            allo scontro
          </p>

          {/* Indicazione */}
          <p className="text-stone-600 text-xs mt-6 flex items-center justify-center gap-1.5">
            <span>👆</span> Usa il form sopra per aggiungere il primo combattente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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

      {/* Modale di conferma reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="fantasy-card p-6 mx-4 max-w-sm w-full shadow-2xl shadow-black/50 animate-fade-in-up">
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>
              <h2 className="text-lg font-medieval font-bold text-gold">
                Resettare il combattimento?
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                Sei sicuro di voler resettare il combattimento? Tutti i
                personaggi e i progressi andranno persi.
              </p>
              <div className="ornament-divider">
                <span className="ornament-divider-icon">✦</span>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={cancelResetCombat}
                  className="fantasy-btn flex-1 px-4 py-2.5 bg-parchment-light text-stone-300 border border-border-gold hover:bg-parchment hover:border-border-gold-strong transition-all text-sm"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmResetCombat}
                  className="fantasy-btn flex-1 px-4 py-2.5 bg-red-900/80 text-red-200 border border-red-700/50 hover:bg-red-800 hover:border-red-600/60 transition-all text-sm"
                >
                  Conferma Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: dropdown menu */}
      <div className="lg:hidden">
        <CombatHistory
          events={[]}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </div>
    </div>
  );
}
