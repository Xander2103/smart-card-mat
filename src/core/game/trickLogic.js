// src/core/game/trickLogic.js

const RANK_VALUE = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  Boer: 11,
  Dame: 12,
  Heer: 13,
  Aas: 14,
};

const SUITS = new Set(["Schoppen", "Harten", "Ruiten", "Klaver"]);

/**
 * cardName: "Schoppen Aas", "Harten 10", ...
 * returns: { suit, rank, value } or null
 */
export function parseCardName(cardName) {
  if (!cardName || typeof cardName !== "string") return null;

  const parts = cardName.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const suit = parts[0];
  const rank = parts.slice(1).join(" ");

  if (!SUITS.has(suit)) return null;

  const value = RANK_VALUE[rank];
  if (!value) return null;

  return { suit, rank, value };
}

/**
 * Winner = hoogste kaart van de "lead suit" (kleur van eerste kaart)
 * trick items: { playerIndex, zone, uid, card }
 */
export function determineTrickWinnerLeadSuitHighest(trick) {
  if (!Array.isArray(trick) || trick.length === 0) return null;

  const firstParsed = parseCardName(trick[0]?.card);
  if (!firstParsed) return trick[0] ?? null;

  const leadSuit = firstParsed.suit;

  let best = null; // { play, value }

  for (const play of trick) {
    const parsed = parseCardName(play?.card);
    if (!parsed) continue;
    if (parsed.suit !== leadSuit) continue;

    if (!best || parsed.value > best.value) {
      best = { play, value: parsed.value };
    }
  }

  return best?.play ?? (trick[0] ?? null);
}

/**
 * Main router (gameMode)
 * Later: troef / speciale regels toevoegen zonder reducer te wijzigen.
 */
export function determineTrickWinner(trick, gameMode) {
  switch (gameMode) {
    case "MS":
      return determineTrickWinnerLeadSuitHighest(trick); // moet dit zijn
    default:
      return determineTrickWinnerLeadSuitHighest(trick);
  }
}
