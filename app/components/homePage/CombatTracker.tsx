"use client";

import { ArrowDownUp, Check, GripVertical, Plus, Settings2, ShieldCheck, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import { useCombatState } from "./CombatContext";
import AddCharacterDialog from "./AddCharacterDialog";
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
    moveCharacterTo,
    setActiveTurn,
    sortByInitiative,
    setCharacterRef,
  } = useCombatState();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [draggedCharacterId, setDraggedCharacterId] = useState<string | null>(null);
  const [dragOverCharacterId, setDragOverCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? null,
    [characters, selectedCharacterId]
  );
  const selectedIndex = selectedCharacter
    ? characters.findIndex((character) => character.id === selectedCharacter.id)
    : -1;
  const showInlineForm = characters.length === 0;
  const showAddDialog = isFormOpen && characters.length > 0;

  const endDrag = () => {
    setDraggedCharacterId(null);
    setDragOverCharacterId(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="space-y-2.5 pb-[calc(12rem+env(safe-area-inset-bottom))] sm:pb-[calc(13rem+env(safe-area-inset-bottom))] lg:pb-4">
        <section className="sticky top-[5.25rem] z-30 rounded-2xl border border-border-gold/20 bg-background/90 p-2.5 shadow-lg shadow-black/30 backdrop-blur-xl lg:top-[4.25rem]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/60">
                {isCombatStarted ? <Swords size={14} /> : <ShieldCheck size={14} />}
                {isCombatStarted ? "Combattimento live" : "Preparazione"}
              </p>
              <h1 className="mt-0.5 truncate font-medieval text-lg text-gold sm:text-xl">
                {characters.length === 0 ? "Prepara la battaglia" : `${characters.length} combattenti`}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {characters.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManageMode((value) => !value);
                    endDrag();
                  }}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-black transition ${
                    isManageMode
                      ? "border-gold bg-gold text-background"
                      : "border-border-gold/25 bg-parchment/60 text-gold hover:border-gold"
                  }`}
                  aria-pressed={isManageMode}
                >
                  {isManageMode ? <Check size={16} /> : <Settings2 size={16} />}
                  <span className="hidden sm:inline">{isManageMode ? "Fatto" : "Gestisci"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border-gold/25 bg-parchment/60 px-2.5 text-xs font-black text-gold transition hover:border-gold"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Combattente</span>
              </button>
            </div>
          </div>

          {showInlineForm && (
            <div className="mt-4">
              <CharacterForm
                onAdd={(character) => {
                  addCharacter(character);
                  setIsFormOpen(false);
                }}
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
          <section className="mx-auto w-full max-w-5xl space-y-2">
            {isManageMode && (
              <div className="flex flex-col gap-2 rounded-xl border border-gold/25 bg-gold/10 p-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold text-gold-dim/80">
                  <GripVertical className="shrink-0 text-gold" size={16} />
                  Trascina le righe oppure usa Su e Giu. Il turno attivo non cambia.
                </p>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gold px-2.5 text-[11px] font-black text-background"
                  >
                    <Plus size={14} />
                    Aggiungi
                  </button>
                  <button
                    type="button"
                    onClick={sortByInitiative}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-background/35 px-2.5 text-[11px] font-black text-gold"
                  >
                    <ArrowDownUp size={14} />
                    Ordina
                  </button>
                </div>
              </div>
            )}
            {characters.map((character, index) => {
              const isActive = isCombatStarted && index === currentTurnIndex;

              return (
                <div
                  key={character.id}
                  ref={(el) => setCharacterRef(character.id, el)}
                  className="scroll-mb-[12rem] sm:scroll-mb-[13rem] lg:scroll-mb-20"
                >
                  <CharacterCard
                    key={`${character.id}-${isManageMode ? "manage" : "quick"}`}
                    character={character}
                    index={index}
                    total={characters.length}
                    isActive={isActive}
                    isCombatStarted={isCombatStarted}
                    isManageMode={isManageMode}
                    isDragging={draggedCharacterId === character.id}
                    isDragOver={dragOverCharacterId === character.id}
                    elapsedSeconds={elapsedSeconds}
                    onSelect={() => setSelectedCharacterId(character.id)}
                    onDamage={(amount) => applyDamage(character.id, amount)}
                    onHeal={(amount) => applyHeal(character.id, amount)}
                    onDelete={() => deleteCharacter(character.id)}
                    onMove={(direction) => moveCharacter(character.id, direction)}
                    onSetActive={() => setActiveTurn(character.id)}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", character.id);
                      setDraggedCharacterId(character.id);
                      setDragOverCharacterId(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (draggedCharacterId && draggedCharacterId !== character.id) {
                        setDragOverCharacterId(character.id);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!draggedCharacterId || draggedCharacterId === character.id) {
                        endDrag();
                        return;
                      }

                      const bounds = event.currentTarget.getBoundingClientRect();
                      const insertAfter = event.clientY > bounds.top + bounds.height / 2;
                      moveCharacterTo(draggedCharacterId, index + (insertAfter ? 1 : 0));
                      endDrag();
                    }}
                    onDragEnd={endDrag}
                  />
                </div>
              );
            })}
          </section>
        )}
      </div>

      <div className="fixed inset-x-2 bottom-20 z-40 mx-auto max-w-3xl lg:sticky lg:bottom-4 lg:inset-x-auto lg:max-w-none">
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

      <AddCharacterDialog
        isOpen={showAddDialog}
        onAdd={(character) => {
          addCharacter(character);
          setIsFormOpen(false);
        }}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
