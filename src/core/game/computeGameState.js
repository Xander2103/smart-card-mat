// src/core/game/computeGameState.js
import { computeDobbelkingenState } from "../games/dobbelkingen/compute";

export function computeGameState(appState) {
  // Later (als wiezen komt) maak je hier een switch op gameId.
  return computeDobbelkingenState(appState);
}