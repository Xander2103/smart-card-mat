import { countWhere } from "./_card";

const QUEEN_PENALTY = 1;

export const minsteQueens = {
  id: "MINSTE_QUEENS",
  label: "Minste queens",
  desc: "Vermijd queens.",

  scoreTrick({ plays, playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex !== "number") return delta;

    const queens = countWhere(plays, (c) => c.rankStr === "Q");
    delta[winnerIndex] -= queens * QUEEN_PENALTY;

    return delta;
  },
};