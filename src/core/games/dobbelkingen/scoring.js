// src/core/games/dobbelkingen/scoring.js
import { getContract } from "./contracts";

function countHeartsInTrickHistory(trickHistory) {
  let n = 0;
  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      const code = p?.card;
      if (typeof code === "string" && code.endsWith("H")) n++;
    }
  }
  return n;
}

/**
 * Returns { endEarly: boolean, reason: string|null, meta?: any }
 * Only evaluated AFTER a full trick has been completed.
 */
export function shouldEndEarlyFromTrickHistory(contractId, trickHistory) {
  if (contractId === "MINSTE_HARTEN") {
    const heartsPlayed = countHeartsInTrickHistory(trickHistory);

    if (heartsPlayed >= 13) {
      return {
        endEarly: true,
        reason: "ALL_HEARTS_PLAYED",
        meta: { heartsPlayed },
      };
    }

    return {
      endEarly: false,
      reason: null,
      meta: { heartsPlayed },
    };
  }

  return { endEarly: false, reason: null, meta: null };
}

export function computeScoresFromTrickHistory(trickHistory, playersCount) {
  const scores = Array.from({ length: playersCount }, () => 0);

  for (const t of trickHistory ?? []) {
    const winnerIndex = t?.winnerIndex;

    if (
      typeof winnerIndex !== "number" ||
      winnerIndex < 0 ||
      winnerIndex >= playersCount
    ) {
      continue;
    }

    const contractId = t?.contract ?? null;
    const contract = getContract(contractId);

    if (!contract?.scoreTrick) continue;

    const input = {
      trick: t?.plays ?? [],
      plays: t?.plays ?? [],
      playersCount,
      winnerIndex,
      trickIndex: t?.id ?? null,
      trickId: t?.id ?? null,
      contractId,
      trumpSuit: t?.trumpSuit ?? null,
    };

    const delta = contract.scoreTrick(input);

    if (!Array.isArray(delta)) continue;

    for (let i = 0; i < playersCount; i++) {
      scores[i] += Number(delta[i] ?? 0);
    }
  }

  return scores;
}