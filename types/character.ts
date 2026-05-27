export interface Spell {
  id: string;
  name: string;
  durationSeconds: number;
  castAtElapsedSeconds: number;
}

export interface Character {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  initiative: number;
  isMonster: boolean;
  icon: string;
  spells: Spell[];
}
