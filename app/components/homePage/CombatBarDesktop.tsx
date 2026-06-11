"use client";

import { useCombatState } from "./CombatContext";
import CombatBar from "./CombatBar";

export default function CombatBarDesktop() {
  const cs = useCombatState();

  if (cs.characters.length === 0) return null;

  return (
    <CombatBar
      isCombatStarted={cs.isCombatStarted}
      currentTurnIndex={cs.currentTurnIndex}
      totalTurns={cs.characters.length}
      activeCharacterName={cs.activeCharacterName}
      elapsedSeconds={cs.elapsedSeconds}
      aliveCount={cs.aliveCount}
      deadCount={cs.deadCount}
      onSort={cs.sortByInitiative}
      onStart={cs.startCombat}
      onPrevTurn={cs.prevTurn}
      onNextTurn={cs.nextTurn}
      onRequestReset={cs.requestResetCombat}
      onEndCombat={cs.endCombat}
    />
  );
}
