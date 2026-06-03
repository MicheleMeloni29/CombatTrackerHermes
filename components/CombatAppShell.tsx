"use client";

import { useState } from "react";
import { CombatProvider } from "@/components/CombatContext";
import CombatTracker from "@/components/CombatTracker";
import MusicPlayer from "@/components/MusicPlayer";
import CombatHistorySidebar from "@/components/CombatHistorySidebar";
import CombatBarDesktop from "@/components/CombatBarDesktop";
import SessionLoginGate from "@/components/SessionLoginGate";
import SessionToolbar from "@/components/SessionToolbar";

export default function CombatAppShell() {
  return (
    <SessionLoginGate>
      <CombatProvider>
        <SessionToolbar />
        <div className="min-h-screen bg-background overflow-hidden">
          {/* ===== MOBILE: singola colonna ===== */}
          <div className="lg:hidden min-h-screen">
            <div className="mx-auto flex h-screen max-w-2xl flex-col px-2 pt-6 sm:px-4 sm:pt-12">
              <header className="mb-4 shrink-0 text-center sm:mb-8">
                <div className="ornament-divider my-3 sm:my-4">
                  <h1 className="text-3xl font-medieval tracking-tight text-gold sm:text-5xl">
                    Combat Tracker
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {/* FAB Music Player (sinistra) */}
                  <FabMusicPlayer />
                  <p className="text-xs text-gold-dim/70 sm:text-sm">
                    Gestisci iniziativa, HP e turni per le tue sessioni di D&amp;D
                  </p>
                  {/* FAB Cronologia (destra) */}
                  <FabHistory />
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
                <CombatTracker />
              </div>

              <div className="-mx-2 sticky bottom-0 z-30 shrink-0 border-t border-border-gold bg-background/95 backdrop-blur-md sm:-mx-4">
                <div className="px-2 sm:px-4">
                  <CombatBarDesktop />
                </div>
              </div>
            </div>
          </div>

      {/* DESKTOP: 3 colonne */}
      <div className="hidden h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="min-h-0 overflow-y-auto overscroll-contain border-r border-gold-dim/20 bg-background/40 p-4 pt-12">
              <div className="w-full max-w-[260px]">
                <MusicPlayer />
              </div>
            </aside>

            <main className="min-h-0 relative flex h-screen flex-col overflow-hidden">
              <div className="z-10 shrink-0 bg-background px-6 pb-4 pt-12 xl:px-10">
                <div className="mx-auto max-w-3xl text-center xl:max-w-4xl">
                  <div className="ornament-divider my-3">
                    <h1 className="text-4xl font-medieval tracking-tight text-gold xl:text-5xl">
                      Combat Tracker
                    </h1>
                  </div>
                  <p className="mt-1 text-sm text-gold-dim/70 xl:text-base">
                    Crea i personaggi e gestisci iniziativa, HP e turni per le tue battaglie di D&amp;D
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-16 xl:px-10">
                <div className="mx-auto max-w-3xl xl:max-w-4xl">
                  <CombatTracker />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30">
                <div className="pointer-events-auto">
                  <div className="mx-auto max-w-3xl px-6 xl:px-10">
                    <CombatBarDesktop />
                  </div>
                </div>
              </div>
            </main>

            <aside className="min-h-0 overflow-y-auto overscroll-contain border-l border-gold-dim/20 bg-background/40">
              <CombatHistorySidebar />
            </aside>
          </div>
        </div>
      </CombatProvider>
    </SessionLoginGate>
  );
}

/* ---- FAB Music Player (sinistra) ---- */
function FabMusicPlayer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-parchment border border-border-gold rounded-xl shadow-2xl shadow-black/40 p-3 animate-fade-in-down z-50">
          <MusicPlayer />
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all text-lg ${
          open
            ? "bg-gold/20 border-gold/50"
            : "bg-parchment-light border-border-gold hover:border-border-gold-strong hover:scale-105"
        }`}
        title="Music Player"
      >
        🎵
      </button>
    </div>
  );
}

/* ---- FAB Cronologia (destra) ---- */
function FabHistory() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      {open && (
        <div className="fixed top-14 right-3 bottom-0 w-80 max-w-[85vw] bg-background border-l border-border-gold shadow-2xl shadow-black/60 z-50 flex flex-col rounded-tl-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-gold/30 shrink-0">
            <h2 className="font-medieval text-gold text-sm">Cronologia</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:text-gold text-xs transition-colors"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CombatHistorySidebar />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all text-lg ${
          open
            ? "bg-gold/20 border-gold/50"
            : "bg-parchment-light border-border-gold hover:border-border-gold-strong hover:scale-105"
        }`}
        title="Cronologia"
      >
        📜
      </button>
    </div>
  );
}
