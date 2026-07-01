"use client";

import { ChevronDown, LogOut, Save, ScrollText, Shield, UserRound } from "lucide-react";
import { useState } from "react";
import { useCombatState } from "./CombatContext";
import SaveCombatDialog from "./SaveCombatDialog";
import { useSessionAuth } from "@/app/components/loginPage/SessionAuthProvider";

interface AppHeaderProps {
  activeLabel: string;
  onOpenSaves: () => void;
}

export default function AppHeader({ activeLabel, onOpenSaves }: AppHeaderProps) {
  const { user, logout } = useSessionAuth();
  const { characters, isCombatStarted, activeCharacterName, activeSavedCombatId, isAutosaving } =
    useCombatState();
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-gold/15 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <Shield size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black uppercase tracking-[0.2em] text-gold-dim/55">
              {activeLabel}
              {activeSavedCombatId ? (isAutosaving ? " · Autosalvataggio..." : " · Autosave attivo") : ""}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              <h1 className="truncate font-medieval text-xl text-gold sm:text-2xl">
                Combat Tracker
              </h1>
              {characters.length > 0 && (
                <span className="hidden rounded-full border border-border-gold/20 bg-parchment/60 px-2 py-0.5 text-xs font-black text-gold-dim sm:inline-flex">
                  {characters.length} combattenti
                </span>
              )}
            </div>
            {isCombatStarted && (
              <p className="mt-0.5 truncate text-xs font-bold text-gold-dim/65">
                Turno di {activeCharacterName ?? "-"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSaveOpen(true)}
              disabled={characters.length === 0}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 px-3 text-sm font-black text-gold transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              title="Salva combattimento"
            >
              <Save size={17} />
              <span className="hidden sm:inline">Salva</span>
            </button>

            <button
              type="button"
              onClick={onOpenSaves}
              className="hidden h-11 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 px-3 text-sm font-black text-gold-dim transition hover:border-gold hover:text-gold sm:flex"
            >
              <ScrollText size={17} />
              Salvataggi
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((value) => !value)}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border-gold/25 bg-parchment/60 px-3 text-sm font-black text-gold transition hover:border-gold"
                aria-expanded={isAccountOpen}
              >
                <UserRound size={17} />
                <span className="hidden max-w-28 truncate sm:inline">{user?.username ?? "Account"}</span>
                <ChevronDown size={15} />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border-gold/25 bg-background p-2 shadow-2xl shadow-black/60">
                  <div className="border-b border-border-gold/15 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dim/45">
                      Sessione
                    </p>
                    <p className="truncate text-sm font-black text-foreground">
                      {user?.username ?? "Utente"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountOpen(false);
                      void logout().catch(() => {});
                    }}
                    className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-black text-red-200 transition hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Disconnetti
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SaveCombatDialog isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} />
    </>
  );
}
