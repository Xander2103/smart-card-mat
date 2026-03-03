import { getContract } from "./contracts";

export function computeContractScoresFromTrickHistory(trickHistory, playersCount) {
  const scores = Array.from({ length: playersCount }, () => 0);

  for (const t of trickHistory ?? []) {
    const winnerIndex = t?.winnerIndex;
    if (!(typeof winnerIndex === "number") || winnerIndex < 0 || winnerIndex >= playersCount) continue;

    const contractId = t?.contract ?? null;
    const contract = getContract(contractId);
    if (!contract?.scoreTrick) continue;

    const plays = t?.plays ?? [];
    const trickIndex = t?.id ?? null;

    const delta = contract.scoreTrick({
      plays,
      playersCount,
      winnerIndex,
      trickIndex,
    });

    for (let i = 0; i < playersCount; i++) scores[i] += (delta?.[i] ?? 0);
  }

  return scores;
}