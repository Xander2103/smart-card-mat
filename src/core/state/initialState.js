import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  return {
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null,
    log: [],
    selectedUid: null,
    mapping: loadMapping(),
    autoConfirm: true,

    // ✅ nieuw
    confirmedTurnCard: null,
    pile: [],
    // dit is momenteel nog voor 4 spelers, maar kan later uitgebreid worden
    players: [
      { id: 0, name: "Player 1", score: 0 },
      { id: 1, name: "Player 2", score: 0 },
      { id: 2, name: "Player 3", score: 0 },
      { id: 3, name: "Player 4", score: 0 }
    ],
    currentPlayerIndex: 0,
    currentTrick: [],
    gameMode: "MS",
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,
  };
}