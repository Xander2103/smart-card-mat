// src/core/games/dobbelkingen/contracts/troef.js

export const troef = {
  id: "TROEF",
  label: "Troef",
  desc: "Fase 2: speler kiest troefkleur, volgende speler komt uit.",

  scoreTrick({ playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex === "number" && winnerIndex >= 0 && winnerIndex < playersCount) {
      delta[winnerIndex] = 1;
    }
    return delta;
  },

  shouldEndEarly() {
    return false;
  },
};