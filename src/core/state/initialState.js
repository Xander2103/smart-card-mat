import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  const players = [
    { id: 0, name: "Player 1" },
    { id: 1, name: "Player 2" },
    { id: 2, name: "Player 3" },
    { id: 3, name: "Player 4" },
  ];

  return {
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null,

    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    modeId: null,
    activeMode: null,
    gameMode: null,
    phase: "HOME",

    autoConfirm: true,
    devMode: false,
    showRecentCards: true,
    showCenterTrickLabel: true,
    deckSetup: false,
    deckIndex: 0,

    players,

    confirmedTurnCard: null,
    lastError: null,

    game: {},
  };
}