import { describe, expect, it } from "vitest";
import type { Character } from "@/types/character";
import { moveCharacterByOffset } from "./combatOrder";

function character(id: string, name: string): Character {
  return {
    id,
    name,
    maxHp: 10,
    currentHp: 10,
    initiative: 10,
    isMonster: false,
    icon: "x",
    spells: [],
  };
}

describe("moveCharacterByOffset", () => {
  it("moves a character up or down without mutating the original order", () => {
    const original = [
      character("a", "A"),
      character("b", "B"),
      character("c", "C"),
    ];

    const movedUp = moveCharacterByOffset(original, "b", -1);
    const movedDown = moveCharacterByOffset(original, "b", 1);

    expect(movedUp.map((entry) => entry.id)).toEqual(["b", "a", "c"]);
    expect(movedDown.map((entry) => entry.id)).toEqual(["a", "c", "b"]);
    expect(original.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps order unchanged when movement would leave list bounds", () => {
    const original = [
      character("a", "A"),
      character("b", "B"),
      character("c", "C"),
    ];

    expect(moveCharacterByOffset(original, "a", -1)).toBe(original);
    expect(moveCharacterByOffset(original, "c", 1)).toBe(original);
    expect(moveCharacterByOffset(original, "missing", 1)).toBe(original);
  });
});
