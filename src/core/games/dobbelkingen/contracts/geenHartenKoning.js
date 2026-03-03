import { hasCard } from "./_card";

const PENALTY = 5; // pas aan indien je andere straf wil

export const geenHartenKoning = {
  id: "GEEN_HARTEN_KONING",
  label: "Geen harten koning",
  desc: "Vermijd de harten koning.",

  scoreTrick({ plays, playersCount, winnerIndex }) {
    const delta = Array(playersCount).fill(0);
    if (typeof winnerIndex !== "number") return delta;

    const hasKH = hasCard(plays, (c) => c.suit === "H" && c.rankStr === "K");
    if (hasKH) delta[winnerIndex] -= PENALTY;

    return delta;
  },
};