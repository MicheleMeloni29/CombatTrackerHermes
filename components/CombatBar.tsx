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
    <div className="sticky top-0 z-40 fantasy-card backdrop-blur-md bg-parchment/90 p-3 sm:p-4 space-y-3 sticky-bar-fade">
      {/* Header row con titolo + pulsante cronologia */}
      <div className="flex items-center justify-between">
        <span className="font-medieval text-gold text-sm uppercase tracking-wider">
          Combattimento
        </span>
        <button
          onClick={onToggleHistory}
          className="lg:hidden p-1.5 rounded-md bg-parchment-light border border-border-gold text-stone-300 hover:border-border-gold-strong hover:text-gold transition-colors"
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

      {/* Riga statistiche: sempre visibile */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {!isCombatStarted ? (
          <div className="flex items-center gap-2 bg-parchment px-3 py-1.5 rounded-lg border border-border-gold">
            <span className="text-stone-400 text-xs sm:text-sm">Stato</span>
            <span className="text-gold font-bold text-xs sm:text-sm">
              Preparazione
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-parchment px-3 py-1.5 rounded-lg border border-border-gold">
              <span className="text-stone-400 text-xs sm:text-sm">Round</span>
              <span className="text-gold font-medieval font-bold text-base sm:text-xl">
                {round}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-parchment px-3 py-1.5 rounded-lg border border-border-gold">
              <span className="text-stone-400 text-xs sm:text-sm">Timer</span>
              <span className="text-gold font-bold text-base sm:text-xl font-mono">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-parchment px-3 py-1.5 rounded-lg border border-border-gold">
              <span className="text-stone-400 text-xs sm:text-sm">Attivo</span>
              <span className="text-gold-bright font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
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

      {/* Riga pulsanti azione */}
      {!isCombatStarted ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onSort}
            className="flex-1 px-4 py-2.5 bg-parchment-light border border-border-gold text-foreground rounded-md hover:border-border-gold-strong hover:bg-parchment transition-colors text-sm font-bold"
          >
            Ordina per Iniziativa
          </button>

          <button
            onClick={onStart}
            className="flex-1 fantasy-btn fantasy-btn-gold text-sm font-bold"
          >
            Inizia Combattimento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Navigazione turni */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onPrevTurn}
              className="px-4 py-2.5 bg-parchment-light border border-border-gold text-foreground rounded-md hover:border-border-gold-strong hover:bg-parchment transition-colors text-sm font-bold"
            >
              ◀ Prec
            </button>
            <span className="text-gold-dim text-sm px-2 whitespace-nowrap">
              Turno {currentTurnIndex + 1} / {totalTurns}
            </span>
            <button
              onClick={onNextTurn}
              className="px-4 py-2.5 bg-parchment-light border border-border-gold text-foreground rounded-md hover:border-border-gold-strong hover:bg-parchment transition-colors text-sm font-bold"
            >
              Next ▶
            </button>
          </div>

          {/* Indicatore progresso turno */}
          <div className="h-0.5 bg-parchment-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${((currentTurnIndex + 1) / totalTurns) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Pulsante reset */}
      <button
        onClick={onRequestReset}
        className="w-full px-4 py-2.5 bg-parchment-light border border-border-gold text-stone-400 rounded-md hover:bg-red-800 hover:text-red-100 hover:border-red-700 active:bg-red-900 transition-colors text-sm font-bold"
      >
        Reset Combattimento
      </button>
    </div>
  );
}
