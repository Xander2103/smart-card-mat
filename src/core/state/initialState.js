// src/core/state/initialState.js
import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  const players = [
    { id: 0, name: "Player 1", score: 0 },
    { id: 1, name: "Player 2", score: 0 },
    { id: 2, name: "Player 3", score: 0 },
    { id: 3, name: "Player 4", score: 0 },
  ];

  return {
    // zones / mat
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null, // zolang confirm_turn hierop steunt

    // ui/debug/mapping
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // game mode flow
    activeMode: null, // "DOBBELKINGEN" (UI selection)
    gameMode: null,   // idem, maar je kan dit later splitten indien nodig
    phase: "HOME",    // "HOME" | "DOBBELKINGEN_READY" | "CHOOSING_CONTRACT" | "PLAYING_TRICK"
    chooserIndex: 0,
    leaderIndex: 0,
    currentPlayerIndex: 0,
    contract: null, // bv "MINSTE_SLAGEN"

    // settings
    autoConfirm: true,

    // deck setup
    deckSetup: false,
    deckIndex: 0,

    // gameplay runtime
    confirmedTurnCard: null,
    pile: [],
    players,
    currentTrick: [],
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,
  };
}