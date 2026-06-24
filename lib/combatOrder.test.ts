import { describe, expect, it } from "vitest";
import type { Character } from "@/types/character";
import { moveCharacterByOffset, resolveInitiativeOrder } from "./combatOrder";

function character(id: string, name: string, initiative = 10): Character {
  return {
    id,
    name,
    maxHp: 10,
    currentHp: 10,
    initiative,
    isMonster: false,
    icon: "x",
    spells: [],
    memorizedSpells: [],
  };
}

function sequenceRoller(...rolls: number[]) {
  let index = 0;

  return () => {
    const next = rolls[index];
    index += 1;

    if (next === undefined) {
      throw new Error("Missing mocked roll");
    }

    return next;
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

describe("resolveInitiativeOrder", () => {
  it("sorts characters by initiative descending", () => {
    const ordered = resolveInitiativeOrder([
      character("a", "A", 12),
      character("b", "B", 18),
      character("c", "C", 15),
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
  });

  it("uses a tie-break roll when two or more characters share the same initiative", () => {
    const ordered = resolveInitiativeOrder(
      [
        character("a", "A", 15),
        character("b", "B", 15),
        character("c", "C", 12),
      ],
      sequenceRoller(7, 18)
    );

    expect(ordered.map((entry) => entry.id)).toEqual(["b", "a", "c"]);
  });

  it("rerolls tied tie-break results until the order is resolved", () => {
    const ordered = resolveInitiativeOrder(
      [
        character("a", "A", 15),
        character("b", "B", 15),
        character("c", "C", 15),
      ],
      sequenceRoller(12, 12, 4, 19, 8)
    );

    expect(ordered.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });
});
