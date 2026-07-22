import type { Character } from "@/types/character";

type InitiativeRoller = () => number;

function rollD20InitiativeTieBreaker() {
  return Math.floor(Math.random() * 20) + 1;
}

function resolveTieByRoll(group: Character[], roll: InitiativeRoller): Character[] {
  if (group.length <= 1) return group;

  const rolledGroup = group
    .map((character) => ({
      character,
      roll: roll(),
    }))
    .sort((left, right) => right.roll - left.roll);

  const resolvedGroup: Character[] = [];

  for (let index = 0; index < rolledGroup.length; ) {
    const currentRoll = rolledGroup[index].roll;
    const sameRollEntries = [rolledGroup[index]];
    index += 1;

    while (index < rolledGroup.length && rolledGroup[index].roll === currentRoll) {
      sameRollEntries.push(rolledGroup[index]);
      index += 1;
    }

    if (sameRollEntries.length === 1) {
      resolvedGroup.push(sameRollEntries[0].character);
      continue;
    }

    resolvedGroup.push(...resolveTieByRoll(sameRollEntries.map((entry) => entry.character), roll));
  }

  return resolvedGroup;
}

export function resolveInitiativeOrder(
  characters: Character[],
  roll: InitiativeRoller = rollD20InitiativeTieBreaker
) {
  const byInitiative = [...characters].sort((left, right) => right.initiative - left.initiative);
  const resolved: Character[] = [];

  for (let index = 0; index < byInitiative.length; ) {
    const currentInitiative = byInitiative[index].initiative;
    const sameInitiativeGroup = [byInitiative[index]];
    index += 1;

    while (index < byInitiative.length && byInitiative[index].initiative === currentInitiative) {
      sameInitiativeGroup.push(byInitiative[index]);
      index += 1;
    }

    if (sameInitiativeGroup.length === 1) {
      resolved.push(sameInitiativeGroup[0]);
      continue;
    }

    resolved.push(...resolveTieByRoll(sameInitiativeGroup, roll));
  }

  return resolved;
}

export function moveCharacterByOffset(
  characters: Character[],
  characterId: string,
  offset: -1 | 1
) {
  const currentIndex = characters.findIndex((character) => character.id === characterId);
  const nextIndex = currentIndex + offset;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= characters.length) {
    return characters;
  }

  const next = [...characters];
  const [movedCharacter] = next.splice(currentIndex, 1);
  next.splice(nextIndex, 0, movedCharacter);
  return next;
}

export function moveCharacterToIndex(
  characters: Character[],
  characterId: string,
  insertionIndex: number
) {
  const currentIndex = characters.findIndex((character) => character.id === characterId);

  if (currentIndex < 0) return characters;

  const next = [...characters];
  const [movedCharacter] = next.splice(currentIndex, 1);
  const adjustedIndex = currentIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
  const nextIndex = Math.max(0, Math.min(next.length, adjustedIndex));

  if (nextIndex === currentIndex) return characters;

  next.splice(nextIndex, 0, movedCharacter);
  return next;
}

export function resolvePreservedTurnIndex(
  characters: Character[],
  activeCharacterId: string | null | undefined,
  fallbackIndex = 0
) {
  const preservedIndex = activeCharacterId
    ? characters.findIndex((character) => character.id === activeCharacterId)
    : -1;

  if (preservedIndex >= 0) return preservedIndex;
  if (characters.length === 0) return 0;
  return Math.max(0, Math.min(characters.length - 1, fallbackIndex));
}
