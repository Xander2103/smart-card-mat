// src/core/games/dobbelkingen/contracts/minsteBoerenKoningen.js

const PENALTY_PER_CARD = 1;
const TOTAL_J_AND_K = 8; // 4 boeren (J) + 4 koningen (K)

function rankStrFromCode(code) {
  if (typeof code !== "string" || code.length < 2) return null;
  return code.trim().toUpperCase().slice(0, -1); // "A","K","Q","J","10",...
}

function isKingOrJack(code) {
  const r = rankStrFromCode(code);
  return r === "K" || r === "J";
}

function countKingsAndJacksInTrickHistory(trickHistory) {
  let n = 0;
  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      if (isKingOrJack(p?.card)) n++;
    }
  }
  return n;
}

export const minsteBoerenKoningen = {
  id: "MINSTE_BOEREN_KONINGEN",
  label: "Minste boeren & koningen",
  desc: "Per boer (J) of koning (K) in een slag krijgt de winnaar van die slag -1 per kaart. Contract eindigt zodra alle J & K gevallen zijn.",

  // ✅ scoring: winnaar krijgt -1 per J/K die in die slag zit
  scoreTrick({ trick, playersCount, winnerIndex }) {
    const plays = trick ?? [];

    let count = 0;
    for (const p of plays) {
      if (isKingOrJack(p?.card)) count++;
    }

    if (count <= 0) return null;

    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex === "number") {
      delta[winnerIndex] -= count * PENALTY_PER_CARD;
    }
    return delta;
  },

  // ✅ early stop: zodra alle 8 kaarten (4J + 4K) gespeeld zijn
  shouldEndEarly({ trickHistory }) {
    const n = countKingsAndJacksInTrickHistory(trickHistory);

    if (n >= TOTAL_J_AND_K) {
      return {
        endEarly: true,
        reason: "ALL_JK_PLAYED",
        meta: { count: n, total: TOTAL_J_AND_K },
      };
    }

    return { endEarly: false, reason: null, meta: { count: n, total: TOTAL_J_AND_K } };
  },
};