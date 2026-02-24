import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  return {
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null,
    log: [],
    selectedUid: null,
    mapping: loadMapping(),

    // ✅ nieuw
    confirmedTurnCard: null,
    pile: [],
  };
}