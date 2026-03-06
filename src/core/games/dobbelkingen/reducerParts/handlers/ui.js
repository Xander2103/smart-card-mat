// src/core/games/dobbelkingen/reducerParts/handlers/ui.js
import { getDobbelState, setDobbelState, pushLog } from "../state";

export function handleDobbelUiAction(state, action) {
  const d = getDobbelState(state);

  if (action.type === "close_contract_overlay") {
    const nextLastResult = d.lastResult
      ? { ...d.lastResult, overlayClosed: true }
      : null;

    return setDobbelState(
      { ...state, lastError: null },
      { ...d, lastResult: nextLastResult }
    );
  }

  if (action.type === "adjust_total_score") {
    const playersCount = state.players?.length ?? 4;

    const playerIndex = Number(action.playerIndex);
    const delta = Number(action.delta);

    if (
      !Number.isFinite(playerIndex) ||
      playerIndex < 0 ||
      playerIndex >= playersCount
    ) {
      return state;
    }

    if (!Number.isFinite(delta) || delta === 0) return state;

    const prev = d.totalScores ?? Array(playersCount).fill(0);
    const nextTotal = prev.map((v, i) =>
      i === playerIndex ? (v ?? 0) + delta : (v ?? 0)
    );

    const nextLastResult = d.lastResult
      ? { ...d.lastResult, totalScores: nextTotal }
      : null;

    return setDobbelState(
      {
        ...state,
        lastError: null,
        log: pushLog(
          state.log,
          `SCORE_ADJUST|P${playerIndex}|DELTA=${delta}|TOTAL=${nextTotal[playerIndex]}`
        ),
      },
      {
        ...d,
        totalScores: nextTotal,
        lastResult: nextLastResult,
      }
    );
  }

  return state;
}