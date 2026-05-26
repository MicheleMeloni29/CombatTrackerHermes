// Barra di controllo del combattimento, con informazioni sul round, timer, personaggio attivo e pulsanti per navigare tra i turni o resettare il combattimento
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
    <div className="bg-stone-800 border border-amber-900/50 rounded-lg p-3 sm:p-4 space-y-3">
      {/* Header row with title + history button */}
      <div className="flex items-center justify-between">
        <span className="text-stone-500 text-xs uppercase tracking-wider font-semibold">
          Combattimento
        </span>
        <button
          onClick={onToggleHistory}
          className="lg:hidden p-1.5 rounded-md bg-stone-700 text-stone-300 hover:bg-stone-600 hover:text-stone-100 active:bg-stone-500 transition-colors"
          aria-label="Cronologia combattimento"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </button>
      </div>

      {/* Stats row: always visible */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {!isCombatStarted ? (
          <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-700">
            <span className="text-stone-400 text-xs sm:text-sm">Stato</span>
            <span className="text-amber-400 font-bold text-xs sm:text-sm">
              Preparazione
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 text-xs sm:text-sm">Round</span>
              <span className="text-amber-400 font-bold text-base sm:text-xl font-mono">
                {round}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 text-xs sm:text-sm">Timer</span>
              <span className="text-amber-400 font-bold text-base sm:text-xl font-mono">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 text-xs sm:text-sm">Attivo</span>
              <span className="text-stone-100 font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {activeCharacterName ?? "Nessuno"}
              </span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-400 ml-auto">
          <span>
            <span className="text-emerald-400 font-bold">{aliveCount}</span>{" "}
            vivi
          </span>
          {deadCount > 0 && (
            <span>
              <span className="text-red-400 font-bold">{deadCount}</span>{" "}
              sconfitti
            </span>
          )}
        </div>
      </div>

      {/* Action buttons row */}
      {!isCombatStarted ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onSort}
            className="flex-1 px-4 py-2.5 bg-stone-700 text-stone-100 rounded-md hover:bg-stone-600 active:bg-stone-500 transition-colors text-sm font-bold"
          >
            Ordina per Iniziativa
          </button>

          <button
            onClick={onStart}
            className="flex-1 px-4 py-2.5 bg-amber-700 text-amber-50 rounded-md hover:bg-amber-600 active:bg-amber-800 transition-colors text-sm font-bold"
          >
            Inizia Combattimento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Turn navigation */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onPrevTurn}
              className="px-4 py-2.5 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 active:bg-stone-500 transition-colors text-sm font-bold"
            >
              Prec
            </button>
            <span className="text-stone-300 text-sm px-2 whitespace-nowrap">
              Turno {currentTurnIndex + 1} / {totalTurns}
            </span>
            <button
              onClick={onNextTurn}
              className="px-4 py-2.5 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 active:bg-stone-500 transition-colors text-sm font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={onRequestReset}
        className="w-full px-4 py-2.5 bg-stone-700 text-stone-300 rounded-md hover:bg-red-800 hover:text-red-100 active:bg-red-900 transition-colors text-sm font-bold"
      >
        Reset Combattimento
      </button>
    </div>
  );
}
