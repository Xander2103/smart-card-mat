import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  const players = [
    { id: 0, name: "Player 1" },
    { id: 1, name: "Player 2" },
    { id: 2, name: "Player 3" },
    { id: 3, name: "Player 4" },
  ];

  return {
    // zones / mat
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null, // legacy/debug

    // ui/debug/mapping
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // mode flow
    modeId: null,
    activeMode: null,
    gameMode: null,
    phase: "HOME",

    // settings
    autoConfirm: true,
    devMode: false,
    showRecentCards: true,
    deckSetup: false,
    deckIndex: 0,

    // players
    players,

    // shared runtime
    confirmedTurnCard: null,
    lastError: null,

    // game-specific state
    game: {},
  };
}