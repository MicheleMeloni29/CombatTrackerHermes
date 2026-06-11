// Component per la barra di controllo del combattimento, con timer, info sul round e personaggio attivo, e pulsanti per navigare tra i turni, resettare o terminare il combattimento. 

"use client";

import { useState } from "react";

interface CombatBarProps {
  isCombatStarted: boolean;
  currentTurnIndex: number;
  totalTurns: number;
  activeCharacterName: string | null;
  elapsedSeconds: number;
  aliveCount: number;
  deadCount: number;
  onSort: () => void;
  onStart: () => void;
  onPrevTurn: () => void;
  onNextTurn: () => void;
  onRequestReset: () => void;
  onEndCombat: () => void;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CombatBar({
  isCombatStarted,
  currentTurnIndex,
  totalTurns,
  activeCharacterName,
  elapsedSeconds,
  aliveCount,
  deadCount,
  onSort,
  onStart,
  onPrevTurn,
  onNextTurn,
  onRequestReset,
  onEndCombat,
}: CombatBarProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleEndCombat = () => {
    setShowEndConfirm(false);
    onEndCombat();
  };

  return (
    <div className="relative">
      {/* Modale conferma Termina Combattimento */}
      {showEndConfirm && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
          <div className="bg-parchment border border-border-gold rounded-lg p-4 shadow-2xl shadow-black/50 mx-2">
            <div className="text-center space-y-3">
              <div className="text-xl">⚔️</div>
              <h3 className="font-medieval text-gold text-sm font-bold">
                Terminare il combattimento?
              </h3>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Il combattimento verrà terminato, salva il combattimento o i tuoi progressi andranno persi.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 px-3 py-2 bg-parchment-light border border-border-gold rounded text-stone-300 hover:border-border-gold-strong hover:bg-parchment transition-colors text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  onClick={handleEndCombat}
                  className="flex-1 px-3 py-2 bg-amber-700 border border-amber-600 text-amber-50 rounded hover:bg-amber-600 transition-colors text-xs font-bold"
                >
                  Termina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale conferma Reset */}
      {showResetConfirm && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
          <div className="bg-parchment border border-border-gold rounded-lg p-4 shadow-2xl shadow-black/50 mx-2">
            <div className="text-center space-y-3">
              <div className="text-xl">⚠️</div>
              <h3 className="font-medieval text-gold text-sm font-bold">
                Resettare il combattimento?
              </h3>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Tutti i personaggi e i progressi andranno persi.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-3 py-2 bg-parchment-light border border-border-gold rounded text-stone-300 hover:border-border-gold-strong hover:bg-parchment transition-colors text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  onClick={() => { setShowResetConfirm(false); onRequestReset(); }}
                  className="flex-1 px-3 py-2 bg-red-900/80 border border-red-700/50 text-red-200 rounded hover:bg-red-800 transition-colors text-xs font-bold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra principale */}
      <div className="dd-card px-2 py-1 flex items-center gap-1.5 text-[11px]">
        {/* === SINISTRA: Info combattimento === */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCombatStarted ? (
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚔️</span>
              <span className="text-gold font-medieval font-bold uppercase tracking-wider text-[10px]">
                Preparazione
              </span>
            </div>
          ) : (
            <>
              {/* Timer */}
              <div className="flex items-center gap-1">
                <span className="text-sm">⏱</span>
                <span className="text-gold font-mono font-bold text-sm">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* Personaggio attivo */}
              <div className="flex items-center gap-1 bg-gold/10 border border-gold/25 rounded-full pl-1 pr-2.5 py-0.5">
                <span className="text-[10px]">🎯</span>
                <span className="text-gold-bright font-bold text-xs truncate max-w-[80px]">
                  {activeCharacterName ?? "—"}
                </span>
              </div>

              {/* Viti/Sconfitti */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400 font-bold">{aliveCount} ♥</span>
                {deadCount > 0 && (
                  <span className="text-red-400/70 font-bold">{deadCount} ☠</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* === CENTRO: Pulsanti azione === */}
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
          {!isCombatStarted ? (
            <>
              <button
                onClick={onSort}
                className="dd-btn dd-btn-sm"
              >
                ↕ Ordina
              </button>
              <button
                onClick={onStart}
                className="dd-btn dd-btn-sm"
              >
                <span className="mr-1">⚡</span> Inizia
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onPrevTurn}
                className="dd-btn dd-btn-sm w-7 h-7 flex items-center justify-center p-0"
                aria-label="Turno precedente"
              >
                ◀
              </button>

              <div className="flex items-center gap-1 px-1">
                <span className="text-gold font-medieval font-bold text-sm">
                  {currentTurnIndex + 1}
                </span>
                <span className="text-gold-dim/40 text-[11px]">/</span>
                <span className="text-gold-dim font-mono text-[11px]">
                  {totalTurns}
                </span>
              </div>

              <button
                onClick={onNextTurn}
                className="dd-btn dd-btn-sm w-7 h-7 flex items-center justify-center p-0"
                aria-label="Turno successivo"
              >
                ▶
              </button>
            </>
          )}
        </div>

        {/* === DESTRA: Azioni secondarie === */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Reset */}
          {isCombatStarted && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="dd-btn dd-btn-sm w-7 h-7 flex items-center justify-center p-0"
              title="Reset combattimento"
            >
              <span className="text-[10px]">↺</span>
            </button>
          )}

          {/* Termina Combattimento */}
          {isCombatStarted && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="dd-btn dd-btn-sm"
              title="Termina combattimento"
            >
              Fine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
