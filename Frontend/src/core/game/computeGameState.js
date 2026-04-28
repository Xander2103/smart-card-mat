// src/core/game/computeGameState.js
import { computeDobbelkingenState } from "../games/dobbelkingen/compute";
import { computeKleurenwiezenState } from "../games/kleurenwiezen/compute";

export function computeGameState(appState) {
  if (!appState?.modeId) return appState;

  if (appState.modeId === "dobbelkingen") {
    return computeDobbelkingenState(appState);
  }

  if (appState.modeId === "kleurenwiezen") {
    return computeKleurenwiezenState(appState);
  }

  return appState;
}