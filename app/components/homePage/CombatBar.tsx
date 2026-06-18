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

      <div className="rounded-3xl border border-border-gold/25 bg-background/95 p-3 shadow-2xl shadow-black/45 backdrop-blur-xl">
        {!isCombatStarted ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <ShieldCheck size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/55">
                  Preparazione
                </p>
                <p className="truncate text-sm font-black text-foreground">
                  {totalTurns} combattenti pronti
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={onSort}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 px-3 text-sm font-black text-gold transition hover:border-gold"
              >
                <ArrowDownUp size={17} />
                Ordina
              </button>
              <button
                type="button"
                onClick={onStart}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-sm font-black text-background transition hover:bg-gold-bright"
              >
                <Play size={17} />
                Inizia
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="min-w-0 rounded-2xl border border-gold/20 bg-gold/10 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dim/70">
                  <Swords size={13} />
                  Turno attivo
                </p>
                <p className="mt-0.5 truncate text-base font-black text-gold-bright">
                  {activeCharacterName ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-border-gold/20 bg-parchment/60 px-3 py-2 text-right">
                <p className="flex items-center justify-end gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dim/70">
                  <Timer size={13} />
                  Tempo
                </p>
                <p className="mt-0.5 font-mono text-base font-black text-foreground">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
              <button
                type="button"
                onClick={onPrevTurn}
                className="flex min-h-12 items-center justify-center rounded-2xl border border-border-gold/25 text-gold transition hover:border-gold"
                aria-label="Turno precedente"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="rounded-2xl bg-parchment/55 px-3 py-2 text-center">
                <p className="font-medieval text-xl text-gold">
                  {currentTurnIndex + 1}
                  <span className="mx-1 text-gold-dim/45">/</span>
                  {totalTurns}
                </p>
                <p className="flex items-center justify-center gap-2 text-[11px] font-bold text-gold-dim/60">
                  <Users size={13} />
                  {aliveCount} vivi
                  {deadCount > 0 ? ` · ${deadCount} KO` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onNextTurn}
                className="flex min-h-12 items-center justify-center rounded-2xl bg-gold text-background transition hover:bg-gold-bright"
                aria-label="Turno successivo"
              >
                <ChevronRight size={23} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirm("reset")}
                className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 text-xs font-black text-red-200 transition hover:bg-red-500/20"
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirm("end")}
                className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 text-xs font-black text-amber-100 transition hover:bg-amber-500/20"
              >
                <Flag size={15} />
                Termina
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
