// src/core/games/dobbelkingen/contracts/minsteQueens.js

const PENALTY_PER_QUEEN = 2;
const TOTAL_QUEENS = 4;

function isQueen(code) {
  if (typeof code !== "string" || code.length < 2) return false;
  const s = code.trim().toUpperCase();
  const rankStr = s.slice(0, -1); // "Q"
  return rankStr === "Q";
}

function countQueensInTrickHistory(trickHistory) {
  let n = 0;
  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      if (isQueen(p?.card)) n++;
    }
  }
  return n;
}

export const minsteQueens = {
  id: "MINSTE_QUEENS",
  label: "Minste queens",
  desc: "Per queen (Q) in een slag krijgt de winnaar van die slag -2 per queen. Contract eindigt zodra alle queens gevallen zijn.",

  // winnaar krijgt -2 per Q die in die slag zit
  scoreTrick({ trick, playersCount, winnerIndex }) {
    const plays = trick ?? [];

    let count = 0;
    for (const p of plays) {
      if (isQueen(p?.card)) count++;
    }

    if (count <= 0) return null;

    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex === "number") {
      delta[winnerIndex] -= count * PENALTY_PER_QUEEN;
    }
    return delta;
  },

  // early stop zodra alle 4 queens gespeeld zijn
  shouldEndEarly({ trickHistory }) {
    const n = countQueensInTrickHistory(trickHistory);

    if (n >= TOTAL_QUEENS) {
      return {
        endEarly: true,
        reason: "ALL_QUEENS_PLAYED",
        meta: { count: n, total: TOTAL_QUEENS },
      };
    }

    return { endEarly: false, reason: null, meta: { count: n, total: TOTAL_QUEENS } };
  },
};