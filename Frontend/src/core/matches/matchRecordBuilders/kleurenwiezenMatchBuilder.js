import { getKleurenwiezenContract, evaluateRound, getFriendlyTeamLabel, getTrumpLabel } from "../../games/kleurenwiezen";

function buildScores(players, totalScores = []) {
  const scored = (players ?? []).map((player, index) => ({
    playerId: player?.id ?? `player_${index}`,
    name: player?.name ?? `Player ${index + 1}`,
    score: Number(totalScores?.[index] ?? 0),
  }));

  const ranked = [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const rankMap = new Map(ranked.map((row, index) => [row.playerId, index + 1]));

  return scored.map((row) => ({
    playerId: row.playerId,
    score: row.score,
    rank: rankMap.get(row.playerId) ?? 1,
  }));
}

export function buildKleurenwiezenMatchRecord(state) {
  const slice = state?.game?.kleurenwiezen ?? {};
  const players = state?.players ?? [];
  const contract = getKleurenwiezenContract(slice?.contractId);
  const evaluation = evaluateRound(slice, players);
  const totalScores = slice?.totalScores ?? [];
  const scores = buildScores(players, totalScores);
  const winnerScore = Math.max(...scores.map((row) => row.score));
  const winnerIds = scores.filter((row) => row.score === winnerScore).map((row) => row.playerId);

  return {
    gameType: "kleurenwiezen",
    playedAt: new Date(slice?.lastResult?.timestamp ?? Date.now()).toISOString(),
    players: players.map((player, index) => ({
      playerId: player?.id ?? `player_${index}`,
      name: player?.name ?? `Player ${index + 1}`,
    })),
    winnerIds,
    scores,
    metadata: {
      startedAt: slice?.matchStartedAt ?? null,
      finishedAt: slice?.lastResult?.timestamp ?? Date.now(),
      contractId: slice?.contractId ?? null,
      simulated: false,
    },
    gameData: {
      contractId: slice?.contractId ?? null,
      contractLabel: contract?.label ?? slice?.contractId ?? "-",
      contractOrder: contract?.order ?? null,
      declarantSeat: slice?.declarantSeat ?? null,
      partnerSeat: slice?.partnerSeat ?? null,
      dealerSeat: slice?.dealerSeat ?? null,
      starterSeat: slice?.starterSeat ?? null,
      trumpSuit: slice?.trumpSuit ?? null,
      trumpLabel: slice?.trumpSuit ? getTrumpLabel(slice?.trumpSuit) : "Geen troef",
      teamLabel: getFriendlyTeamLabel(slice, players),
      trickHistory: slice?.trickHistory ?? [],
      attackTricks: evaluation?.attackTricks ?? 0,
      defenseTricks: evaluation?.defenseTricks ?? 0,
      targetTricks: evaluation?.targetTricks ?? slice?.targetTricks ?? null,
      success: evaluation?.success ?? null,
      resultLabel: evaluation?.resultLabel ?? null,
      playerDeltas: evaluation?.playerDeltas ?? [],
    },
  };
}
