import CombatTracker from "@/components/combat/CombatTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-start justify-center p-4 pt-8">
      <main className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 tracking-tight">
            ⚔️ Combat Tracker
          </h1>
          <p className="text-stone-400 mt-2 text-sm">
            Gestisci iniziativa, HP e turni per le tue sessioni di D&D
          </p>
        </header>
        <CombatTracker />
      </main>
    </div>
  );
}
