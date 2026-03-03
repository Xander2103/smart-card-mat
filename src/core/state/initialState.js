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
    turnZone: null,

    // ui/debug/mapping
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // game mode flow
    activeMode: null, // "DOBBELKINGEN"
    gameMode: null,
    phase: "HOME",
    chooserIndex: 0,
    leaderIndex: 0,
    currentPlayerIndex: 0,
    contract: null,

    // error
    lastError: null,

    // dobbelkingen contract loop
    contracts: [
      "MINSTE_SLAGEN",
      "MINSTE_HARTEN",
      "GEEN_HARTEN_KONING",
      "MINSTE_BOEREN_KONINGEN",
      "GEEN_SLAG_7_13",
      "MINSTE_QUEENS",
    ],
    contractPlays: {},
    lastContract: null,

    // ✅ totale score over alle contracten (blijft bestaan over contract resets)
    totalScores: Array.from({ length: players.length }, () => 0),

    // per-contract run (1 handje = 13 slagen)
    tricksPlayedInContract: 0,
    usedCardSet: {},
    usedCardCodes: [],

    // last result / tussenstand
    lastResult: null,

    // settings
    autoConfirm: true,

    // deck setup
    deckSetup: false,
    deckIndex: 0,

    // gameplay runtime (per contract)
    confirmedTurnCard: null,
    pile: [],
    currentTrick: [],
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,

    players,
  };
}