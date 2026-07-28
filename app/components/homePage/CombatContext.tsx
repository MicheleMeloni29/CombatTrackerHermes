"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  autosaveCombatSave,
  CombatSavesApiError,
  createCombatSave,
  deleteCombatSave as deleteRemoteCombatSave,
  listCombatSaves,
  restoreCombatSave as restoreRemoteCombatSave,
  updateCombatSave,
} from "@/lib/combatSaves";
import {
  deleteCharacterTemplate,
  listSavedCharacters,
  saveCharacterTemplate,
} from "@/lib/savedCharacters";
import {
  moveCharacterByOffset,
  moveCharacterToIndex,
  resolveInitiativeOrder,
  resolvePreservedTurnIndex,
} from "@/lib/combatOrder";
import { fromSpellDurationSeconds } from "@/lib/spellDuration";
import type {
  Character,
  CharacterInput,
  MemorizedSpell,
  SpellCastInput,
} from "@/types/character";
import type { CombatLogEvent } from "@/types/combatLog";
import type { CombatSnapshot, SavedCombat } from "@/types/combatSave";
import type { SavedCharacter } from "@/types/savedCharacter";
import { useSessionAuth } from "../loginPage/SessionAuthProvider";

const CURRENT_COMBAT_STORAGE_KEY = "combat-tracker.current-combat";
const SAVED_COMBATS_STORAGE_KEY = "combat-tracker.saved-combats";
const ACTIVE_SAVE_STORAGE_KEY = "combat-tracker.active-save-id";
const AUTO_SAVE_INTERVAL_MS = 60 * 1000;

interface StorageKeys {
  currentCombat: string;
  savedCombats: string;
  activeSaveId: string;
}

function getStorageKeys(userId: string): StorageKeys {
  return {
    currentCombat: `${CURRENT_COMBAT_STORAGE_KEY}.${userId}`,
    savedCombats: `${SAVED_COMBATS_STORAGE_KEY}.${userId}`,
    activeSaveId: `${ACTIVE_SAVE_STORAGE_KEY}.${userId}`,
  };
}

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
  savedCharacters: SavedCharacter[];
  activeSavedCombatId: string | null;
  persistenceError: string;
  isHydrating: boolean;
  isSaving: boolean;
  isRestoring: boolean;
  isAutosaving: boolean;
  isCharacterLibraryLoading: boolean;
}

export interface CombatActions {
  addCharacter: (data: CharacterInput) => void;
  deleteSavedCharacter: (id: string) => Promise<boolean>;
  deleteCharacter: (id: string) => void;
  applyDamage: (id: string, amount: number) => void;
  applyHeal: (id: string, amount: number) => void;
  addSpell: (characterId: string, spell: SpellCastInput) => void;
  removeSpell: (characterId: string, spellId: string) => void;
  moveCharacter: (id: string, direction: "up" | "down") => void;
  moveCharacterTo: (id: string, insertionIndex: number) => void;
  setActiveTurn: (id: string) => void;
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
  restoreSavedCombat: (id: string) => Promise<boolean>;
  saveCurrentCombat: (
    name: string,
    options?: { overwriteId?: string }
  ) => Promise<boolean>;
  deleteSavedCombat: (id: string) => Promise<boolean>;
  clearPersistenceError: () => void;
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

function normalizeMemorizedSpells(input: unknown): MemorizedSpell[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const value = (entry as Record<string, unknown>).durationValue;
    const durationSeconds = (entry as Record<string, unknown>).durationSeconds;
    const unit = (entry as Record<string, unknown>).durationUnit;
    const name = (entry as Record<string, unknown>).name;

    if (
      typeof name !== "string" ||
      typeof durationSeconds !== "number" ||
      durationSeconds <= 0
    ) {
      return [];
    }

    const derived = fromSpellDurationSeconds(durationSeconds);

    return [
      {
        name,
        durationSeconds,
        durationValue: typeof value === "number" && value > 0 ? value : derived.value,
        durationUnit:
          unit === "seconds" || unit === "minutes" || unit === "hours" ? unit : derived.unit,
      },
    ];
  });
}

function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    spells: Array.isArray(character.spells) ? character.spells : [],
    memorizedSpells: normalizeMemorizedSpells(character.memorizedSpells),
  };
}

function normalizeSnapshot<T extends CombatSnapshot>(snapshot: T): T {
  return {
    ...snapshot,
    characters: snapshot.characters.map((character) => normalizeCharacter(character)),
  } as T;
}

function normalizeSavedCombat(save: SavedCombat): SavedCombat {
  return {
    ...normalizeSnapshot(save),
    isActive: save.isActive ?? false,
    createdAt: save.createdAt,
    updatedAt: save.updatedAt,
    lastAutosavedAt: save.lastAutosavedAt ?? null,
  };
}

function upsertMemorizedSpell(
  memorizedSpells: MemorizedSpell[],
  spell: SpellCastInput,
  fallback?: Partial<MemorizedSpell>
) {
  const normalizedName = spell.name.trim().toLocaleLowerCase();
  const nextMemorizedSpell: MemorizedSpell = {
    name: spell.name.trim(),
    durationSeconds: spell.durationSeconds,
    durationValue:
      fallback?.durationValue && fallback.durationValue > 0
        ? fallback.durationValue
        : fromSpellDurationSeconds(spell.durationSeconds).value,
    durationUnit: fallback?.durationUnit ?? fromSpellDurationSeconds(spell.durationSeconds).unit,
  };

  const remaining = memorizedSpells.filter(
    (entry) => entry.name.trim().toLocaleLowerCase() !== normalizedName
  );

  return [nextMemorizedSpell, ...remaining];
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
      .map((entry) => normalizeSavedCombat(entry))
      .sort((a, b) => b.savedAt - a.savedAt);
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
      return normalizeSnapshot(parsed as CombatSnapshot);
    }
  } catch {
    return null;
  }

  return null;
}

function sortSavedCombats(saves: SavedCombat[]) {
  return [...saves]
    .map((save) => normalizeSavedCombat(save))
    .sort((left, right) => right.savedAt - left.savedAt);
}

function resolvePersistenceError(error: unknown, fallback: string) {
  if (error instanceof CombatSavesApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function CombatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSessionAuth();
  const [log, setLog] = useState<CombatLogEvent[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCombatStarted, setIsCombatStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedCombats, setSavedCombats] = useState<SavedCombat[]>([]);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [activeSavedCombatId, setActiveSavedCombatId] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState("");
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isCharacterLibraryLoading, setIsCharacterLibraryLoading] = useState(true);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const characterRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevActiveCharacterIdRef = useRef<string | null>(null);
  const prevCombatStartedRef = useRef(isCombatStarted);
  const latestSnapshotRef = useRef<CombatSnapshot | null>(null);
  const activeSavedCombatIdRef = useRef<string | null>(null);
  const autosaveInFlightRef = useRef(false);
  const storageKeysRef = useRef<StorageKeys | null>(null);

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
    const keys = storageKeysRef.current;
    if (!keys) return;
    setPersistentStorageValue(keys.savedCombats, JSON.stringify(sortSavedCombats(next)));
  }, []);

  const persistActiveSavedCombatId = useCallback((id: string | null) => {
    const keys = storageKeysRef.current;
    if (!keys) return;

    if (id) {
      setPersistentStorageValue(keys.activeSaveId, id);
      return;
    }

    removePersistentStorageValue(keys.activeSaveId);
  }, []);

  const updateActiveSavedCombatId = useCallback(
    (id: string | null) => {
      activeSavedCombatIdRef.current = id;
      setActiveSavedCombatId(id);
      persistActiveSavedCombatId(id);
    },
    [persistActiveSavedCombatId]
  );

  const replaceSavedCombats = useCallback(
    (next: SavedCombat[]) => {
      const normalized = sortSavedCombats(next);
      setSavedCombats(normalized);
      persistSavedCombats(normalized);
    },
    [persistSavedCombats]
  );

  const upsertSavedCombatRecord = useCallback(
    (save: SavedCombat) => {
      const normalizedSave = normalizeSavedCombat(save);

      setSavedCombats((prev) => {
        const next = sortSavedCombats([
          normalizedSave,
          ...prev.filter((entry) => entry.id !== normalizedSave.id),
        ]);
        persistSavedCombats(next);
        return next;
      });
    },
    [persistSavedCombats]
  );

  const removeSavedCombatRecord = useCallback(
    (id: string) => {
      setSavedCombats((prev) => {
        const next = prev.filter((entry) => entry.id !== id);
        persistSavedCombats(next);
        return next;
      });
    },
    [persistSavedCombats]
  );

  const clearPersistenceError = useCallback(() => {
    setPersistenceError("");
  }, []);

  const restoreSnapshot = useCallback((snapshot: CombatSnapshot) => {
    const normalizedSnapshot = normalizeSnapshot(snapshot);

    setCharacters(normalizedSnapshot.characters);
    setCurrentTurnIndex(normalizedSnapshot.currentTurnIndex);
    setRound(normalizedSnapshot.round);
    setIsCombatStarted(normalizedSnapshot.isCombatStarted);
    setLog(normalizedSnapshot.log);
    setShowHistory(false);
  }, []);

  const clearCurrentCombatState = useCallback(() => {
    setCharacters([]);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsCombatStarted(false);
    setShowHistory(false);
    setLog([]);
    updateActiveSavedCombatId(null);
  }, [updateActiveSavedCombatId]);

  const deactivateRemoteSaveById = useCallback(
    async (saveId: string | null) => {
      if (!saveId || !user) return;

      try {
        const updatedSave = await updateCombatSave(saveId, { activate: false });
        upsertSavedCombatRecord(updatedSave);
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Impossibile disattivare l'autosave remoto. Controlla la connessione e riprova."
          )
        );
      }
    },
    [upsertSavedCombatRecord, user]
  );

  useEffect(() => {
    if (!user) return;

    storageKeysRef.current = getStorageKeys(user.id);
    const keys = storageKeysRef.current;
    const cachedSaves = parseSavedCombats(getPersistentStorageValue(keys.savedCombats));
    const cachedCurrentCombat = parseCurrentCombat(getPersistentStorageValue(keys.currentCombat));
    const cachedActiveSaveId = getPersistentStorageValue(keys.activeSaveId);
    const resolvedActiveSaveId = cachedSaves.some((entry) => entry.id === cachedActiveSaveId)
      ? cachedActiveSaveId
      : null;

    replaceSavedCombats(cachedSaves);
    updateActiveSavedCombatId(resolvedActiveSaveId);

    if (cachedCurrentCombat && isPersistableCombat(cachedCurrentCombat)) {
      restoreSnapshot(cachedCurrentCombat);
    } else {
      clearCurrentCombatState();
    }

    setIsStorageHydrated(true);
    setIsHydrating(true);

    return () => {
      storageKeysRef.current = null;
    };
  }, [clearCurrentCombatState, replaceSavedCombats, restoreSnapshot, updateActiveSavedCombatId, user]);

  useEffect(() => {
    if (!user || !isStorageHydrated) return;

    let isActive = true;

    const bootstrapRemoteData = async () => {
      clearPersistenceError();
      setIsHydrating(true);
      setIsCharacterLibraryLoading(true);

      try {
        const [remoteSaves, remoteCharacters] = await Promise.all([
          listCombatSaves(),
          listSavedCharacters(),
        ]);
        if (!isActive) return;

        replaceSavedCombats(remoteSaves);
        setSavedCharacters(remoteCharacters);
        const activeSave = remoteSaves.find((entry) => entry.isActive) ?? null;

        if (activeSave) {
          restoreSnapshot(activeSave);
          updateActiveSavedCombatId(activeSave.id);
        } else {
          updateActiveSavedCombatId(null);
        }
      } catch (error) {
        if (!isActive) return;

        setPersistenceError(
          resolvePersistenceError(
            error,
            "Impossibile caricare i dati da Supabase. Verifica la connessione e riprova."
          )
        );
      } finally {
        if (isActive) {
          setIsHydrating(false);
          setIsCharacterLibraryLoading(false);
        }
      }
    };

    void bootstrapRemoteData();

    return () => {
      isActive = false;
    };
  }, [clearPersistenceError, isStorageHydrated, replaceSavedCombats, restoreSnapshot, updateActiveSavedCombatId, user]);

  useEffect(() => {
    latestSnapshotRef.current = buildSnapshot();
  }, [buildSnapshot]);

  useEffect(() => {
    if (!isStorageHydrated) return;

    const keys = storageKeysRef.current;
    if (!keys) return;

    const snapshot = buildSnapshot();

    if (!isPersistableCombat(snapshot)) {
      removePersistentStorageValue(keys.currentCombat);
      return;
    }

    setPersistentStorageValue(keys.currentCombat, JSON.stringify(snapshot));
  }, [buildSnapshot, isStorageHydrated]);

  useEffect(() => {
    if (!user || !isStorageHydrated || !activeSavedCombatId || characters.length === 0) return;

    const intervalId = window.setInterval(() => {
      const snapshot = latestSnapshotRef.current;
      const currentSaveId = activeSavedCombatIdRef.current;

      if (!snapshot || !currentSaveId || !isPersistableCombat(snapshot) || autosaveInFlightRef.current) {
        return;
      }

      autosaveInFlightRef.current = true;
      setIsAutosaving(true);

      void autosaveCombatSave(currentSaveId, snapshot)
        .then((updatedSave) => {
          upsertSavedCombatRecord(updatedSave);
          updateActiveSavedCombatId(updatedSave.id);
        })
        .catch((error) => {
          setPersistenceError(
            resolvePersistenceError(
              error,
              "Autosave non riuscito. Il combattimento continua in locale finche' Supabase non torna disponibile."
            )
          );
        })
        .finally(() => {
          autosaveInFlightRef.current = false;
          setIsAutosaving(false);
        });
    }, AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeSavedCombatId, characters.length, isStorageHydrated, updateActiveSavedCombatId, upsertSavedCombatRecord, user]);

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

  const rememberCharacter = useCallback(
    async (data: CharacterInput) => {
      if (!user) return;

      try {
        const savedCharacter = await saveCharacterTemplate(user.id, data);
        setSavedCharacters((prev) => [
          savedCharacter,
          ...prev.filter((entry) => entry.id !== savedCharacter.id),
        ]);
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Il combattente e' stato aggiunto, ma non e' stato possibile salvarlo nella raccolta."
          )
        );
      }
    },
    [user]
  );

  const addCharacter = useCallback(
    (data: CharacterInput) => {
      clearPersistenceError();

      const nextCharacter: Character = {
        ...data,
        id: makeId(),
        currentHp: data.maxHp,
        spells: [],
        memorizedSpells: data.memorizedSpells ?? [],
      };

      setCharacters((prev) => {
        if (!isCombatStarted) return [...prev, nextCharacter];

        const activeCharacterId = prev[currentTurnIndex]?.id;
        const next = resolveInitiativeOrder([...prev, nextCharacter]);
        setCurrentTurnIndex(resolvePreservedTurnIndex(next, activeCharacterId));
        return next;
      });

      addEvent("character_added", `${data.name} si e' unito al combattimento`, 0);
      void rememberCharacter(data);
    },
    [addEvent, clearPersistenceError, currentTurnIndex, isCombatStarted, rememberCharacter]
  );

  const deleteSavedCharacter = useCallback(
    async (id: string) => {
      clearPersistenceError();

      try {
        await deleteCharacterTemplate(id);
        setSavedCharacters((prev) => prev.filter((entry) => entry.id !== id));
        return true;
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Eliminazione del personaggio salvato non riuscita."
          )
        );
        return false;
      }
    },
    [clearPersistenceError]
  );

  const deleteCharacter = useCallback(
    (id: string) => {
      clearPersistenceError();

      const characterName =
        characters.find((character) => character.id === id)?.name ?? "Personaggio";

      setCharacters((prev) => {
        const activeCharacterId = prev[currentTurnIndex]?.id;
        const removedIndex = prev.findIndex((character) => character.id === id);
        const next = prev.filter((character) => character.id !== id);

        const fallbackIndex =
          next.length === 0 ? 0 : removedIndex >= 0 && removedIndex < next.length ? removedIndex : 0;

        setCurrentTurnIndex(
          resolvePreservedTurnIndex(
            next,
            activeCharacterId !== id ? activeCharacterId : null,
            fallbackIndex
          )
        );

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
    [addEvent, characters, clearPersistenceError, currentTurnIndex, elapsedSeconds, updateActiveSavedCombatId]
  );

  const applyDamage = useCallback(
    (id: string, amount: number) => {
      clearPersistenceError();
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
    [addEvent, clearPersistenceError, elapsedSeconds]
  );

  const applyHeal = useCallback(
    (id: string, amount: number) => {
      clearPersistenceError();
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
    [addEvent, clearPersistenceError, elapsedSeconds]
  );

  const addSpell = useCallback(
    (characterId: string, spell: SpellCastInput) => {
      clearPersistenceError();
      let characterName = "";

      setCharacters((prev) =>
        prev.map((character) => {
          if (character.id !== characterId) return character;
          characterName = character.name;

          return {
            ...character,
            spells: [
              ...character.spells,
              {
                id: makeId(),
                name: spell.name,
                durationSeconds: spell.durationSeconds,
                castAtElapsedSeconds: spell.castAtElapsedSeconds,
              },
            ],
            memorizedSpells: upsertMemorizedSpell(character.memorizedSpells, spell, spell),
          };
        })
      );

      addEvent("spell_cast", `${characterName} lancia ${spell.name}`, elapsedSeconds);
    },
    [addEvent, clearPersistenceError, elapsedSeconds]
  );

  const removeSpell = useCallback(
    (characterId: string, spellId: string) => {
      clearPersistenceError();
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
    [addEvent, clearPersistenceError, elapsedSeconds]
  );

  const moveCharacter = useCallback(
    (id: string, direction: "up" | "down") => {
      clearPersistenceError();
      const offset = direction === "up" ? -1 : 1;

      setCharacters((prev) => {
        const next = moveCharacterByOffset(prev, id, offset);
        if (next === prev) return prev;

        setCurrentTurnIndex((current) => {
          const activeCharacterId = prev[current]?.id;
          return resolvePreservedTurnIndex(next, activeCharacterId, current);
        });

        return next;
      });
    },
    [clearPersistenceError]
  );

  const moveCharacterTo = useCallback(
    (id: string, insertionIndex: number) => {
      clearPersistenceError();

      setCharacters((prev) => {
        const next = moveCharacterToIndex(prev, id, insertionIndex);
        if (next === prev) return prev;

        setCurrentTurnIndex((current) => {
          const activeCharacterId = prev[current]?.id;
          return resolvePreservedTurnIndex(next, activeCharacterId, current);
        });

        return next;
      });
    },
    [clearPersistenceError]
  );

  const setActiveTurn = useCallback(
    (id: string) => {
      if (!isCombatStarted) return;

      const nextIndex = characters.findIndex((character) => character.id === id);
      if (nextIndex < 0 || nextIndex === currentTurnIndex) return;

      clearPersistenceError();
      setCurrentTurnIndex(nextIndex);
      addEvent("turn_changed", `Turno di ${characters[nextIndex].name}`, elapsedSeconds);
    },
    [addEvent, characters, clearPersistenceError, currentTurnIndex, elapsedSeconds, isCombatStarted]
  );

  const sortByInitiative = useCallback(() => {
    clearPersistenceError();
    setCharacters((prev) => {
      const activeCharacterId = isCombatStarted ? prev[currentTurnIndex]?.id : null;
      const next = resolveInitiativeOrder(prev);
      setCurrentTurnIndex(resolvePreservedTurnIndex(next, activeCharacterId));
      return next;
    });
  }, [clearPersistenceError, currentTurnIndex, isCombatStarted]);

  const startCombat = useCallback(() => {
    clearPersistenceError();
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
  }, [addEvent, characters, clearPersistenceError]);

  const nextTurn = useCallback(() => {
    clearPersistenceError();
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
  }, [addEvent, characters, clearPersistenceError, currentTurnIndex, elapsedSeconds, round]);

  const prevTurn = useCallback(() => {
    clearPersistenceError();
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
  }, [addEvent, characters, clearPersistenceError, currentTurnIndex, elapsedSeconds, round]);

  const requestResetCombat = useCallback(() => {
    clearPersistenceError();
    const currentActiveSaveId = activeSavedCombatIdRef.current;
    clearCurrentCombatState();
    void deactivateRemoteSaveById(currentActiveSaveId);
  }, [clearCurrentCombatState, clearPersistenceError, deactivateRemoteSaveById]);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const endCombat = useCallback(() => {
    clearPersistenceError();
    const currentActiveSaveId = activeSavedCombatIdRef.current;
    clearCurrentCombatState();
    void deactivateRemoteSaveById(currentActiveSaveId);
  }, [clearCurrentCombatState, clearPersistenceError, deactivateRemoteSaveById]);

  const restoreSavedCombat = useCallback(
    async (id: string) => {
      clearPersistenceError();
      setIsRestoring(true);

      try {
        const restoredSave = await restoreRemoteCombatSave(id);
        upsertSavedCombatRecord(restoredSave);
        restoreSnapshot(restoredSave);
        updateActiveSavedCombatId(restoredSave.id);
        return true;
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Ripristino non riuscito. Verifica che Supabase sia disponibile."
          )
        );
        return false;
      } finally {
        setIsRestoring(false);
      }
    },
    [clearPersistenceError, restoreSnapshot, updateActiveSavedCombatId, upsertSavedCombatRecord]
  );

  const saveCurrentCombat = useCallback(
    async (name: string, options?: { overwriteId?: string }) => {
      clearPersistenceError();
      const snapshot = latestSnapshotRef.current ?? buildSnapshot();
      const normalizedName = typeof name === "string" ? name.trim() : "";
      const overwriteId = options?.overwriteId?.trim() || "";

      if (!snapshot || !isPersistableCombat(snapshot) || !normalizedName) return false;

      setIsSaving(true);

      try {
        const savedCombat = overwriteId
          ? await updateCombatSave(overwriteId, {
              name: normalizedName,
              snapshot,
              activate: true,
            })
          : await createCombatSave({
              name: normalizedName,
              snapshot,
              activate: true,
            });

        upsertSavedCombatRecord(savedCombat);
        updateActiveSavedCombatId(savedCombat.id);
        return true;
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Salvataggio non riuscito. Verifica che Supabase sia disponibile."
          )
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [buildSnapshot, clearPersistenceError, updateActiveSavedCombatId, upsertSavedCombatRecord]
  );

  const deleteSavedCombat = useCallback(
    async (id: string) => {
      clearPersistenceError();

      try {
        await deleteRemoteCombatSave(id);
        removeSavedCombatRecord(id);

        if (activeSavedCombatIdRef.current === id) {
          updateActiveSavedCombatId(null);
        }
        return true;
      } catch (error) {
        setPersistenceError(
          resolvePersistenceError(
            error,
            "Eliminazione del salvataggio non riuscita. Riprova."
          )
        );
        return false;
      }
    },
    [clearPersistenceError, removeSavedCombatRecord, updateActiveSavedCombatId]
  );

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
    savedCharacters,
    activeSavedCombatId,
    persistenceError,
    isHydrating,
    isSaving,
    isRestoring,
    isAutosaving,
    isCharacterLibraryLoading,
  };
  const actions: CombatActions = {
    addCharacter,
    deleteSavedCharacter,
    deleteCharacter,
    applyDamage,
    applyHeal,
    addSpell,
    removeSpell,
    moveCharacter,
    moveCharacterTo,
    setActiveTurn,
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
    deleteSavedCombat,
    clearPersistenceError,
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
      savedCharacters: [],
      activeSavedCombatId: null,
      persistenceError: "",
      isHydrating: false,
      isSaving: false,
      isRestoring: false,
      isAutosaving: false,
      isCharacterLibraryLoading: false,
      addCharacter: () => {},
      deleteSavedCharacter: async () => false,
      deleteCharacter: () => {},
      applyDamage: () => {},
      applyHeal: () => {},
      addSpell: () => {},
      removeSpell: () => {},
      moveCharacter: () => {},
      moveCharacterTo: () => {},
      setActiveTurn: () => {},
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
      restoreSavedCombat: async () => false,
      saveCurrentCombat: async () => false,
      deleteSavedCombat: async () => false,
      clearPersistenceError: () => {},
    };
  }
  return ctx;
}

export { CombatLogProvider } from "./CombatLogProvider";
