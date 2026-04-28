// src/core/games/dobbelkingen/module.js
import { reduceDobbelkingen } from "./reducer";
import { computeDobbelkingen, computeDobbelkingenState } from "./compute";
import { getContractList } from "./contracts";

export const dobbelkingenEngine = {
  id: "dobbelkingen",
  label: "Dobbelkingen",

  // reducers
  reduce: reduceDobbelkingen,

  // derived state (voor UI: scores, status, etc.)
  compute: computeDobbelkingen,

  // initial slice helper (als je die gebruikt)
  createInitialGameState: computeDobbelkingenState,

  // contract metadata voor UI
  getContractList,
};