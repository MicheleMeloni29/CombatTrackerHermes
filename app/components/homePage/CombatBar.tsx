"use client";

import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Flag,
  Play,
  RotateCcw,
  ShieldCheck,
  Swords,
  Timer,
  Users,
  X,
} from "lucide-react";
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
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "warning";
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 px-3 pb-6 backdrop-blur-sm sm:items-center sm:pb-0">
      <section className="w-full max-w-sm rounded-3xl border border-border-gold/25 bg-background p-4 shadow-2xl shadow-black/70">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dim/60">
              Conferma
            </p>
            <h3 className="mt-1 font-medieval text-xl text-gold">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gold/20 text-gold-dim"
            aria-label="Annulla"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-gold-dim/70">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-xl border border-border-gold/25 px-3 text-sm font-black text-gold-dim transition hover:border-border-gold"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-12 rounded-xl px-3 text-sm font-black text-white transition ${
              tone === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-amber-600 hover:bg-amber-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
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
  const [confirm, setConfirm] = useState<"reset" | "end" | null>(null);

  return (
    <>
      {confirm === "reset" && (
        <ConfirmDialog
          title="Resettare il combattimento?"
          message="Tutti i personaggi, i turni e la cronologia corrente verranno cancellati."
          confirmLabel="Reset"
          tone="danger"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            onRequestReset();
          }}
        />
      )}
      {confirm === "end" && (
        <ConfirmDialog
          title="Terminare il combattimento?"
          message="La sessione corrente verra' chiusa. Salvala prima se vuoi riprenderla piu' tardi."
          confirmLabel="Termina"
          tone="warning"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            onEndCombat();
          }}
        />
      )}

      <div className="rounded-2xl border border-border-gold/25 bg-background/95 p-2 shadow-2xl shadow-black/45 backdrop-blur-xl">
        {!isCombatStarted ? (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-dim/55">
                Preparazione
              </p>
              <p className="truncate text-xs font-black text-foreground">
                {totalTurns} combattenti pronti
              </p>
            </div>
            <button
              type="button"
              onClick={onSort}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border-gold/25 px-2.5 text-xs font-black text-gold transition hover:border-gold"
            >
              <ArrowDownUp size={15} />
              <span className="hidden min-[380px]:inline">Ordina</span>
            </button>
            <button
              type="button"
              onClick={onStart}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gold px-3 text-xs font-black text-background transition hover:bg-gold-bright"
            >
              <Play size={15} />
              Inizia
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-stretch gap-1.5">
              <button
                type="button"
                onClick={onPrevTurn}
                className="flex items-center justify-center rounded-xl border border-border-gold/25 text-gold transition hover:border-gold"
                aria-label="Turno precedente"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="min-w-0 rounded-xl border border-gold/20 bg-gold/10 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold-dim/70">
                  <span className="flex min-w-0 items-center gap-1">
                    <Swords className="shrink-0" size={11} />
                    Turno {currentTurnIndex + 1}/{totalTurns}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-mono tracking-normal text-foreground/80">
                    <Timer size={11} />
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm font-black text-gold-bright">
                  {activeCharacterName ?? "-"}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-gold-dim/60">
                  <Users size={11} />
                  {aliveCount} vivi{deadCount > 0 ? ` · ${deadCount} KO` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={onNextTurn}
                className="flex items-center justify-center rounded-xl bg-gold text-background transition hover:bg-gold-bright"
                aria-label="Turno successivo"
              >
                <ChevronRight size={21} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setConfirm("reset")}
                className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2 text-[10px] font-black text-red-200 transition hover:bg-red-500/20"
              >
                <RotateCcw size={13} />
                Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirm("end")}
                className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 text-[10px] font-black text-amber-100 transition hover:bg-amber-500/20"
              >
                <Flag size={13} />
                Termina
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
