import { loadMapping } from "../mapping/mappingStore";

export function createInitialState({ zonesCount = 4 } = {}) {
  return {
    zonesCount,
    zones: Array.from({ length: zonesCount }, () => null),
    turnZone: null,
    log: [],
    selectedUid: null,
    mapping: loadMapping(), // ✅ dit is de enige load die je nodig hebt
  };
}