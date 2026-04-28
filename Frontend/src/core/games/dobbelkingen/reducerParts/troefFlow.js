// src/core/games/dobbelkingen/reducerParts/troefFlow.js
import { clampIndex } from "./state";

export function normalizeTroefSuit(raw) {
  const suit = String(raw ?? "").trim().toUpperCase();
  return ["H", "D", "C", "S"].includes(suit) ? suit : null;
}

export function getTroefStarterIndex(chooserIndex, playersCount) {
  return clampIndex((chooserIndex ?? 0) + 1, playersCount);
}

export function getNextTroefChooserIndex(currentIndex, playersCount) {
  return clampIndex((currentIndex ?? 0) + 1, playersCount);
}

export function allPlayersPickedTroefTwice(counts, playersCount) {
  for (let i = 0; i < playersCount; i++) {
    if ((counts?.[i] ?? 0) < 2) return false;
  }
  return true;
}