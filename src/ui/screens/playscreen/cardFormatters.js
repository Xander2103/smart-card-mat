export function getTrumpLabel(suit) {
  switch (String(suit ?? "").toUpperCase()) {
    case "H":
      return "♥ Harten";
    case "D":
      return "♦ Ruiten";
    case "C":
      return "♣ Klaveren";
    case "S":
      return "♠ Schoppen";
    default:
      return "—";
  }
}

export function toPrettyCard(code) {
  if (!code) return "—";

  const suit = code.slice(-1).toUpperCase();
  const rank = code.slice(0, -1).toUpperCase();

  const suitMap = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${rank}${suitMap[suit] ?? suit}`;
}

export function getTrickWinsByPlayer(trickHistory, playersCount) {
  const wins = Array(playersCount).fill(0);

  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;
    if (typeof winnerIndex === "number" && winnerIndex >= 0 && winnerIndex < playersCount) {
      wins[winnerIndex] += 1;
    }
  }

  return wins;
}
