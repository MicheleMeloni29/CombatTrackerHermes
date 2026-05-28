"use client";

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
        <div className="min-h-screen bg-background">
          <div className="lg:hidden min-h-screen">
            <div className="mx-auto flex h-screen max-w-2xl flex-col px-2 pt-6 sm:px-4 sm:pt-12">
              <header className="mb-4 shrink-0 text-center sm:mb-8">
                <h1 className="text-3xl font-medieval tracking-tight text-gold sm:text-5xl">
                  Combat Tracker
                </h1>
                <div className="ornament-divider my-3 sm:my-4">
                  <span className="ornament-divider-icon">âš”</span>
                </div>
                <p className="mt-1 text-xs text-gold-dim/70 sm:mt-2 sm:text-sm">
                  Gestisci iniziativa, HP e turni per le tue sessioni di D&amp;D
                </p>
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

          <div className="hidden min-h-screen lg:grid lg:grid-cols-[280px_1fr_320px]">
            <aside className="flex flex-col items-start justify-start overflow-y-auto border-r border-gold-dim/20 bg-background/40 p-4 pt-12">
              <div className="sticky top-12 w-full max-w-[260px]">
                <MusicPlayer />
              </div>
            </aside>

            <main className="relative flex h-screen flex-col overflow-hidden">
              <div className="z-10 shrink-0 bg-background px-6 pb-4 pt-12 xl:px-10">
                <div className="mx-auto max-w-3xl text-center xl:max-w-4xl">
                  <h1 className="text-4xl font-medieval tracking-tight text-gold xl:text-5xl">
                    Combat Tracker
                  </h1>
                  <div className="ornament-divider my-3">
                    <span className="ornament-divider-icon">âš”</span>
                  </div>
                  <p className="mt-1 text-sm text-gold-dim/70 xl:text-base">
                    Gestisci iniziativa, HP e turni per le tue sessioni di D&amp;D
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-20 xl:px-10">
                <div className="mx-auto max-w-3xl xl:max-w-4xl">
                  <CombatTracker />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-border-gold bg-background/95 backdrop-blur-md">
                <div className="mx-auto max-w-3xl px-6 xl:max-w-4xl xl:px-10">
                  <CombatBarDesktop />
                </div>
              </div>
            </main>

            <aside className="overflow-y-auto border-l border-gold-dim/20 bg-background/40">
              <CombatHistorySidebar />
            </aside>
          </div>
        </div>
      </CombatProvider>
    </SessionLoginGate>
  );
}
