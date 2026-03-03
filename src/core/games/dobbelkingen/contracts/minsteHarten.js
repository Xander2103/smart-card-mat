import { countWhere } from "./_card";

export const minsteHarten = {
  id: "MINSTE_HARTEN",
  label: "Minste harten",
  desc: "Probeer zo weinig mogelijk harten te nemen.",

  scoreTrick({ plays, playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex !== "number") return delta;

    const hearts = countWhere(plays, (c) => c.suit === "H");
    delta[winnerIndex] -= hearts; // -1 per hart
    return delta;
  },
};