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

export const TROEF_OPTIONS = [
  { suit: "H", label: "Harten", symbol: "♥", color: "#fb7185" },
  { suit: "D", label: "Ruiten", symbol: "♦", color: "#fb7185" },
  { suit: "C", label: "Klaveren", symbol: "♣", color: "#e5eefb" },
  { suit: "S", label: "Schoppen", symbol: "♠", color: "#e5eefb" },
];

export function getCompactContractDesc(label, desc) {
  const value = String(label ?? "").toLowerCase();
  if (value.includes("minste slagen")) return "Neem zo weinig mogelijk slagen. -1 per slag.";
  if (value.includes("minste harten")) return "Pak zo weinig mogelijk harten. -1 per hart.";
  if (value.includes("harten koning")) return "Koning harten gepakt? Meteen einde. -5 punten.";
  if (value.includes("boeren") || value.includes("koningen")) return "Boer of koning = -1 per kaart.";
  if (value.includes("geen slag 7") || value.includes("13")) return "Slag 7 = -2, slag 13 = -3.";
  if (value.includes("queens")) return "Elke vrouw = -2 punten.";
  return desc;
}

export function getCurrentRoundTrickCounts(trickHistory, playersCount) {
  const counts = Array(playersCount).fill(0);

  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;

    if (
      typeof winnerIndex === "number" &&
      winnerIndex >= 0 &&
      winnerIndex < playersCount
    ) {
      counts[winnerIndex] += 1;
    }
  }

  return counts;
}

export function formatRoundDelta(value) {
  const n = Number(value ?? 0);

  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return "0";
}
