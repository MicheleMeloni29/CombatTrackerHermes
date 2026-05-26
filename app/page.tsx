import CombatTracker from "@/components/CombatTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950 px-2 sm:px-4 pt-4 sm:pt-8 pb-8">
      <main className="w-full max-w-2xl lg:max-w-[50rem] mx-auto">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-amber-400 tracking-tight">
            Combat Tracker
          </h1>
          <p className="text-stone-400 mt-1 sm:mt-2 text-xs sm:text-sm">
            Gestisci iniziativa, HP e turni per le tue sessioni di D&D
          </p>
        </header>
        <CombatTracker />
      </main>
    </div>
  );
}
