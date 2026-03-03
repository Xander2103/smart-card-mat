const PENALTY = 5; // pas aan indien je andere straf wil

export const geenSlag713 = {
  id: "GEEN_SLAG_7_13",
  label: "Geen slag #7 of #13",
  desc: "Vermijd de 7de en 13de slag.",

  scoreTrick({ playersCount, winnerIndex, trickIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex !== "number") return delta;

    if (trickIndex === 7 || trickIndex === 13) delta[winnerIndex] -= PENALTY;
    return delta;
  },
};