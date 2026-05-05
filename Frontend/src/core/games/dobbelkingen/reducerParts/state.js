// src/core/games/dobbelkingen/reducerParts/state.js

export const LOG_MAX = 200;

export function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

export function clampIndex(i, max) {
  if (max <= 0) return 0;
  return ((i % max) + max) % max;
}

export function inc(obj, key) {
  return { ...(obj ?? {}), [key]: ((obj?.[key] ?? 0) + 1) };
}

export function clearHandRuntimeFields() {
  return {
    confirmedTurnCard: null,
    pile: [],
    currentTrick: [],
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,
    usedCardCodes: [],
    usedCardSet: {},
    tricksPlayedInContract: 0,
  };
}

export function getStartDealerIndex(state, playersCount) {
  return clampIndex(
    typeof state.tableDealerSeat === "number"
      ? state.tableDealerSeat
      : 0,
    playersCount
  );
}

export function getDobbelState(state) {
  const playersCount = state.players?.length ?? 4;
  const startDealerIndex = getStartDealerIndex(state, playersCount);

  return state.game?.dobbelkingen ?? {
    chooserIndex: startDealerIndex,
    leaderIndex: clampIndex(startDealerIndex + 1, playersCount),
    currentPlayerIndex: startDealerIndex,
    contract: null,

    contracts: [
      "MINSTE_SLAGEN",
      "MINSTE_HARTEN",
      "HARTEN_KONING",
      "MINSTE_BOEREN_KONINGEN",
      "GEEN_SLAG_7_13",
      "MINSTE_QUEENS",
    ],
    contractPlays: {},
    lastContract: null,

    roundPhase: 1,
    troefPickCounts: Array(playersCount).fill(0),
    troefChooserIndex: startDealerIndex,
    currentTrumpSuit: null,
    currentContractStarterIndex: 0,

    totalScores: Array(playersCount).fill(0),
    lastResult: null,

    // persistence-ready
    history: [],
    matchSummary: null,
    matchStartedAt: null,
    matchFinishedAt: null,

    ...clearHandRuntimeFields(),
  };
}

export function setDobbelState(state, nextDobbel) {
  return {
    ...state,
    game: {
      ...(state.game ?? {}),
      dobbelkingen: nextDobbel,
    },
  };
}