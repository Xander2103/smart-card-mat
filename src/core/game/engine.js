// src/core/game/engine.js
import { getCardsOnTable, getTurnCard } from "./selectors";

/**
 * Central derived "game snapshot"
 * - pure
 * - no side effects
 * - UI can render this directly
 */
export function computeGameState(state) {
  const cardsOnTable = getCardsOnTable(state); // mapped cards only
  const turnCard = getTurnCard(state); // {zone, uid, card} or null
  const pileCount = state.pile?.length ?? 0;
  const topCard = pileCount > 0 ? state.pile[pileCount - 1] : null;

  const warnings = [];

  // Turn set, but not playable
  if (state.turnZone != null && turnCard == null) {
    warnings.push("TurnZone is leeg of unmapped → turnCard = null.");
  }

  // 1 simpele rule: je mag spelen als turnCard bestaat
  const canPlay = turnCard != null;

  // ✅ extra rule: confirm alleen als er een turnCard is én niet dezelfde als confirmed
  const canConfirm =
    turnCard != null && state.confirmedTurnCard?.uid !== turnCard.uid;

  return { cardsOnTable, turnCard, canPlay, canConfirm, warnings, pileCount, topCard };
}