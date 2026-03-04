// src/core/game/computeGameState.js
import { computeDobbelkingenState } from "../games/dobbelkingen/compute";

export function computeGameState(appState) {
  if (!appState?.modeId) return appState;

  if (appState.modeId === "dobbelkingen") {
    return computeDobbelkingenState(appState);
  }

  return appState;
}