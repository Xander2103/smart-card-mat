// src/core/game/trickLogic.js

function parseCardCode(code) {
  if (typeof code !== "string" || code.length < 2) return null;

  const suit = code.slice(-1).toUpperCase(); // C/D/H/S
  const rankStr = code.slice(0, -1).toUpperCase(); // A, K, Q, J, 10, 9...

  const rankMap = { A: 14, K: 13, Q: 12, J: 11 };
  const rank = rankMap[rankStr] ?? Number(rankStr);

  if (!["C", "D", "H", "S"].includes(suit)) return null;
  if (!Number.isFinite(rank)) return null;

  return { suit, rank, rankStr };
}

function normalizeOptions(modeOrOptions, starterPlayerIndex) {
  if (
    modeOrOptions &&
    typeof modeOrOptions === "object" &&
    !Array.isArray(modeOrOptions)
  ) {
    return {
      contractId: modeOrOptions.contractId ?? null,
      trumpSuit: modeOrOptions.trumpSuit
        ? String(modeOrOptions.trumpSuit).toUpperCase()
        : null,
      starterPlayerIndex:
        typeof modeOrOptions.starterPlayerIndex === "number"
          ? modeOrOptions.starterPlayerIndex
          : starterPlayerIndex,
    };
  }

  return {
    contractId: modeOrOptions ?? null,
    trumpSuit: null,
    starterPlayerIndex,
  };
}

function getLeadPlay(plays, starterPlayerIndex = null) {
  if (!Array.isArray(plays) || plays.length === 0) return null;

  if (typeof starterPlayerIndex === "number") {
    const found = plays.find((p) => p?.playerIndex === starterPlayerIndex);
    if (found) return found;
  }

  return plays[0] ?? null;
}

function getBestPlayInSuit(plays, suit) {
  let best = null;
  let bestRank = -1;

  for (const p of plays ?? []) {
    const meta = parseCardCode(p?.card);
    if (!meta) continue;
    if (meta.suit !== suit) continue;

    if (meta.rank > bestRank) {
      bestRank = meta.rank;
      best = p;
    }
  }

  return best;
}

/**
 * Backward compatible:
 * determineTrickWinner(plays, contractId, starterPlayerIndex)
 * determineTrickWinner(plays, { contractId, trumpSuit, starterPlayerIndex })
 */
export function determineTrickWinner(
  plays,
  modeOrOptions = null,
  starterPlayerIndex = null
) {
  if (!Array.isArray(plays) || plays.length === 0) return null;

  const options = normalizeOptions(modeOrOptions, starterPlayerIndex);
  const leadPlay = getLeadPlay(plays, options.starterPlayerIndex);
  if (!leadPlay) return null;

  const leadMeta = parseCardCode(leadPlay?.card);
  if (!leadMeta) return leadPlay;

  const leadSuit = leadMeta.suit;
  const trumpSuit = options.trumpSuit ?? null;

  if (trumpSuit) {
    const bestTrump = getBestPlayInSuit(plays, trumpSuit);
    if (bestTrump) return bestTrump;
  }

  return getBestPlayInSuit(plays, leadSuit) ?? leadPlay;
}

export function getCardMeta(code) {
  return parseCardCode(code);
}