export const minsteSlagen = {
  id: "MINSTE_SLAGEN",
  label: "Minste slagen",
  desc: "Probeer zo weinig mogelijk slagen te nemen.",

  // winnaar krijgt -1 per gewonnen slag
  scoreTrick({ playersCount, winnerIndex }) {
    const delta = Array.from({ length: playersCount }, () => 0);
    delta[winnerIndex] -= 1;
    return delta;
  },
};