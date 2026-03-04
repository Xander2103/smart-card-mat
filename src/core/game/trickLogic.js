// src/core/game/trickLogic.js

function parseCardCode(code) {
  if (typeof code !== "string" || code.length < 2) return null;

  const suit = code.slice(-1).toUpperCase(); // C/D/H/S
  const rankStr = code.slice(0, -1).toUpperCase(); // A, K, Q, J, 10, 9...

  const rankMap = { A: 14, K: 13, Q: 12, J: 11 };
  const rank = rankMap[rankStr] ?? Number(rankStr);

  if (!["C", "D", "H", "S"].includes(suit)) return null;
  if (!Number.isFinite(rank)) return null;

  return { suit, rank };
}

/**
 * Winner = hoogste kaart in lead suit (suit van eerste play)
 * @param {Array<{playerIndex:number, card:string}>} plays
 * @param {string|null} modeOrContract
 */
export function determineTrickWinner(plays, modeOrContract, starterPlayerIndex = null) {
  if (!Array.isArray(plays) || plays.length === 0) return null;

  let leadPlay = plays[0];

  // ✅ als starterPlayerIndex gegeven is: gebruik die kaart als lead suit bron
  if (typeof starterPlayerIndex === "number") {
    const found = plays.find(p => p?.playerIndex === starterPlayerIndex);
    if (found) leadPlay = found;
  }

  const firstMeta = parseCardCode(leadPlay?.card);
  if (!firstMeta) return leadPlay ?? null;

  const leadSuit = firstMeta.suit;

  let best = null;
  let bestRank = -1;

  for (const p of plays) {
    const meta = parseCardCode(p?.card);
    if (!meta) continue;
    if (meta.suit !== leadSuit) continue;

    if (meta.rank > bestRank) {
      bestRank = meta.rank;
      best = p;
    }
  }

  return best ?? leadPlay ?? null;
}