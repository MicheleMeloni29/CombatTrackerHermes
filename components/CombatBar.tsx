"use client";

interface CombatBarProps {
  isCombatStarted: boolean;
  round: number;
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
  onToggleHistory: () => void;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CombatBar({
  isCombatStarted,
  round,
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
  onToggleHistory,
}: CombatBarProps) {
  return (
    <div className="bg-parchment/95 border-t border-border-gold px-3 py-2 flex items-center gap-3 text-xs">
      {/* Sinistra: info rapide */}
      <div className="flex items-center gap-2 shrink-0">
        {!isCombatStarted ? (
          <span className="text-gold font-medieval font-bold uppercase tracking-wider">
            Preparazione
          </span>
        ) : (
          <>
            <span className="bg-parchment-light border border-border-gold rounded px-2 py-1 text-gold font-medieval font-bold">
              R{round}
            </span>
            <span className="text-gold font-mono font-bold">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-gold-bright font-bold truncate max-w-[100px]">
              {activeCharacterName ?? "—"}
            </span>
          </>
        )}
      </div>

      {/* Centro: pulsanti azione */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {!isCombatStarted ? (
          <>
            <button
              onClick={onSort}
              className="px-3 py-1.5 bg-parchment-light border border-border-gold rounded text-foreground hover:border-border-gold-strong hover:bg-parchment transition-colors font-bold"
            >
              Ordina per Iniziativa
            </button>
            <button
              onClick={onStart}
              className="px-3 py-1.5 bg-gold/20 border border-gold/40 text-gold rounded hover:bg-gold/30 transition-colors font-bold"
            >
              Inizia Combattimento
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onPrevTurn}
              className="w-8 h-8 flex items-center justify-center bg-parchment-light border border-border-gold rounded hover:border-border-gold-strong hover:bg-parchment transition-colors text-gold"
              aria-label="Turno precedente"
            >
              ◀
            </button>
            <span className="text-gold-dim font-mono whitespace-nowrap">
              {currentTurnIndex + 1}/{totalTurns}
            </span>
            <button
              onClick={onNextTurn}
              className="w-8 h-8 flex items-center justify-center bg-parchment-light border border-border-gold rounded hover:border-border-gold-strong hover:bg-parchment transition-colors text-gold"
              aria-label="Turno successivo"
            >
              ▶
            </button>
          </>
        )}
      </div>

      {/* Destra: stats + reset + cronologia */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-stone-400">
          <span className="text-emerald-400 font-bold">{aliveCount}</span>v
          {deadCount > 0 && (
            <> · <span className="text-red-400 font-bold">{deadCount}</span>s</>
          )}
        </span>

        {isCombatStarted && (
          <button
            onClick={onToggleHistory}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded border border-border-gold text-stone-400 hover:text-gold hover:border-border-gold-strong transition-colors"
            aria-label="Cronologia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>
        )}

        <button
          onClick={onRequestReset}
          className="px-2 py-1 text-stone-500 hover:text-red-400 transition-colors font-bold"
          title="Reset combattimento"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
