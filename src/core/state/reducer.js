// src/core/state/reducer.js
import { setMappingValue } from "../mapping/mappingStore";

function pushLog(prevLog, raw) {
  return [raw, ...prevLog].slice(0, 50);
}

export function applyEvent(state, ev) {
  const next = {
    ...state,
    zones: [...state.zones],
    log: pushLog(state.log, ev.raw),
  };

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    // 1 UID kan maar in 1 zone zitten
    for (let i = 0; i < next.zones.length; i++) {
      if (next.zones[i] === ev.uid) next.zones[i] = null;
    }

    next.zones[zoneIndex] = ev.uid;
    next.selectedUid = ev.uid;
    return next;
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    if (next.zones[zoneIndex] === ev.uid) next.zones[zoneIndex] = null;
    return next;
  }

  if (ev.type === "turn") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    next.turnZone = ev.zone;
    return next;
  }

  return next;
}

export function applyAction(state, action) {
  if (action.type === "select_uid") {
    return { ...state, selectedUid: action.uid };
  }

  if (action.type === "register_mapping") {
    const { uid, card } = action;
    if (!uid || !card) return state;

    const mapping = setMappingValue(state.mapping, uid, card);
    return { ...state, mapping };
  }

  if (action.type === "clear_mapping") {
    return { ...state, mapping: {} };
  }

  return state;
}