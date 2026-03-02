import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  const players = [
    { id: 0, name: "Player 1", score: 0 },
    { id: 1, name: "Player 2", score: 0 },
    { id: 2, name: "Player 3", score: 0 },
    { id: 3, name: "Player 4", score: 0 },
  ];

  return {
    // zones
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null,

    // ui/debug/mapping
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // game meta
    gameMode: null,                // "DOBBELKINGEN" of andere later
    phase: "IDLE",                 // "IDLE" | "CHOOSING_CONTRACT" | "PLAYING_TRICK"
    chooserIndex: 0,               // wie kiest contract
    contract: null,                // bv "MINSTE_SLAGEN"
    leaderIndex: 0,
    currentPlayerIndex: 0,
    turnZone: null,                // zolang confirm_turn dit nodig heeft

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