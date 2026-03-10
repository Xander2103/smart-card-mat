export function buildDobbelkingenMatchRecord(state) {

  const dobbel = state?.game?.dobbelkingen;
  const players = state?.players ?? [];

  const summary = dobbel?.matchSummary ?? {};

  const finishedAt = dobbel?.matchFinishedAt ?? Date.now();

  const scores =
    summary?.ranking?.map((row) => ({
      playerId: players?.[row.playerIndex]?.id ?? `player_${row.playerIndex}`,
      score: row.score,
      rank: row.place
    })) ?? [];

  const winnerIndex = summary?.winnerPlayerIndex ?? null;

  const winner =
    typeof winnerIndex === "number"
      ? players?.[winnerIndex]
      : null;

  return {

    gameType: "dobbelkingen",

    playedAt: new Date(finishedAt).toISOString(),

    players: players.map((player, index) => ({
      playerId: player?.id ?? `player_${index}`,
      name: player?.name ?? `Player ${index + 1}`
    })),

    winnerIds: winner?.id ? [winner.id] : [],

    scores,

    metadata: {
      phase: dobbel?.roundPhase ?? 1
    },

    gameData: {
      contracts: dobbel?.history ?? [],
      trickHistory: dobbel?.trickHistory ?? [],
      summary
    }

  };

}