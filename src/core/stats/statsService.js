export function getPlayerStats(playerId, matches = []) {
  const playedMatches = matches.filter((match) =>
    (match.players ?? []).some((player) => player.playerId === playerId)
  );

  const scoreRows = playedMatches
    .map((match) =>
      (match.scores ?? []).find((entry) => entry.playerId === playerId) ?? null
    )
    .filter(Boolean);

  const matchesPlayed = playedMatches.length;

  const wins = scoreRows.filter((row) => row.rank === 1).length;
  const podiums = scoreRows.filter((row) => row.rank <= 3).length;
  const lastPlaces = scoreRows.filter((row) => row.rank === 4).length;
  const losses = matchesPlayed - wins;

  const totalScore = scoreRows.reduce((sum, row) => sum + Number(row.score ?? 0), 0);

  const averageScore =
    matchesPlayed === 0 ? 0 : totalScore / matchesPlayed;

  const bestScore =
    scoreRows.length === 0
      ? 0
      : Math.max(...scoreRows.map((row) => Number(row.score ?? 0)));

  const worstScore =
    scoreRows.length === 0
      ? 0
      : Math.min(...scoreRows.map((row) => Number(row.score ?? 0)));

  const winRate = matchesPlayed === 0 ? 0 : (wins / matchesPlayed) * 100;
  const podiumRate = matchesPlayed === 0 ? 0 : (podiums / matchesPlayed) * 100;

  return {
    matchesPlayed,
    wins,
    losses,
    winRate,
    podiums,
    podiumRate,
    lastPlaces,
    totalScore,
    averageScore,
    bestScore,
    worstScore,
  };
}

export function getAllPlayerStats(players = [], matches = []) {
  return players.map((player) => ({
    player,
    stats: getPlayerStats(player.id, matches),
  }));
}