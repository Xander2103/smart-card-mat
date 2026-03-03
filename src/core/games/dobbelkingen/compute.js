import { computeContractScoresFromTrickHistory } from "./scoring";

export function computeDobbelkingenState(appState) {
  const zones = appState.zones ?? [];
  const mapping = appState.mapping ?? {};
  const playersCount = appState.players?.length ?? 4;

  const expectedZone = (appState.currentPlayerIndex ?? 0) + 1;
  const zoneIndex = expectedZone - 1;

  const uid = zones?.[zoneIndex] ?? null;
  const card = uid ? (mapping[uid] ?? null) : null;

  const turnCard = uid && card ? { zone: expectedZone, uid, card } : null;
  const canConfirm = !!turnCard;

  const contractScores = computeContractScoresFromTrickHistory(appState.trickHistory ?? [], playersCount);
  const total = appState.totalScores ?? Array(playersCount).fill(0);

  const scores = Array.from({ length: playersCount }, (_, i) => (total[i] ?? 0) + (contractScores[i] ?? 0));

  return { playersCount, expectedZone, turnCard, canConfirm, scores };
}