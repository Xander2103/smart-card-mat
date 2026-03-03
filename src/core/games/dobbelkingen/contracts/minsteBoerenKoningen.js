import { countWhere } from "./_card";

export const minsteBoerenKoningen = {
  id: "MINSTE_BOEREN_KONINGEN",
  label: "Minste boeren & koningen",
  desc: "Vermijd boeren en koningen.",

  scoreTrick({ plays, playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex !== "number") return delta;

    const count = countWhere(plays, (c) => c.rankStr === "J" || c.rankStr === "K");
    delta[winnerIndex] -= count; // -1 per boer/koning
    return delta;
  },
};