// src/core/games/dobbelkingen/contracts/HartenKoning.js

const PENALTY = 5;

function findKHPlayInPlays(plays) {
  for (const p of plays ?? []) {
    if (p?.card === "KH") return p;
  }
  return null;
}

function findKHInTrickHistory(trickHistory) {
  for (const t of trickHistory ?? []) {
    const hit = findKHPlayInPlays(t?.plays);
    if (hit) return hit;
  }
  return null;
}

export const hartenKoning = {
  id: "HARTEN_KONING",
  label: "Harten Koning",
  desc: "Zodra de 👑♥ (KH) gespeeld wordt stopt het contract onmiddellijk. Winnaar van de slag krijgt -5.",

  // -5 voor de winnaar van de slag als KH in die slag zit
  scoreTrick({ trick, playersCount, winnerIndex }) {
    const plays = trick ?? [];
    const hit = findKHPlayInPlays(plays);
    if (!hit) return null;

    const delta = Array(playersCount).fill(0);

    if (typeof winnerIndex === "number") {
      delta[winnerIndex] -= PENALTY;
    }

    return delta;
  }, // ✅ deze comma is cruciaal

  // early stop zodra KH in trickHistory zit (na een volledige slag)
  shouldEndEarly({ trickHistory }) {
    const hit = findKHInTrickHistory(trickHistory);
    if (!hit) return false;

    return {
      endEarly: true,
      reason: "HEARTS_KING_PLAYED",
      meta: { card: "KH" },
    };
  },
};