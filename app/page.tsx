import CombatTracker from "@/components/CombatTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-2 sm:px-4 pt-6 sm:pt-12 pb-8">
      <main className="w-full max-w-2xl lg:max-w-[50rem] mx-auto">
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
      </main>
    </div>
  );
}
