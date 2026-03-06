// src/core/games/dobbelkingen/scoring.js
import { getContract } from "./contracts";

function countHeartsInTrickHistory(trickHistory) {
  let n = 0;

  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      const code = String(p?.card ?? "").toUpperCase();
      if (
        code.endsWith("H") ||
        code.includes("HEART") ||
        code.includes("HART") ||
        code.includes("♥")
      ) {
        n++;
      }
    }
  }

  return n;
}

export function shouldEndEarlyFromTrickHistory(contractId, trickHistory) {
  if (contractId === "MINSTE_HARTEN") {
    const heartsPlayed = countHeartsInTrickHistory(trickHistory);

    return {
      endEarly: heartsPlayed >= 13,
      reason: heartsPlayed >= 13 ? "ALL_HEARTS_PLAYED" : null,
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

    // Fase 2: per slagwinst +1
    if (contractId === "TROEF") {
      scores[winnerIndex] += 1;
      continue;
    }

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