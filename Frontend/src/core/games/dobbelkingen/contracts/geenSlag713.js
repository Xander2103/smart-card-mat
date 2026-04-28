// src/core/games/dobbelkingen/contracts/geenSlag713.js

export const geenSlag713 = {
  id: "GEEN_SLAG_7_13",
  label: "Geen slag 7 & 13",
  desc: "Winnaar van slag 7 krijgt -2. Winnaar van slag 13 krijgt -3. (Geen early stop)",

  scoreTrick({ playersCount, winnerIndex, trickIndex }) {
    // trickIndex = t.id uit trickHistory (1..13)
    if (typeof trickIndex !== "number") return null;
    if (typeof winnerIndex !== "number") return null;

    let penalty = 0;
    if (trickIndex === 7) penalty = 2;
    if (trickIndex === 13) penalty = 3;

    if (penalty <= 0) return null;

    const delta = Array(playersCount).fill(0);
    delta[winnerIndex] -= penalty;
    return delta;
  },

  // ✅ nooit vroegtijdig stoppen
  shouldEndEarly() {
    return false;
  },
};