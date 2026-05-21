"use client";

import { useMemo, useState } from "react";
import type { Character } from "@/types/character";

type FormState = {
  name: string;
  maxHp: string;
  initiative: string;
  isMonster: boolean;
};

const initialForm: FormState = {
  name: "",
  maxHp: "",
  initiative: "",
  isMonster: false,
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CombatTracker() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => {
      if (b.initiative !== a.initiative) {
        return b.initiative - a.initiative;
      }

      return a.name.localeCompare(b.name, "it");
    });
  }, [characters]);

  const activeCharacter =
    sortedCharacters.find((character) => character.id === activeCharacterId) ?? null;

  function handleAddCharacter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const maxHp = Number(form.maxHp);
    const initiative = Number(form.initiative);

    if (!name || Number.isNaN(maxHp) || Number.isNaN(initiative) || maxHp <= 0) {
      return;
    }

    const nextCharacter: Character = {
      id: createId(),
      name,
      maxHp,
      currentHp: maxHp,
      initiative,
      isMonster: form.isMonster,
    };

    setCharacters((current) => [...current, nextCharacter]);
    setActiveCharacterId((current) => current ?? nextCharacter.id);
    setForm(initialForm);
  }

  function updateHp(id: string, delta: number) {
    setCharacters((current) =>
      current.map((character) => {
        if (character.id !== id) {
          return character;
        }

        const currentHp = Math.min(
          character.maxHp,
          Math.max(0, character.currentHp + delta),
        );

        return { ...character, currentHp };
      }),
    );
  }

  function removeCharacter(id: string) {
    setCharacters((current) => current.filter((character) => character.id !== id));
    setActiveCharacterId((current) => (current === id ? null : current));
  }

  function advanceTurn() {
    if (sortedCharacters.length === 0) {
      return;
    }

    if (!activeCharacterId) {
      setActiveCharacterId(sortedCharacters[0].id);
      return;
    }

    const currentIndex = sortedCharacters.findIndex(
      (character) => character.id === activeCharacterId,
    );

    const nextIndex =
      currentIndex === -1 || currentIndex === sortedCharacters.length - 1
        ? 0
        : currentIndex + 1;

    setActiveCharacterId(sortedCharacters[nextIndex].id);
  }

  function resetEncounter() {
    setCharacters([]);
    setActiveCharacterId(null);
    setForm(initialForm);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-100">Nuovo partecipante</h2>
              <p className="text-sm text-stone-400">
                Aggiungi personaggi o mostri e ordina il turno per iniziativa.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleAddCharacter}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-300">
                <span>Nome</span>
                <input
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-400"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Es. Aramil"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-300">
                <span>Iniziativa</span>
                <input
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-400"
                  value={form.initiative}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, initiative: event.target.value }))
                  }
                  inputMode="numeric"
                  placeholder="15"
                  type="number"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="space-y-2 text-sm text-stone-300">
                <span>HP massimi</span>
                <input
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-400"
                  value={form.maxHp}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, maxHp: event.target.value }))
                  }
                  inputMode="numeric"
                  placeholder="27"
                  type="number"
                />
              </label>

              <label className="flex items-end gap-3 rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-300">
                <input
                  checked={form.isMonster}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isMonster: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span>Mostro</span>
              </label>
            </div>

            <button
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
              type="submit"
            >
              Aggiungi al combattimento
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">
            Turno attivo
          </p>
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-stone-950/60 p-5">
            {activeCharacter ? (
              <>
                <h3 className="text-2xl font-semibold text-amber-300">
                  {activeCharacter.name}
                </h3>
                <p className="mt-2 text-sm text-stone-300">
                  Iniziativa {activeCharacter.initiative} • HP {activeCharacter.currentHp}/
                  {activeCharacter.maxHp}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {activeCharacter.isMonster ? "Mostro" : "Personaggio"}
                </p>
              </>
            ) : (
              <p className="text-sm text-stone-400">
                Nessun turno attivo. Aggiungi un partecipante per iniziare.
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="flex-1 rounded-2xl bg-stone-100 px-4 py-3 font-medium text-stone-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={sortedCharacters.length === 0}
              onClick={advanceTurn}
              type="button"
            >
              Prossimo turno
            </button>
            <button
              className="rounded-2xl border border-stone-700 px-4 py-3 font-medium text-stone-200 transition hover:border-stone-500 hover:text-white"
              disabled={sortedCharacters.length === 0}
              onClick={resetEncounter}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-100">Ordine di iniziativa</h2>
            <p className="text-sm text-stone-400">
              I partecipanti vengono ordinati automaticamente dal piu rapido al piu lento.
            </p>
          </div>
          <span className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-400">
            {sortedCharacters.length} partecipanti
          </span>
        </div>

        {sortedCharacters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-700 p-8 text-center text-sm text-stone-500">
            La lista e vuota. Inserisci il primo personaggio o mostro.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCharacters.map((character, index) => {
              const isActive = character.id === activeCharacterId;
              const hpRatio = character.maxHp === 0 ? 0 : character.currentHp / character.maxHp;
              const barClass =
                hpRatio > 0.5
                  ? "bg-emerald-400"
                  : hpRatio > 0.25
                    ? "bg-amber-400"
                    : "bg-rose-500";

              return (
                <article
                  key={character.id}
                  className={`rounded-2xl border p-4 transition ${
                    isActive
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-stone-800 bg-stone-950/60"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-sm font-semibold text-stone-200">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-stone-100">
                            {character.name}
                          </h3>
                          <span className="rounded-full border border-stone-700 px-2 py-1 text-xs text-stone-400">
                            {character.isMonster ? "Mostro" : "PG"}
                          </span>
                        </div>
                        <p className="text-sm text-stone-400">
                          Iniziativa {character.initiative}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-80">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-stone-300">
                          <span>HP</span>
                          <span>
                            {character.currentHp}/{character.maxHp}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-800">
                          <div
                            className={`h-full rounded-full ${barClass}`}
                            style={{ width: `${Math.max(0, Math.min(100, hpRatio * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                          onClick={() => updateHp(character.id, -1)}
                          type="button"
                        >
                          -1 HP
                        </button>
                        <button
                          className="rounded-xl border border-emerald-500/40 px-3 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/10"
                          onClick={() => updateHp(character.id, 1)}
                          type="button"
                        >
                          +1 HP
                        </button>
                        <button
                          className="rounded-xl border border-stone-700 px-3 py-2 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-300"
                          onClick={() => setActiveCharacterId(character.id)}
                          type="button"
                        >
                          Rendi attivo
                        </button>
                        <button
                          className="rounded-xl border border-stone-700 px-3 py-2 text-sm text-stone-400 transition hover:border-stone-500 hover:text-white"
                          onClick={() => removeCharacter(character.id)}
                          type="button"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
