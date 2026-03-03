// src/core/game/engine.js
import { computeScoresFromTrickHistory } from "./dobbelkingen";

export function computeGameState(appState) {
  const zones = appState.zones ?? [];
  const mapping = appState.mapping ?? {};
  const playersCount = appState.players?.length ?? 4;

  const expectedZone = (appState.currentPlayerIndex ?? 0) + 1;
  const zoneIndex = expectedZone - 1;

  const uid = zones?.[zoneIndex] ?? null;
  const card = uid ? (mapping[uid] ?? null) : null;

  const turnCard = uid && card ? { zone: expectedZone, uid, card } : null;
  const canConfirm = !!turnCard;

  const scores = computeScoresFromTrickHistory(appState.trickHistory ?? [], playersCount);

  return { playersCount, expectedZone, turnCard, canConfirm, scores };
}