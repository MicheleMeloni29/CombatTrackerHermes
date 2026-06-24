export type SpellDurationUnit = "seconds" | "minutes" | "hours";

export interface Spell {
  id: string;
  name: string;
  durationSeconds: number;
  castAtElapsedSeconds: number;
}

export interface MemorizedSpell {
  name: string;
  durationSeconds: number;
  durationValue: number;
  durationUnit: SpellDurationUnit;
}

export type SpellCastInput = Omit<Spell, "id"> &
  Partial<Pick<MemorizedSpell, "durationValue" | "durationUnit">>;

export interface Character {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  initiative: number;
  isMonster: boolean;
  icon: string;
  spells: Spell[];
  memorizedSpells: MemorizedSpell[];
}
