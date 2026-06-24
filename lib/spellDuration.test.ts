import { describe, expect, it } from "vitest";
import {
  formatSpellCountdown,
  formatSpellDurationLabel,
  fromSpellDurationSeconds,
  toSpellDurationSeconds,
} from "./spellDuration";

describe("toSpellDurationSeconds", () => {
  it("converts seconds, minutes, and hours into seconds", () => {
    expect(toSpellDurationSeconds(45, "seconds")).toBe(45);
    expect(toSpellDurationSeconds(2, "minutes")).toBe(120);
    expect(toSpellDurationSeconds(3, "hours")).toBe(10800);
  });
});

describe("formatSpellCountdown", () => {
  it("formats short durations as minutes and seconds", () => {
    expect(formatSpellCountdown(75)).toBe("1:15");
  });

  it("formats long durations with hours", () => {
    expect(formatSpellCountdown(3665)).toBe("1:01:05");
  });
});

describe("fromSpellDurationSeconds", () => {
  it("restores the largest exact unit", () => {
    expect(fromSpellDurationSeconds(7200)).toEqual({ value: 2, unit: "hours" });
    expect(fromSpellDurationSeconds(180)).toEqual({ value: 3, unit: "minutes" });
    expect(fromSpellDurationSeconds(45)).toEqual({ value: 45, unit: "seconds" });
  });
});

describe("formatSpellDurationLabel", () => {
  it("formats duration labels in italian", () => {
    expect(formatSpellDurationLabel(1, "hours")).toBe("1 ora");
    expect(formatSpellDurationLabel(2, "minutes")).toBe("2 minuti");
    expect(formatSpellDurationLabel(30, "seconds")).toBe("30 secondi");
  });
});
