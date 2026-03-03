// src/core/game/dobbelkingen.js
export function computeScoresFromTrickHistory(trickHistory, playersCount) {
  const scores = Array.from({ length: playersCount }, () => 0);

  for (const t of trickHistory ?? []) {
    const w = t?.winnerIndex;
    if (!(typeof w === "number") || w < 0 || w >= playersCount) continue;

    // contract kan op trickResult zitten (ik had dat al in reducer voorgesteld)
    const contract = t.contract ?? null;

    // minste slagen: -1 per gewonnen slag
    if (contract === "MINSTE_SLAGEN") {
      scores[w] -= 1;
    }

    // (later voeg je hier andere contracts toe)
  }

  return scores;
}