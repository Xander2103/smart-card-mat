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

export function getDobbelState(state) {
  const playersCount = state.players?.length ?? 4;

  return state.game?.dobbelkingen ?? {
    chooserIndex: 0,
    leaderIndex: 0,
    currentPlayerIndex: 0,
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

    totalScores: Array(playersCount).fill(0),
    lastResult: null,

    ...clearHandRuntimeFields(),
  };
}

export function setDobbelState(state, nextDobbel) {
  return { ...state, game: { ...(state.game ?? {}), dobbelkingen: nextDobbel } };
}
