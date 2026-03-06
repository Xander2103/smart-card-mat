import { pushLog } from "../utils";
import { setDobbelState } from "../slice";

export function handleCloseContractOverlay(state, d) {
  const nextLastResult = d.lastResult ? { ...d.lastResult, overlayClosed: true } : null;
  const nextD = { ...d, lastResult: nextLastResult };
  return setDobbelState({ ...state, lastError: null }, nextD);
}

export function handleAdjustTotalScore(state, d, action) {
  const playersCount = state.players?.length ?? 4;

  const playerIndex = Number(action.playerIndex);
  const delta = Number(action.delta);

  if (!Number.isFinite(playerIndex) || playerIndex < 0 || playerIndex >= playersCount) return state;
  if (!Number.isFinite(delta) || delta === 0) return state;

  const prev = d.totalScores ?? Array(playersCount).fill(0);
  const nextTotal = prev.map((v, i) => (i === playerIndex ? (v ?? 0) + delta : (v ?? 0)));

  const nextLastResult = d.lastResult
    ? { ...d.lastResult, totalScores: nextTotal }
    : null;

  const nextD = {
    ...d,
    totalScores: nextTotal,
    lastResult: nextLastResult,
  };

  return setDobbelState(
    {
      ...state,
      lastError: null,
      log: pushLog(state.log, `SCORE_ADJUST|P${playerIndex}|DELTA=${delta}|TOTAL=${nextTotal[playerIndex]}`),
    },
    nextD
  );
}
