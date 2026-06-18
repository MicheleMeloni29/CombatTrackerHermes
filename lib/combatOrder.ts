import type { Character } from "@/types/character";

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
