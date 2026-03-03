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
export function determineTrickWinner(plays, modeOrContract) {
  if (!Array.isArray(plays) || plays.length === 0) return null;

  const firstMeta = parseCardCode(plays[0]?.card);
  if (!firstMeta) {
    // als er ooit rommel binnenkomt: pak 1ste zodat reducer niet vastloopt
    return plays[0] ?? null;
  }

  const leadSuit = firstMeta.suit;

  let best = plays[0];
  let bestRank = firstMeta.rank;

  for (let i = 1; i < plays.length; i++) {
    const p = plays[i];
    const meta = parseCardCode(p?.card);
    if (!meta) continue;
    if (meta.suit !== leadSuit) continue;

    if (meta.rank > bestRank) {
      bestRank = meta.rank;
      best = p;
    }
  }

  return best;
}