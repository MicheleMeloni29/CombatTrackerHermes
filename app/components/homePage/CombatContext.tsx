"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { moveCharacterByOffset, resolveInitiativeOrder } from "@/lib/combatOrder";
import type { Character, Spell } from "@/types/character";
import type { CombatLogEvent } from "@/types/combatLog";
import type { CombatSnapshot, SavedCombat } from "@/types/combatSave";

const CURRENT_COMBAT_SESSION_KEY = "combat-tracker.current-combat";
const SAVED_COMBATS_SESSION_KEY = "combat-tracker.saved-combats";
const ACTIVE_SAVE_SESSION_KEY = "combat-tracker.active-save-id";
const AUTO_SAVE_INTERVAL_MS = 60 * 1000;
const MAX_SAVED_COMBATS = 5;

function getPersistentStorageValue(key: string) {
  if (typeof window === "undefined") return null;

  const localValue = window.localStorage.getItem(key);
  if (localValue !== null) return localValue;

  const legacySessionValue = window.sessionStorage.getItem(key);
  if (legacySessionValue !== null) {
    window.localStorage.setItem(key, legacySessionValue);
    window.sessionStorage.removeItem(key);
  }

  return legacySessionValue;
}

function setPersistentStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  window.sessionStorage.removeItem(key);
}

function removePersistentStorageValue(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

interface CombatLogCtx {
  log: CombatLogEvent[];
  addEvent: (type: CombatLogEvent["type"], message: string, timestamp?: number) => void;
  clearLog: () => void;
}

export interface CombatState {
  characters: Character[];
  currentTurnIndex: number;
  round: number;
  isCombatStarted: boolean;
  elapsedSeconds: number;
  aliveCount: number;
  deadCount: number;
  activeCharacterName: string | null;
  showHistory: boolean;
  savedCombats: SavedCombat[];
  activeSavedCombatId: string | null;
}

export interface CombatActions {
  addCharacter: (data: Omit<Character, "id" | "currentHp" | "spells">) => void;
  deleteCharacter: (id: string) => void;
  applyDamage: (id: string, amount: number) => void;
  applyHeal: (id: string, amount: number) => void;
  addSpell: (characterId: string, spell: Omit<Spell, "id">) => void;
  removeSpell: (characterId: string, spellId: string) => void;
  moveCharacter: (id: string, direction: "up" | "down") => void;
  sortByInitiative: () => void;
  startCombat: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  requestResetCombat: () => void;
  cancelResetCombat: () => void;
  confirmResetCombat: () => void;
  toggleHistory: () => void;
  endCombat: () => void;
  setCharacterRef: (id: string, el: HTMLDivElement | null) => void;
  restoreSavedCombat: (id: string) => void;
  saveCurrentCombat: (name: string) => void;
}

const CombatLogContext = createContext<CombatLogCtx | null>(null);
const CombatStateContext = createContext<(CombatState & CombatActions) | null>(null);

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function findScrollContainer(el: HTMLElement | null) {
  let parent = el?.parentElement ?? null;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);

    if (canScrollY && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function isPersistableCombat(snapshot: CombatSnapshot) {
  return snapshot.characters.length > 0;
}

function parseSavedCombats(raw: string | null): SavedCombat[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is SavedCombat => {
        return (
          entry &&
          typeof entry === "object" &&
          typeof entry.id === "string" &&
          typeof entry.name === "string" &&
          typeof entry.savedAt === "number" &&
          Array.isArray(entry.characters) &&
          Array.isArray(entry.log)
        );
      })
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, MAX_SAVED_COMBATS);
  } catch {
    return [];
  }
}

function parseCurrentCombat(raw: string | null): CombatSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.characters) &&
      Array.isArray(parsed.log) &&
      typeof parsed.currentTurnIndex === "number" &&
      typeof parsed.round === "number" &&
      typeof parsed.isCombatStarted === "boolean"
    ) {
      return parsed as CombatSnapshot;
    }
  } catch {
    return null;
  }

  return null;
}

export function CombatProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<CombatLogEvent[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCombatStarted, setIsCombatStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedCombats, setSavedCombats] = useState<SavedCombat[]>([]);
  const [activeSavedCombatId, setActiveSavedCombatId] = useState<string | null>(null);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const characterRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevActiveCharacterIdRef = useRef<string | null>(null);
  const prevCombatStartedRef = useRef(isCombatStarted);
  const latestSnapshotRef = useRef<CombatSnapshot | null>(null);
  const activeSavedCombatIdRef = useRef<string | null>(null);

  const addEvent = useCallback((type: CombatLogEvent["type"], message: string, timestamp = 0) => {
    setLog((prev) => [...prev, { id: makeId(), type, timestamp, message }]);
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const elapsedSeconds = isCombatStarted
    ? ((round - 1) * characters.length + currentTurnIndex) * 6
    : 0;

  const aliveCount = characters.filter((character) => character.currentHp > 0).length;
  const deadCount = characters.length - aliveCount;
  const activeCharacter = characters[currentTurnIndex] ?? null;

  const buildSnapshot = useCallback(
    (): CombatSnapshot => ({
      characters,
      currentTurnIndex,
      round,
      isCombatStarted,
      log,
    }),
    [characters, currentTurnIndex, round, isCombatStarted, log]
  );

  const persistSavedCombats = useCallback((next: SavedCombat[]) => {
    setPersistentStorageValue(SAVED_COMBATS_SESSION_KEY, JSON.stringify(next));
  }, []);

  const persistActiveSavedCombatId = useCallback((id: string | null) => {
    if (id) {
      setPersistentStorageValue(ACTIVE_SAVE_SESSION_KEY, id);
      return;
    }

    removePersistentStorageValue(ACTIVE_SAVE_SESSION_KEY);
  }, []);

  const updateActiveSavedCombatId = useCallback(
    (id: string | null) => {
      activeSavedCombatIdRef.current = id;
      setActiveSavedCombatId(id);
      persistActiveSavedCombatId(id);
    },
    [persistActiveSavedCombatId]
  );

  const restoreSnapshot = useCallback((snapshot: CombatSnapshot) => {
    setCharacters(snapshot.characters);
    setCurrentTurnIndex(snapshot.currentTurnIndex);
    setRound(snapshot.round);
    setIsCombatStarted(snapshot.isCombatStarted);
    setLog(snapshot.log);
    setShowHistory(false);
  }, []);

  const upsertSavedCombat = useCallback(
    (snapshot: CombatSnapshot, saveName: string, targetId?: string | null) => {
      if (!isPersistableCombat(snapshot)) return null;

      const effectiveId = targetId ?? makeId();
      const save: SavedCombat = {
        ...snapshot,
        id: effectiveId,
        name: saveName,
        savedAt: Date.now(),
      };

      setSavedCombats((prev) => {
        const withoutCurrent = prev.filter((entry) => entry.id !== effectiveId);
        const next = [save, ...withoutCurrent]
          .sort((left, right) => right.savedAt - left.savedAt)
          .slice(0, MAX_SAVED_COMBATS);
        persistSavedCombats(next);
        return next;
      });

      updateActiveSavedCombatId(effectiveId);
      return effectiveId;
    },
    [persistSavedCombats, updateActiveSavedCombatId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frameId = window.requestAnimationFrame(() => {
      const persistedSaves = parseSavedCombats(getPersistentStorageValue(SAVED_COMBATS_SESSION_KEY));
      const persistedCurrentCombat = parseCurrentCombat(
        getPersistentStorageValue(CURRENT_COMBAT_SESSION_KEY)
      );
      const persistedActiveSaveId = getPersistentStorageValue(ACTIVE_SAVE_SESSION_KEY);
      const resolvedActiveSaveId = persistedSaves.some((entry) => entry.id === persistedActiveSaveId)
        ? persistedActiveSaveId
        : null;

      setSavedCombats(persistedSaves);
      activeSavedCombatIdRef.current = resolvedActiveSaveId;
      setActiveSavedCombatId(resolvedActiveSaveId);

      if (!resolvedActiveSaveId) {
        removePersistentStorageValue(ACTIVE_SAVE_SESSION_KEY);
      }

      if (persistedCurrentCombat && isPersistableCombat(persistedCurrentCombat)) {
        restoreSnapshot(persistedCurrentCombat);
      }

      setIsStorageHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [restoreSnapshot]);

  useEffect(() => {
    latestSnapshotRef.current = buildSnapshot();
  }, [buildSnapshot]);

  useEffect(() => {
    if (!isStorageHydrated || typeof window === "undefined") return;

    const snapshot = buildSnapshot();

    if (!isPersistableCombat(snapshot)) {
      removePersistentStorageValue(CURRENT_COMBAT_SESSION_KEY);
      return;
    }

    setPersistentStorageValue(CURRENT_COMBAT_SESSION_KEY, JSON.stringify(snapshot));
  }, [buildSnapshot, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated || !activeSavedCombatId || characters.length === 0) return;

    const intervalId = window.setInterval(() => {
      const snapshot = latestSnapshotRef.current;
      const currentSaveId = activeSavedCombatIdRef.current;

      if (snapshot && currentSaveId) {
        const currentSave = savedCombats.find((entry) => entry.id === currentSaveId);
        if (currentSave) {
          upsertSavedCombat(snapshot, currentSave.name, currentSaveId);
        }
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeSavedCombatId, characters.length, isStorageHydrated, savedCombats, upsertSavedCombat]);

  useEffect(() => {
    const activeCharacterId = characters[currentTurnIndex]?.id ?? null;

    if (!isCombatStarted || !activeCharacterId) {
      prevActiveCharacterIdRef.current = activeCharacterId;
      prevCombatStartedRef.current = isCombatStarted;
      return;
    }

    const shouldScroll =
      !prevCombatStartedRef.current || prevActiveCharacterIdRef.current !== activeCharacterId;

    prevActiveCharacterIdRef.current = activeCharacterId;
    prevCombatStartedRef.current = isCombatStarted;

    if (!shouldScroll) return;

    const frameId = window.requestAnimationFrame(() => {
      const el = characterRowRefs.current.get(activeCharacterId);
      if (!el) return;

      if (isMobileViewport()) {
        el.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
        return;
      }

      const container = findScrollContainer(el);
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const rowRect = el.getBoundingClientRect();
      const targetTop =
        container.scrollTop +
        (rowRect.top - containerRect.top) -
        container.clientHeight / 2 +
        rowRect.height / 2;

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [characters, currentTurnIndex, isCombatStarted]);

  const setCharacterRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) characterRowRefs.current.set(id, el);
    else characterRowRefs.current.delete(id);
  }, []);

  const clearCurrentCombat = useCallback(() => {
    setCharacters([]);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(false);
    setShowHistory(false);
    setLog([]);
    updateActiveSavedCombatId(null);
  }, [updateActiveSavedCombatId]);

  const addCharacter = useCallback(
    (data: Omit<Character, "id" | "currentHp" | "spells">) => {
      const nextCharacter: Character = {
        ...data,
        id: makeId(),
        currentHp: data.maxHp,
        spells: [],
      };

      setCharacters((prev) => {
        if (!isCombatStarted) return [...prev, nextCharacter];

        return resolveInitiativeOrder([...prev, nextCharacter]);
      });

      addEvent("character_added", `${data.name} si e' unito al combattimento`, 0);
    },
    [addEvent, isCombatStarted]
  );

  const deleteCharacter = useCallback(
    (id: string) => {
      const characterName =
        characters.find((character) => character.id === id)?.name ?? "Personaggio";

      setCharacters((prev) => {
        const next = prev.filter((character) => character.id !== id);

        if (currentTurnIndex >= next.length) {
          setCurrentTurnIndex(Math.max(0, next.length - 1));
        }

        if (next.length === 0) {
          setIsCombatStarted(false);
          setRound(1);
          setLog([]);
          updateActiveSavedCombatId(null);
        }

        return next;
      });

      addEvent("character_deleted", `${characterName} e' stato rimosso`, elapsedSeconds);
    },
    [addEvent, characters, currentTurnIndex, elapsedSeconds, updateActiveSavedCombatId]
  );

  const applyDamage = useCallback(
    (id: string, amount: number) => {
      let characterName = "";

      setCharacters((prev) =>
        prev.map((character) => {
          if (character.id !== id) return character;
          characterName = character.name;

          return {
            ...character,
            currentHp: Math.max(0, character.currentHp - amount),
          };
        })
      );

      addEvent("damage", `${characterName} ha ricevuto ${amount} danni`, elapsedSeconds);
    },
    [addEvent, elapsedSeconds]
  );

  const applyHeal = useCallback(
    (id: string, amount: number) => {
      let characterName = "";

      setCharacters((prev) =>
        prev.map((character) => {
          if (character.id !== id) return character;
          characterName = character.name;

          return {
            ...character,
            currentHp: Math.min(character.maxHp, character.currentHp + amount),
          };
        })
      );

      addEvent("heal", `${characterName} e' stato curato di ${amount} HP`, elapsedSeconds);
    },
    [addEvent, elapsedSeconds]
  );

  const addSpell = useCallback(
    (characterId: string, spell: Omit<Spell, "id">) => {
      let characterName = "";

      setCharacters((prev) =>
        prev.map((character) => {
          if (character.id !== characterId) return character;
          characterName = character.name;

          return {
            ...character,
            spells: [...character.spells, { ...spell, id: makeId() }],
          };
        })
      );

      addEvent("spell_cast", `${characterName} lancia ${spell.name}`, elapsedSeconds);
    },
    [addEvent, elapsedSeconds]
  );

  const removeSpell = useCallback(
    (characterId: string, spellId: string) => {
      let spellName = "";

      setCharacters((prev) =>
        prev.map((character) => {
          if (character.id !== characterId) return character;

          const spell = character.spells.find((entry) => entry.id === spellId);
          if (spell) spellName = spell.name;

          return {
            ...character,
            spells: character.spells.filter((entry) => entry.id !== spellId),
          };
        })
      );

      addEvent("spell_expired", `${spellName} e' terminato`, elapsedSeconds);
    },
    [addEvent, elapsedSeconds]
  );

  const moveCharacter = useCallback((id: string, direction: "up" | "down") => {
    const offset = direction === "up" ? -1 : 1;

    setCharacters((prev) => {
      const next = moveCharacterByOffset(prev, id, offset);
      if (next === prev) return prev;

      setCurrentTurnIndex((current) => {
        const activeCharacterId = prev[current]?.id;
        if (!activeCharacterId) return current;
        const nextActiveIndex = next.findIndex((character) => character.id === activeCharacterId);
        return nextActiveIndex >= 0 ? nextActiveIndex : current;
      });

      return next;
    });
  }, []);

  const sortByInitiative = useCallback(() => {
    setCharacters((prev) => resolveInitiativeOrder(prev));
    setCurrentTurnIndex(0);
  }, []);

  const startCombat = useCallback(() => {
    if (characters.length === 0) return;

    const sortedCharacters = resolveInitiativeOrder(characters);
    const firstCharacterName = sortedCharacters[0]?.name ?? "Sconosciuto";

    setCharacters(sortedCharacters);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(true);
    addEvent("combat_started", "Il combattimento e' iniziato!", 0);
    addEvent("round_changed", "Inizia il round 1!", 0);
    addEvent("turn_changed", `Turno di ${firstCharacterName}`, 0);
  }, [addEvent, characters]);

  const nextTurn = useCallback(() => {
    if (characters.length === 0) return;
    if (characters.every((character) => character.currentHp <= 0)) return;

    let nextIndex = currentTurnIndex + 1;
    let nextRound = round;

    if (nextIndex >= characters.length) {
      nextIndex = 0;
      nextRound = round + 1;
      setRound((prev) => prev + 1);
    }

    const activeName = characters[nextIndex]?.name ?? "Sconosciuto";

    if (nextRound !== round) {
      addEvent("round_changed", `Inizia il round ${nextRound}!`, elapsedSeconds);
    }

    addEvent("turn_changed", `Turno di ${activeName}`, elapsedSeconds);
    setCurrentTurnIndex(nextIndex);
  }, [addEvent, characters, currentTurnIndex, elapsedSeconds, round]);

  const prevTurn = useCallback(() => {
    if (characters.length === 0) return;

    let prevIndex = currentTurnIndex - 1;

    if (prevIndex < 0) {
      prevIndex = characters.length - 1;
      const prevRound = Math.max(1, round - 1);
      setRound(prevRound);
      addEvent("round_changed", `Si torna al round ${prevRound}`, elapsedSeconds);
    }

    const activeName = characters[prevIndex]?.name ?? "Sconosciuto";
    addEvent("turn_changed", `Turno di ${activeName}`, elapsedSeconds);
    setCurrentTurnIndex(prevIndex);
  }, [addEvent, characters, currentTurnIndex, elapsedSeconds, round]);

  const requestResetCombat = useCallback(() => {
    clearCurrentCombat();
  }, [clearCurrentCombat]);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const endCombat = useCallback(() => {
    clearCurrentCombat();
  }, [clearCurrentCombat]);

  const restoreSavedCombat = useCallback(
    (id: string) => {
      const snapshot = savedCombats.find((entry) => entry.id === id);
      if (!snapshot) return;

      restoreSnapshot(snapshot);
      updateActiveSavedCombatId(snapshot.id);
    },
    [restoreSnapshot, savedCombats, updateActiveSavedCombatId]
  );

  const saveCurrentCombat = useCallback((name: string) => {
    const snapshot = latestSnapshotRef.current ?? buildSnapshot();
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!snapshot || !isPersistableCombat(snapshot) || !normalizedName) return;

    upsertSavedCombat(snapshot, normalizedName);
  }, [buildSnapshot, upsertSavedCombat]);

  const logCtx: CombatLogCtx = { log, addEvent, clearLog };
  const state: CombatState = {
    characters,
    currentTurnIndex,
    round,
    isCombatStarted,
    elapsedSeconds,
    aliveCount,
    deadCount,
    activeCharacterName: activeCharacter?.name ?? null,
    showHistory,
    savedCombats,
    activeSavedCombatId,
  };
  const actions: CombatActions = {
    addCharacter,
    deleteCharacter,
    applyDamage,
    applyHeal,
    addSpell,
    removeSpell,
    moveCharacter,
    sortByInitiative,
    startCombat,
    nextTurn,
    prevTurn,
    requestResetCombat,
    cancelResetCombat: () => {},
    confirmResetCombat: requestResetCombat,
    toggleHistory,
    endCombat,
    setCharacterRef,
    restoreSavedCombat,
    saveCurrentCombat,
  };

  return (
    <CombatLogContext.Provider value={logCtx}>
      <CombatStateContext.Provider value={{ ...state, ...actions }}>
        {children}
      </CombatStateContext.Provider>
    </CombatLogContext.Provider>
  );
}

export function useCombatLog() {
  const ctx = useContext(CombatLogContext);
  if (!ctx) {
    return { log: [], addEvent: () => {}, clearLog: () => {} };
  }
  return ctx;
}

export function useCombatState() {
  const ctx = useContext(CombatStateContext);
  if (!ctx) {
    return {
      characters: [],
      currentTurnIndex: 0,
      round: 1,
      isCombatStarted: false,
      elapsedSeconds: 0,
      aliveCount: 0,
      deadCount: 0,
      activeCharacterName: null,
      showHistory: false,
      savedCombats: [],
      activeSavedCombatId: null,
      addCharacter: () => {},
      deleteCharacter: () => {},
      applyDamage: () => {},
      applyHeal: () => {},
      addSpell: () => {},
      removeSpell: () => {},
      moveCharacter: () => {},
      sortByInitiative: () => {},
      startCombat: () => {},
      nextTurn: () => {},
      prevTurn: () => {},
      requestResetCombat: () => {},
      cancelResetCombat: () => {},
      confirmResetCombat: () => {},
      toggleHistory: () => {},
      endCombat: () => {},
      setCharacterRef: () => {},
      restoreSavedCombat: () => {},
      saveCurrentCombat: () => {},
    };
  }
  return ctx;
}

export { CombatLogProvider } from "./CombatLogProvider";
