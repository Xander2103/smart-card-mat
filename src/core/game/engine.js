// src/core/game/engine.js
import { getCardsOnTable, getTurnCard } from "./selectors";
import { computeScoresFromTrickHistory } from "./dobbelkingen";

/**
 * Central derived "game snapshot"
 * - pure
 * - no side effects
 * - UI can render this directly
 */
export function computeGameState(state) {
  const cardsOnTable = getCardsOnTable(state);
  const turnCard = getTurnCard(state);

  const pileCount = state.pile?.length ?? 0;
  const topCard = pileCount > 0 ? state.pile[pileCount - 1] : null;

  const warnings = [];
  if (state.turnZone != null && turnCard == null) {
    warnings.push("TurnZone is leeg of unmapped → turnCard = null.");
  }

  const canPlay = turnCard != null;

  const canConfirm =
    turnCard != null && state.confirmedTurnCard?.uid !== turnCard.uid;

  const playersCount = state.players?.length ?? 4;

  // ✅ derived scores (voor nu: MS = 1 punt per gewonnen slag)
  const scores = computeScoresFromTrickHistory(state.trickHistory, playersCount);

  // handig voor UI
  const currentPlayer = state.players?.[state.currentPlayerIndex] ?? null;

  return {
    cardsOnTable,
    turnCard,
    canPlay,
    canConfirm,
    warnings,
    pileCount,
    topCard,

    playersCount,
    scores,
    currentPlayer,
  };
}