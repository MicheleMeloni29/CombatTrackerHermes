import type { SpellDurationUnit } from "@/types/character";

const UNIT_TO_SECONDS: Record<SpellDurationUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
};

export function toSpellDurationSeconds(value: number, unit: SpellDurationUnit) {
  return value * UNIT_TO_SECONDS[unit];
}

export function fromSpellDurationSeconds(totalSeconds: number): {
  value: number;
  unit: SpellDurationUnit;
} {
  if (totalSeconds > 0 && totalSeconds % UNIT_TO_SECONDS.hours === 0) {
    return {
      value: totalSeconds / UNIT_TO_SECONDS.hours,
      unit: "hours",
    };
  }

  if (totalSeconds > 0 && totalSeconds % UNIT_TO_SECONDS.minutes === 0) {
    return {
      value: totalSeconds / UNIT_TO_SECONDS.minutes,
      unit: "minutes",
    };
  }

  return {
    value: totalSeconds,
    unit: "seconds",
  };
}

export function formatSpellDurationLabel(value: number, unit: SpellDurationUnit) {
  if (unit === "hours") return `${value} ora${value === 1 ? "" : "e"}`;
  if (unit === "minutes") return `${value} minut${value === 1 ? "o" : "i"}`;
  return `${value} second${value === 1 ? "o" : "i"}`;
}

export function formatSpellCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "0:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
