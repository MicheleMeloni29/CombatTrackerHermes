"use client";

import { Plus, ShieldCheck, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import { useCombatState } from "./CombatContext";
import CharacterCard from "./CharacterCard";
import CharacterDetailSheet from "./CharacterDetailSheet";
import CharacterForm from "./CharacterForm";
import CombatBarDesktop from "./CombatBarDesktop";

export default function CombatTracker() {
  const {
    characters,
    currentTurnIndex,
    isCombatStarted,
    elapsedSeconds,
    addCharacter,
    deleteCharacter,
    applyDamage,
    applyHeal,
    addSpell,
    removeSpell,
    moveCharacter,
    setCharacterRef,
  } = useCombatState();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? null,
    [characters, selectedCharacterId]
  );
  const selectedIndex = selectedCharacter
    ? characters.findIndex((character) => character.id === selectedCharacter.id)
    : -1;
  const showForm = isFormOpen || characters.length === 0;

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="space-y-4 pb-[calc(18rem+env(safe-area-inset-bottom))] sm:pb-[calc(19rem+env(safe-area-inset-bottom))] lg:pb-6">
        <section className="rounded-3xl border border-border-gold/20 bg-background/45 p-3 shadow-xl shadow-black/20 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/60">
                {isCombatStarted ? <Swords size={14} /> : <ShieldCheck size={14} />}
                {isCombatStarted ? "Combattimento live" : "Preparazione"}
              </p>
              <h1 className="mt-1 truncate font-medieval text-2xl text-gold sm:text-3xl">
                Combat Tracker
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen((value) => !value)}
              className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 bg-parchment/60 px-3 text-sm font-black text-gold transition hover:border-gold"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Combattente</span>
            </button>
          </div>

          {showForm && (
            <div className="mt-4">
              <CharacterForm
                onAdd={(character) => {
                  addCharacter(character);
                  setIsFormOpen(false);
                }}
                onCancel={characters.length > 0 ? () => setIsFormOpen(false) : undefined}
              />
            </div>
          )}
        </section>

        {characters.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border-gold/25 bg-parchment/35 p-6 text-center shadow-lg shadow-black/15">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gold/10 text-gold">
              <Swords size={26} />
            </div>
            <h2 className="font-medieval text-2xl text-gold">La battaglia attende</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gold-dim/60">
              Aggiungi il primo combattente per preparare iniziativa, HP e turni.
            </p>
          </section>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {characters.map((character, index) => (
              <div
                key={character.id}
                ref={(el) => setCharacterRef(character.id, el)}
                className="scroll-mb-[18rem] sm:scroll-mb-[19rem] lg:scroll-mb-24"
              >
                <CharacterCard
                  character={character}
                  index={index}
                  isActive={isCombatStarted && index === currentTurnIndex}
                  elapsedSeconds={elapsedSeconds}
                  onSelect={() => setSelectedCharacterId(character.id)}
                />
              </div>
            ))}
          </section>
        )}
      </div>

      <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-2xl lg:sticky lg:bottom-6 lg:inset-x-auto lg:max-w-none">
        <CombatBarDesktop />
      </div>

      <CharacterDetailSheet
        key={selectedCharacter?.id ?? "empty"}
        character={selectedCharacter}
        index={selectedIndex}
        total={characters.length}
        isActive={selectedIndex >= 0 && isCombatStarted && selectedIndex === currentTurnIndex}
        elapsedSeconds={elapsedSeconds}
        onClose={() => setSelectedCharacterId(null)}
        onDamage={applyDamage}
        onHeal={applyHeal}
        onDelete={deleteCharacter}
        onAddSpell={addSpell}
        onRemoveSpell={removeSpell}
        onMoveCharacter={moveCharacter}
      />
    </div>
  );
}
