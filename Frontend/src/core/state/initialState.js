import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
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

    // spelers worden gekozen via PlayersScreen
    players: [],

    // startdealer voor kaartspellen
    tableDealerSeat: 0,

    confirmedTurnCard: null,
    lastError: null,

    game: {},
  };
}