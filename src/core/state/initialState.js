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
    turnZone: null,

    // ui/debug/mapping
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // game mode flow
    activeMode: null, // "DOBBELKINGEN"
    gameMode: null,
    phase: "HOME", // "HOME" | "DOBBELKINGEN_READY" | "CHOOSING_CONTRACT" | "PLAYING_TRICK" | "DOBBELKINGEN_DONE"
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
    contractPlays: {}, // { CONTRACT: countPlayed } max 2
    lastContract: null,

    // per-contract run (1 handje = 13 slagen)
    tricksPlayedInContract: 0,
    usedCardSet: {},   // { "AC": true } duplicate detect (per contract)
    usedCardCodes: [], // debug lijst

    // last result / tussenstand
    lastResult: null, // { contract, winnerIndex, timestamp, scores:[..], penalties:[..] }

    // settings
    autoConfirm: true,

    // deck setup
    deckSetup: false,
    deckIndex: 0,

    // gameplay runtime
    confirmedTurnCard: null,
    pile: [],
    currentTrick: [],
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,

    players,
  };
}