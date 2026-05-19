import { buildMatchPlayers } from "./playerRecordBuilder";

export function buildDobbelkingenMatchRecord(state) {
  const dobbel = state?.game?.dobbelkingen ?? {};
  const players = state?.players ?? [];
  const summary = dobbel?.matchSummary ?? null;

  const finishedAt = dobbel?.matchFinishedAt ?? Date.now();

  const scores =
    summary?.ranking?.map((row) => ({
      playerId: players?.[row.playerIndex]?.id ?? `player_${row.playerIndex}`,
      score: row.score,
      rank: row.place,
    })) ?? [];

  const winnerIndex = summary?.winnerPlayerIndex ?? null;
  const winnerPlayer =
    typeof winnerIndex === "number" ? players?.[winnerIndex] ?? null : null;

  const contractHistory = summary?.contracts ?? dobbel?.history ?? [];

  const contracts = contractHistory.map((entry) => {
    const chooserIndex = entry?.chooserIndex ?? null;
    const chooserPlayer =
      typeof chooserIndex === "number" ? players?.[chooserIndex] ?? null : null;

    const chooserScoreDelta =
      typeof chooserIndex === "number"
        ? Number(entry?.contractScores?.[chooserIndex] ?? 0)
        : 0;

    return {
      chooserPlayerId: chooserPlayer?.id ?? null,
      contract: entry?.contract ?? null,
      scoreDelta: chooserScoreDelta,
      chooserIndex,
      leaderIndex: entry?.leaderIndex ?? null,
      trumpSuit: entry?.trumpSuit ?? null,
      contractScores: [...(entry?.contractScores ?? [])],
      totalScoresAfter: [...(entry?.totalScoresAfter ?? [])],
      endedEarlyReason: entry?.endedEarlyReason ?? null,
      timestamp: entry?.timestamp ?? null,
    };
  });

  return {
    gameType: "dobbelkingen",
    playedAt: new Date(finishedAt).toISOString(),

    players: buildMatchPlayers(players),

    winnerIds: winnerPlayer?.id ? [winnerPlayer.id] : [],

    scores,

    metadata: {
      phase: dobbel?.roundPhase ?? 1,
      startedAt: dobbel?.matchStartedAt ?? null,
      finishedAt: dobbel?.matchFinishedAt ?? null,
    },

    gameData: {
      contracts,
      history: dobbel?.history ?? [],
      trickHistory: dobbel?.trickHistory ?? [],
      summary,
    },
  };
}