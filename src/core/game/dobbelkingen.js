// src/core/game/dobbelkingen.js

export function computeScoresFromTrickHistory(trickHistory, playersCount) {
  const scores = Array.from({ length: playersCount }, () => 0);

  for (const t of trickHistory ?? []) {
    const w = t?.winnerIndex;
    if (typeof w === "number" && w >= 0 && w < playersCount) {
      scores[w] -= 1; // MS: 1 punt per slag
    }
  }

  return scores;
}