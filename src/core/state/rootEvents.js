// src/core/state/rootEvents.js
const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

export function applyRootEvent(state, ev) {
  const nextZones = [...(state.zones ?? [])];

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    if (nextZones[zoneIndex] === ev.uid) return state;

    // unique mapping per UID over zones (move)
    for (let i = 0; i < nextZones.length; i++) {
      if (nextZones[i] === ev.uid) nextZones[i] = null;
    }

    nextZones[zoneIndex] = ev.uid;

    return {
      ...state,
      zones: nextZones,
      selectedUid: ev.uid,
      lastError: null,
      log: pushLog(state.log, ev.raw),
    };
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;
    if (nextZones[zoneIndex] !== ev.uid) return state;

    nextZones[zoneIndex] = null;

    const next = {
      ...state,
      zones: nextZones,
      log: pushLog(state.log, ev.raw),
    };

    if (next.confirmedTurnCard?.uid === ev.uid) next.confirmedTurnCard = null;
    return next;
  }

  if (ev.type === "turn") {
    // legacy debug: UI gebruikt expectedZone
    if (state.turnZone === ev.zone) return state;
    return {
      ...state,
      confirmedTurnCard: null,
      turnZone: ev.zone,
      lastError: null,
      log: pushLog(state.log, ev.raw),
    };
  }

  return state;
}