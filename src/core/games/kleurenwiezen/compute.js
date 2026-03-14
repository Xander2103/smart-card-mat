export function computeKleurenwiezenState(appState) {
  const zones = appState.zones ?? [];
  const mapping = appState.mapping ?? {};
  const playersCount = appState.players?.length ?? 4;
  const k = appState.game?.kleurenwiezen ?? null;

  const currentPlayerIndex = k?.currentPlayerIndex ?? 0;
  const expectedZone = currentPlayerIndex + 1;
  const zoneIndex = expectedZone - 1;

  const uid = zones?.[zoneIndex] ?? null;
  const card = uid ? mapping[uid] ?? null : null;
  const turnCard = uid && card ? { zone: expectedZone, uid, card } : null;

  return {
    playersCount,
    expectedZone,
    turnCard,
    canConfirm: !!turnCard,
  };
}

export const computeKleurenwiezen = computeKleurenwiezenState;
