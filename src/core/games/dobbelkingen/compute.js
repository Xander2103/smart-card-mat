// src/core/games/dobbelkingen/compute.js
import { computeScoresFromTrickHistory } from "./scoring";

export function computeDobbelkingenState(appState) {
  const zones = appState.zones ?? [];
  const mapping = appState.mapping ?? {};
  const playersCount = appState.players?.length ?? 4;

  // ✅ alles komt uit de slice
  const d = appState.game?.dobbelkingen ?? null;

  const currentPlayerIndex = d?.currentPlayerIndex ?? 0;
  const expectedZone = currentPlayerIndex + 1; // 1..4
  const zoneIndex = expectedZone - 1;

  const uid = zones?.[zoneIndex] ?? null;
  const card = uid ? (mapping[uid] ?? null) : null;

  // turnCard mag null zijn als er nog geen kaart ligt, maar expectedZone blijft wél correct
  const turnCard = uid && card ? { zone: expectedZone, uid, card } : null;

  // ✅ confirm kan alleen als er effectief een kaart ligt in de juiste zone
  const canConfirm = !!turnCard;

  // ✅ scores uit trickHistory in slice
  const scores = computeScoresFromTrickHistory(d?.trickHistory ?? [], playersCount);

  return { playersCount, expectedZone, turnCard, canConfirm, scores };
}

// alias export als je ergens nog computeDobbelkingen importeert
export const computeDobbelkingen = computeDobbelkingenState;