"use client";

import { History, Music2, Save, Swords } from "lucide-react";
import { useMemo, useState } from "react";
import AppBackground from "../components/homePage/AppBackground";
import AppHeader from "../components/homePage/AppHeader";
import BottomTabBar, { type AppTabItem } from "../components/homePage/BottomTabBar";
import { CombatProvider } from "../components/homePage/CombatContext";
import CombatTimeline from "../components/homePage/CombatTimeline";
import CombatTracker from "../components/homePage/CombatTracker";
import MusicPlayer from "../components/homePage/MusicPlayer";
import SavesPanel from "../components/homePage/SavesPanel";

const TABS: AppTabItem[] = [
  { id: "tracker", label: "Tracker", Icon: Swords },
  { id: "history", label: "Cronologia", Icon: History },
  { id: "music", label: "Musica", Icon: Music2 },
  { id: "saves", label: "Salvataggi", Icon: Save },
];

export default function HomePage() {
  return (
    <CombatProvider>
      <CombatAppShell />
    </CombatProvider>
  );
}

function CombatAppShell() {
  const [activeTab, setActiveTab] = useState("tracker");
  const activeLabel = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.label ?? "Tracker",
    [activeTab]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AppBackground />
      <AppHeader activeLabel={activeLabel} onOpenSaves={() => setActiveTab("saves")} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
        <aside className="sticky top-20 hidden self-start lg:block">
          <BottomTabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} variant="rail" />
          <div className="mt-4 rounded-3xl border border-border-gold/20 bg-background/45 p-4 shadow-xl shadow-black/20">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-dim/55">
              Modalita&apos;
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gold-dim/65">
              Layout mobile-first con sezioni separate per gestire la sessione senza pannelli sovrapposti.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          {activeTab === "tracker" && <CombatTracker />}
          {activeTab === "history" && <CombatTimeline />}
          <section
            className={`mx-auto w-full max-w-3xl space-y-4 pb-24 lg:pb-6 ${
              activeTab === "music" ? "" : "hidden"
            }`}
            aria-hidden={activeTab !== "music"}
          >
            <div className="rounded-3xl border border-border-gold/20 bg-background/45 p-4 shadow-xl shadow-black/20">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dim/60">
                Atmosfera
              </p>
              <h1 className="mt-1 font-medieval text-3xl text-gold">Musica</h1>
            </div>
            <MusicPlayer />
          </section>
          {activeTab === "saves" && <SavesPanel />}
        </main>
      </div>

      <BottomTabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
