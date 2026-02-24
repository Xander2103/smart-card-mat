// src/core/game/engine.js
import { getMappedCardsOnTable, getTurnCard } from "./selectors";

/**
 * 1 centrale plek voor "game state" (derived state)
 * - puur
 * - geen side effects
 */
export function computeGameState(appState) {
  const cardsOnTable = getMappedCardsOnTable(appState);
  const turnCard = getTurnCard(appState);

  const warnings = [];

  if (appState.turnZone != null) {
    const zoneIdx = appState.turnZone - 1;
    const uid = appState.zones?.[zoneIdx] ?? null;

    if (!uid) warnings.push("TurnZone is leeg (geen UID in die zone).");
    else if (!appState.mapping?.[uid]) warnings.push("TurnZone heeft UID maar is unmapped.");
  }

  const canPlay = turnCard !== null;

  return {
    cardsOnTable, // enkel mapped cards
    turnCard,     // {zoneNr, uid, cardName} of null
    canPlay,      // simpele rule: mag spelen als turnCard bestaat
    warnings,
  };
}