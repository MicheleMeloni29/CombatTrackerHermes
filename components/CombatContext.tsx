"use client";

import { createContext, useContext, useCallback, useRef, useState } from "react";
import type { Character, Spell } from "@/types/character";
import type { CombatLogEvent } from "@/types/combatLog";

// ---- Combat Log Context ----
interface CombatLogCtx {
  log: CombatLogEvent[];
  addEvent: (type: CombatLogEvent["type"], message: string, timestamp?: number) => void;
  clearLog: () => void;
}

const CombatLogContext = createContext<CombatLogCtx | null>(null);

// ---- Combat State Context ----
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
}

export interface CombatActions {
  addCharacter: (data: Omit<Character, "id" | "currentHp" | "spells">) => void;
  deleteCharacter: (id: string) => void;
  applyDamage: (id: string, amount: number) => void;
  applyHeal: (id: string, amount: number) => void;
  addSpell: (characterId: string, spell: Omit<Spell, "id">) => void;
  removeSpell: (characterId: string, spellId: string) => void;
  sortByInitiative: () => void;
  startCombat: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  requestResetCombat: () => void;
  cancelResetCombat: () => void;
  confirmResetCombat: () => void;
  toggleHistory: () => void;
  setCharacterRef: (id: string, el: HTMLDivElement | null) => void;
}

const CombatStateContext = createContext<(CombatState & CombatActions) | null>(null);

// ---- Helpers ----
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---- Provider ----
export function CombatProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<CombatLogEvent[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCombatStarted, setIsCombatStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const characterRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const addEvent = useCallback((type: CombatLogEvent["type"], message: string, timestamp = 0) => {
    setLog((prev) => [...prev, { id: makeId(), type, timestamp, message }]);
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const elapsedSeconds = isCombatStarted
    ? ((round - 1) * characters.length + currentTurnIndex) * 6
    : 0;

  const aliveCount = characters.filter((c) => c.currentHp > 0).length;
  const deadCount = characters.length - aliveCount;
  const activeCharacter = characters[currentTurnIndex] ?? null;

  // Auto-scroll al turno attivo
  const setCharacterRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) characterRowRefs.current.set(id, el);
    else characterRowRefs.current.delete(id);
  }, []);

  const prevTurnIdx = useRef(currentTurnIndex);
  if (prevTurnIdx.current !== currentTurnIndex && isCombatStarted) {
    prevTurnIdx.current = currentTurnIndex;
    const ch = characters[currentTurnIndex];
    if (ch) {
      const el = characterRowRefs.current.get(ch.id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }

  const addCharacter = useCallback((data: Omit<Character, "id" | "currentHp" | "spells">) => {
    const nc: Character = { ...data, id: makeId(), currentHp: data.maxHp, spells: [] };
    setCharacters((prev) => {
      if (!isCombatStarted) return [...prev, nc];
      const pos = prev.findIndex((c) => c.initiative < nc.initiative);
      if (pos === -1) return [...prev, nc];
      const list = [...prev];
      list.splice(pos, 0, nc);
      return list;
    });
    addEvent("character_added", `${data.name} si e' unito al combattimento`, 0);
  }, [isCombatStarted, addEvent]);

  const deleteCharacter = useCallback((id: string) => {
    const cn = characters.find((c) => c.id === id)?.name ?? "Personaggio";
    setCharacters((prev) => {
      const nl = prev.filter((c) => c.id !== id);
      if (currentTurnIndex >= nl.length) setCurrentTurnIndex(Math.max(0, nl.length - 1));
      if (nl.length === 0) { setIsCombatStarted(false); setRound(1); }
      return nl;
    });
    addEvent("character_deleted", `${cn} e' stato rimosso`, elapsedSeconds);
  }, [characters, currentTurnIndex, elapsedSeconds, addEvent]);

  const applyDamage = useCallback((id: string, amount: number) => {
    let n = "";
    setCharacters((prev) => prev.map((c) => { if (c.id === id) { n = c.name; return { ...c, currentHp: Math.max(0, c.currentHp - amount) }; } return c; }));
    addEvent("damage", `${n} ha ricevuto ${amount} danni`, elapsedSeconds);
  }, [elapsedSeconds, addEvent]);

  const applyHeal = useCallback((id: string, amount: number) => {
    let n = "";
    setCharacters((prev) => prev.map((c) => { if (c.id === id) { n = c.name; return { ...c, currentHp: Math.min(c.maxHp, c.currentHp + amount) }; } return c; }));
    addEvent("heal", `${n} e' stato curato di ${amount} HP`, elapsedSeconds);
  }, [elapsedSeconds, addEvent]);

  const addSpell = useCallback((cid: string, spell: Omit<Spell, "id">) => {
    let n = "";
    setCharacters((prev) => prev.map((c) => { if (c.id === cid) { n = c.name; return { ...c, spells: [...c.spells, { ...spell, id: makeId() }] }; } return c; }));
    addEvent("spell_cast", `${n} lancia ${spell.name}`, elapsedSeconds);
  }, [elapsedSeconds, addEvent]);

  const removeSpell = useCallback((cid: string, sid: string) => {
    let sn = "";
    setCharacters((prev) => prev.map((c) => { if (c.id === cid) { const sp = c.spells.find((s) => s.id === sid); if (sp) sn = sp.name; return { ...c, spells: c.spells.filter((s) => s.id !== sid) }; } return c; }));
    addEvent("spell_expired", `${sn} e' terminato`, elapsedSeconds);
  }, [elapsedSeconds, addEvent]);

  const sortByInitiative = useCallback(() => {
    setCharacters((prev) => [...prev].sort((a, b) => b.initiative - a.initiative));
    setCurrentTurnIndex(0);
  }, []);

  const startCombat = useCallback(() => {
    if (characters.length === 0) return;
    const sorted = [...characters].sort((a, b) => b.initiative - a.initiative);
    const fn = sorted[0]?.name ?? "Sconosciuto";
    setCharacters(sorted); setCurrentTurnIndex(0); setRound(1); setIsCombatStarted(true);
    addEvent("combat_started", "Il combattimento e' iniziato!", 0);
    addEvent("round_changed", "Inizia il round 1!", 0);
    addEvent("turn_changed", `Turno di ${fn}`, 0);
  }, [characters, addEvent]);

  const nextTurn = useCallback(() => {
    if (characters.length === 0) return;
    if (characters.filter((c) => c.currentHp > 0).length === 0) return;
    let ni = currentTurnIndex + 1;
    let nr = round;
    if (ni >= characters.length) { ni = 0; nr = round + 1; setRound((r) => r + 1); }
    const an = characters[ni]?.name ?? "Sconosciuto";
    if (nr !== round) addEvent("round_changed", `Inizia il round ${nr}!`, elapsedSeconds);
    addEvent("turn_changed", `Turno di ${an}`, elapsedSeconds);
    setCurrentTurnIndex(ni);
  }, [characters, currentTurnIndex, round, elapsedSeconds, addEvent]);

  const prevTurn = useCallback(() => {
    if (characters.length === 0) return;
    let pi = currentTurnIndex - 1;
    if (pi < 0) { pi = characters.length - 1; const nr = Math.max(1, round - 1); setRound(nr); addEvent("round_changed", `Si torna al round ${nr}`, elapsedSeconds); }
    const an = characters[pi]?.name ?? "Sconosciuto";
    addEvent("turn_changed", `Turno di ${an}`, elapsedSeconds);
    setCurrentTurnIndex(pi);
  }, [characters, currentTurnIndex, round, elapsedSeconds, addEvent]);

  const requestResetCombat = useCallback(() => {
    setCharacters([]); setCurrentTurnIndex(0); setRound(1); setIsCombatStarted(false);
    addEvent("combat_reset", "Il combattimento e' stato resettato", 0);
  }, [addEvent]);

  const toggleHistory = useCallback(() => setShowHistory((v) => !v), []);

  const logCtx: CombatLogCtx = { log, addEvent: addEvent as typeof addEvent, clearLog };
  const state: CombatState = {
    characters, currentTurnIndex, round, isCombatStarted, elapsedSeconds,
    aliveCount, deadCount, activeCharacterName: activeCharacter?.name ?? null, showHistory,
  };
  const actions: CombatActions = {
    addCharacter, deleteCharacter, applyDamage, applyHeal, addSpell, removeSpell,
    sortByInitiative, startCombat, nextTurn, prevTurn,
    requestResetCombat, cancelResetCombat: () => {}, confirmResetCombat: requestResetCombat,
    toggleHistory, setCharacterRef,
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
    // Fallback per SSR o quando usato fuori dal provider
    return { log: [], addEvent: () => {}, clearLog: () => {} };
  }
  return ctx;
}

export function useCombatState() {
  const ctx = useContext(CombatStateContext);
  if (!ctx) {
    // Fallback per SSR
    return {
      characters: [], currentTurnIndex: 0, round: 1, isCombatStarted: false,
      elapsedSeconds: 0, aliveCount: 0, deadCount: 0, activeCharacterName: null,
      showHistory: false,
      addCharacter: () => {}, deleteCharacter: () => {}, applyDamage: () => {},
      applyHeal: () => {}, addSpell: () => {}, removeSpell: () => {},
      sortByInitiative: () => {}, startCombat: () => {}, nextTurn: () => {},
      prevTurn: () => {}, requestResetCombat: () => {}, cancelResetCombat: () => {},
      confirmResetCombat: () => {}, toggleHistory: () => {}, setCharacterRef: () => {},
    };
  }
  return ctx;
}

export { CombatLogProvider } from "./CombatLogProvider";
