import type { CharacterInput, MemorizedSpell } from "./character";

export interface SavedCharacter {
  id: string;
  name: string;
  maxHp: number;
  initiative: number;
  isMonster: boolean;
  icon: string;
  memorizedSpells: MemorizedSpell[];
  createdAt: string;
  updatedAt: string;
}

export function toCharacterInput(character: SavedCharacter): CharacterInput {
  return {
    name: character.name,
    maxHp: character.maxHp,
    initiative: character.initiative,
    isMonster: character.isMonster,
    icon: character.icon,
    memorizedSpells: character.memorizedSpells,
  };
}
