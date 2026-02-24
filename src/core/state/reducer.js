// src/core/state/reducer.js
import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";

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

    // 1 UID kan maar in 1 zone tegelijk zitten
    for (let i = 0; i < next.zones.length; i++) {
      if (next.zones[i] === ev.uid) next.zones[i] = null;
    }

    // zone-overwrite
    next.zones[zoneIndex] = ev.uid;

    next.selectedUid = ev.uid;
    return next;
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    if (next.zones[zoneIndex] === ev.uid) {
      next.zones[zoneIndex] = null;

      // game rule: turn reset als je turn-zone leegmaakt
      if (next.turnZone === ev.zone) next.turnZone = null;
    }
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
    const uid = action.uid ?? state.selectedUid;
    const cardName = action.cardName;

    if (!uid || !cardName) return state;

    const nextMapping = setUniqueMappingOverwrite(state.mapping, uid, cardName);

    return {
      ...state,
      mapping: nextMapping,
      log: pushLog(state.log, `MAP|${uid}|${cardName}`),
    };
  }

  // onbekende actions: state behouden
  return state;
}