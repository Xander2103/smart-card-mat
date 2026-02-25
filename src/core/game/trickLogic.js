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

export function parseCardName(cardName) {
  // verwacht bv: "Schoppen Aas" of "Harten 10"
  if (!cardName || typeof cardName !== "string") return null;

  const parts = cardName.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const suit = parts[0];                 // Schoppen/Harten/Ruiten/Klaver
  const rank = parts.slice(1).join(" "); // "10" of "Aas" etc.
  const value = RANK_VALUE[rank];

  if (!value) return null;
  return { suit, rank, value };
}

function winnerHighest(trick) {
  // trick items: { playerIndex, card: "Schoppen Aas", ... }
  let best = null;

  for (const play of trick) {
    const parsed = parseCardName(play.card);
    if (!parsed) continue;

    if (!best) {
      best = { ...play, _value: parsed.value };
      continue;
    }

    if (parsed.value > best._value) {
      best = { ...play, _value: parsed.value };
    }
  }

  return best ? strip(best) : null;
}

function winnerLowest(trick) {
  let best = null;

  for (const play of trick) {
    const parsed = parseCardName(play.card);
    if (!parsed) continue;

    if (!best) {
      best = { ...play, _value: parsed.value };
      continue;
    }

    if (parsed.value < best._value) {
      best = { ...play, _value: parsed.value };
    }
  }

  return best ? strip(best) : null;
}

function strip(x) {
  const { _value, ...rest } = x;
  return rest;
}

export function determineTrickWinner(trick, gameMode) {
  switch (gameMode) {
    case "MS":
      // prototype: hoogste wint de slag
      return winnerHighest(trick);

    case "LOWEST_WINS":
      return winnerLowest(trick);

    case "NEXT_TURN":
      // geen echte "winner" nodig, maar reducer verwacht iets
      return trick?.[0] ?? null;

    default:
      return winnerHighest(trick);
  }
}