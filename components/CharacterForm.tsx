// Form per aggiungere un nuovo personaggio al combattimento
"use client";

import { useState } from "react";
import type { Character } from "../types/character";

interface CharacterFormProps {
  onAdd: (char: Omit<Character, "id" | "currentHp" | "spells">) => void;
}

export default function CharacterForm({ onAdd }: CharacterFormProps) {
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
      className="bg-stone-800 border border-amber-900/50 rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            className="w-full px-3 py-2.5 bg-stone-900 border border-stone-600 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-base"
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
            className="w-full px-3 py-2.5 bg-stone-900 border border-stone-600 rounded-md text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-base"
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
        className="w-full py-3 bg-amber-700 text-stone-100 font-bold rounded-md hover:bg-amber-600 active:bg-amber-800 transition-colors text-base"
      >
        Aggiungi al Combattimento
      </button>
    </form>
  );
}
