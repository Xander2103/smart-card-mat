const SUITS = ["Schoppen", "Harten", "Ruiten", "Klaveren"];
const RANKS = ["Aas", "Heer", "Dame", "Boer", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

export const CARD_OPTIONS = SUITS.flatMap((suit) =>
  RANKS.map((rank) => `${suit} ${rank}`)
);