export function getCardsInZones(state) {
  return state.zones.map((uid, zoneIndex) => ({
    zone: zoneIndex + 1,
    uid,
    card: uid ? state.mapping?.[uid] ?? null : null,
  }));
}
export function getMappedCardsOnTable(state) {
    return getCardsOnTable(state).filter((z) => z.uid && z.card != null);
  }

export function getCardsOnTable(state) {
  return getCardsInZones(state).filter((z) => z.card !== null);
}

export function getTurnCard(state) {
  if (!state.turnZone) return null;

  const uid = state.zones[state.turnZone - 1];
  if (!uid) return null;

  return {
    zone: state.turnZone,
    uid,
    card: state.mapping?.[uid] ?? null,
  };
}