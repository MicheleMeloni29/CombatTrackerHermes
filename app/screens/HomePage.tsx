"use client";

import { useState } from "react";
import { CombatProvider } from "../components/homePage/CombatContext";
import CombatTracker from "../components/homePage/CombatTracker";
import MusicPlayer from "../components/homePage/MusicPlayer";
import CombatHistorySidebar from "../components/homePage/CombatHistorySidebar";
import CombatBarDesktop from "../components/homePage/CombatBarDesktop";
import SessionToolbar from "../components/homePage/SessionToolbar";

export default function HomePage() {
  return (
    <CombatProvider>
      <SessionToolbar />
      <div className="min-h-screen overflow-hidden bg-background">
        <div className="min-h-screen lg:hidden">
          <div className="mx-auto flex h-screen max-w-2xl flex-col px-2 pt-6 sm:px-4 sm:pt-12">
            <header className="mb-4 shrink-0 text-center sm:mb-8">
              <div className="ornament-divider my-3 sm:my-4">
                <h1 className="text-3xl font-medieval tracking-tight text-gold sm:text-5xl">
                  Combat Tracker
                </h1>
              </div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <FabMusicPlayer />
                <p className="text-xs text-gold-dim/70 sm:text-sm">
                  Gestisci iniziativa, HP e turni per le tue sessioni di D&amp;D
                </p>
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

        <div className="hidden h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="min-h-0 overflow-y-auto overscroll-contain border-r border-gold-dim/20 bg-background/40 p-4 pt-12">
            <div className="w-full max-w-[260px]">
              <MusicPlayer />
            </div>
          </aside>

          <main className="relative flex h-screen min-h-0 flex-col overflow-hidden">
            <div className="z-10 shrink-0 bg-background px-6 pb-4 pt-12 xl:px-10">
              <div className="mx-auto max-w-3xl text-center xl:max-w-4xl">
                <div className="ornament-divider my-3">
                  <h1 className="text-4xl font-medieval tracking-tight text-gold xl:text-5xl">
                    Combat Tracker
                  </h1>
                </div>
                <p className="mt-1 text-sm text-gold-dim/70 xl:text-base">
                  Crea i personaggi e gestisci iniziativa, HP e turni per le tue
                  battaglie di D&amp;D
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
  );
}

function FabMusicPlayer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border-gold bg-parchment p-3 shadow-2xl shadow-black/40 animate-fade-in-down">
          <MusicPlayer />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
          open
            ? "border-gold/50 bg-gold/20"
            : "border-border-gold bg-parchment-light hover:scale-105 hover:border-border-gold-strong"
        }`}
        title="Music Player"
      >
        Music
      </button>
    </div>
  );
}

function FabHistory() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      {open && (
        <div className="fixed bottom-0 right-3 top-14 z-50 flex w-80 max-w-[85vw] flex-col overflow-hidden rounded-tl-xl border-l border-border-gold bg-background shadow-2xl shadow-black/60">
          <div className="flex shrink-0 items-center justify-between border-b border-border-gold/30 px-3 py-2">
            <h2 className="font-medieval text-sm text-gold">Cronologia</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded text-xs text-stone-600 transition-colors hover:text-gold"
              aria-label="Chiudi"
            >
              X
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CombatHistorySidebar />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
          open
            ? "border-gold/50 bg-gold/20"
            : "border-border-gold bg-parchment-light hover:scale-105 hover:border-border-gold-strong"
        }`}
        title="Cronologia"
      >
        Log
      </button>
    </div>
  );
}
