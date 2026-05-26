import { CombatLogProvider } from "@/components/CombatLogProvider";
import CombatTracker from "@/components/CombatTracker";
import MusicPlayer from "@/components/MusicPlayer";
import CombatHistorySidebar from "@/components/CombatHistorySidebar";

export default function Home() {
  return (
    <CombatLogProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile layout: singola colonna */}
        <div className="lg:hidden px-2 sm:px-4 pt-6 sm:pt-12 pb-8 max-w-2xl mx-auto">
          <header className="text-center mb-4 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-medieval text-gold tracking-tight">
              Combat Tracker
            </h1>
            <div className="ornament-divider my-3 sm:my-4">
              <span className="ornament-divider-icon">⚔</span>
            </div>
            <p className="text-gold-dim/70 mt-1 sm:mt-2 text-xs sm:text-sm">
              Gestisci iniziativa, HP e turni per le tue sessioni di D&D
            </p>
          </header>
          <CombatTracker />
        </div>

        {/* Desktop layout: 3 colonne */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr_320px] min-h-screen">
          {/* Colonna sinistra: Music Player */}
          <aside className="bg-background/40 border-r border-gold-dim/20 p-4 flex flex-col items-start justify-start pt-12 overflow-y-auto">
            <div className="w-full max-w-[260px] sticky top-12">
              <MusicPlayer />
            </div>
          </aside>

          {/* Colonna centrale: Contenuto principale */}
          <main className="px-6 xl:px-10 py-12 overflow-y-auto">
            <div className="max-w-3xl xl:max-w-4xl mx-auto">
              <header className="text-center mb-6">
                <h1 className="text-4xl xl:text-5xl font-medieval text-gold tracking-tight">
                  Combat Tracker
                </h1>
                <div className="ornament-divider my-3">
                  <span className="ornament-divider-icon">⚔</span>
                </div>
                <p className="text-gold-dim/70 mt-1 text-sm xl:text-base">
                  Gestisci iniziativa, HP e turni per le tue sessioni di D&D
                </p>
              </header>
              <CombatTracker />
            </div>
          </main>

          {/* Colonna destra: Cronologia */}
          <aside className="bg-background/40 border-l border-gold-dim/20 overflow-y-auto">
            <CombatHistorySidebar />
          </aside>
        </div>
      </div>
    </CombatLogProvider>
  );
}
