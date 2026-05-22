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
  onReset: () => void;
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
  onReset,
}: CombatBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-stone-800 border border-amber-900/50 rounded-lg p-4">
      {!isCombatStarted ? (
        <>
          <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 text-sm">Stato</span>
            <span className="text-amber-400 font-bold text-sm">
              Preparazione
            </span>
          </div>

          <button
            onClick={onSort}
            className="px-4 py-2 bg-stone-700 text-stone-100 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
          >
            Ordina per Iniziativa
          </button>

          <button
            onClick={onStart}
            className="px-4 py-2 bg-amber-700 text-amber-50 rounded-md hover:bg-amber-600 transition-colors text-sm font-bold"
          >
            Inizia Combattimento
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 text-sm">Round</span>
            <span className="text-amber-400 font-bold text-xl font-mono">
              {round}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 text-sm">Timer</span>
            <span className="text-amber-400 font-bold text-xl font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 text-sm">Attivo</span>
            <span className="text-stone-100 font-bold text-sm">
              {activeCharacterName ?? "Nessuno"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevTurn}
              className="px-3 py-2 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
            >
              Prec
            </button>
            <span className="text-stone-300 text-sm px-2">
              Turno {currentTurnIndex + 1} / {totalTurns}
            </span>
            <button
              onClick={onNextTurn}
              className="px-3 py-2 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 transition-colors text-sm font-bold"
            >
              Next
            </button>
          </div>
        </>
      )}

      <button
        onClick={onReset}
        className="px-4 py-2 bg-stone-700 text-stone-300 rounded-md hover:bg-red-800 hover:text-red-100 transition-colors text-sm font-bold ml-auto"
      >
        Reset Combattimento
      </button>

      <div className="flex items-center gap-3 text-xs text-stone-400">
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
  );
}
