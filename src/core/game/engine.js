// src/core/game/engine.js
import { getCardsOnTable, getTurnCard } from "./selectors";
import { computeScoresFromTrickHistory } from "./dobbelkingen";

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
  const scores = computeScoresFromTrickHistory(state.trickHistory ?? [], playersCount);

  return {
    cardsOnTable,
    turnCard,
    canPlay,
    canConfirm,
    warnings,
    pileCount,
    topCard,
    scores,
  };
}