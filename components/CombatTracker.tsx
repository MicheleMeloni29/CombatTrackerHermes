"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "../types/character";

interface CharacterFormProps {
  onAdd: (char: Omit<Character, "id" | "currentHp">) => void;
}

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

function createCharacterId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function CharacterForm({ onAdd }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [maxHp, setMaxHp] = useState("");
  const [initiative, setInitiative] = useState("");
  const [isMonster, setIsMonster] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    const parsedMaxHp = Math.max(1, parseInt(maxHp) || 0);
    const parsedInitiative = Math.max(0, parseInt(initiative) || 0);

    if (!trimmed || parsedMaxHp < 1) return;

    onAdd({
      name: trimmed,
      maxHp: parsedMaxHp,
      initiative: parsedInitiative,
      isMonster,
    });

    setName("");
    setMaxHp("");
    setInitiative("");
    setIsMonster(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-stone-800 border border-amber-900/50 rounded-lg p-5 space-y-4"
    >
      <h2 className="text-amber-400 font-bold text-lg flex items-center gap-2">
        <span className="text-xl">Combat</span> Aggiungi Personaggio
      </h2>

      <div>
        <label className="block text-stone-300 text-sm mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Aragorn, Goblin #1..."
          className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-stone-300 text-sm mb-1">
            HP Massimi
          </label>
          <input
            type="number"
            value={maxHp}
            onChange={(e) => setMaxHp(e.target.value)}
            placeholder="Es. 27"
            min={1}
            className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-stone-300 text-sm mb-1">
            Iniziativa
          </label>
          <input
            type="number"
            value={initiative}
            onChange={(e) => setInitiative(e.target.value)}
            placeholder="Es. 15"
            min={0}
            max={30}
            className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isMonster}
            onChange={(e) => setIsMonster(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700" />
        </label>
        <span className="text-stone-300 text-sm">
          E&apos; un nemico?
          {isMonster && (
            <span className="ml-2 text-red-400 text-xs font-bold">MOSTRO</span>
          )}
        </span>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-amber-700 text-stone-100 font-bold rounded-md hover:bg-amber-600 active:bg-amber-800 transition-colors"
      >
        Aggiungi al Combattimento
      </button>
    </form>
  );
}

function CharacterRow({
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

export default function CombatTracker() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCombatStarted, setIsCombatStarted] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(6);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  const addCharacter = (data: Omit<Character, "id" | "currentHp">) => {
    const newChar: Character = {
      ...data,
      id: createCharacterId(),
      currentHp: data.maxHp,
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
        setTurnSecondsLeft(6);
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

  const sortByInitiative = () => {
    setCharacters((prev) => [...prev].sort((a, b) => b.initiative - a.initiative));
    setCurrentTurnIndex(0);
  };

  const startCombat = () => {
    if (characters.length === 0) return;

    setCharacters((prev) => [...prev].sort((a, b) => b.initiative - a.initiative));
    setCurrentTurnIndex(0);
    setRound(1);
    setTurnSecondsLeft(6);
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
    setTurnSecondsLeft(6);
  }, [characters, currentTurnIndex]);

  const prevTurn = () => {
    if (characters.length === 0) return;

    let prevIndex = currentTurnIndex - 1;
    if (prevIndex < 0) {
      prevIndex = characters.length - 1;
      setRound((r) => Math.max(1, r - 1));
    }

    setCurrentTurnIndex(prevIndex);
    setTurnSecondsLeft(6);
  };

  const resetCombat = () => {
    setCharacters([]);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(false);
    setTurnSecondsLeft(6);
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

  useEffect(() => {
    if (!isCombatStarted || characters.length === 0) {
      return;
    }

    const aliveCharacters = characters.filter((c) => c.currentHp > 0);
    if (aliveCharacters.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (turnSecondsLeft > 1) {
        setTurnSecondsLeft((current) => current - 1);
        return;
      }

      nextTurn();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [characters, isCombatStarted, nextTurn, turnSecondsLeft]);

  const aliveCount = characters.filter((c) => c.currentHp > 0).length;
  const deadCount = characters.length - aliveCount;
  const activeCharacter = characters[currentTurnIndex] ?? null;

  return (
    <div className="space-y-6">
      <CharacterForm onAdd={addCharacter} />

      {characters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-stone-800 border border-amber-900/50 rounded-lg p-4">
          {!isCombatStarted ? (
            <>
              <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-sm">Stato</span>
                <span className="text-amber-400 font-bold text-sm">
                  Preparazione
                </span>
              </div>

              <button
                onClick={sortByInitiative}
                className="px-4 py-2 bg-stone-700 text-stone-100 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
              >
                Ordina per Iniziativa
              </button>

              <button
                onClick={startCombat}
                className="px-4 py-2 bg-amber-700 text-amber-50 rounded-md hover:bg-amber-600 transition-colors text-sm font-bold"
              >
                Inizia Combattimento
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-sm">Round</span>
                <span className="text-amber-400 font-bold text-xl font-mono">
                  {round}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-sm">Timer</span>
                <span className="text-red-400 font-bold text-xl font-mono">
                  {turnSecondsLeft}s
                </span>
              </div>

              <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
                <span className="text-stone-400 text-sm">Attivo</span>
                <span className="text-stone-100 font-bold text-sm">
                  {activeCharacter?.name ?? "Nessuno"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevTurn}
                  className="px-3 py-2 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
                >
                  Prec
                </button>
                <span className="text-stone-300 text-sm px-2">
                  Turno {currentTurnIndex + 1} / {characters.length}
                </span>
                <button
                  onClick={nextTurn}
                  className="px-3 py-2 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
                >
                  Next
                </button>
              </div>
            </>
          )}

          <button
            onClick={resetCombat}
            className="px-4 py-2 bg-stone-700 text-stone-300 rounded-md hover:bg-red-800 hover:text-red-100 transition-colors text-sm font-bold ml-auto"
          >
            Reset Combattimento
          </button>

          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>
              <span className="text-emerald-400 font-bold">{aliveCount}</span>{" "}
              vivi
            </span>
            {deadCount > 0 && (
              <span>
                <span className="text-red-400 font-bold">{deadCount}</span>{" "}
                sconfitti
              </span>
            )}
          </div>
        </div>
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
              onDamage={applyDamage}
              onHeal={applyHeal}
              onDelete={deleteCharacter}
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
