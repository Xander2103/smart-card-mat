export const minsteSlagen = {
  id: "MINSTE_SLAGEN",
  label: "Minste slagen",
  desc: "Probeer zo weinig mogelijk slagen te nemen.",

  scoreTrick({ playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex === "number") delta[winnerIndex] -= 1;
    return delta;
  },
};