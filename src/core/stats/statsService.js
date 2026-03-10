export function getPlayerStats(playerId, matches = []) {
  const playedMatches = matches.filter((match) =>
    (match.players ?? []).some((player) => player.playerId === playerId)
  );

  const wins = playedMatches.filter((match) =>
    (match.winnerIds ?? []).includes(playerId)
  ).length;

  const totalScore = playedMatches.reduce((sum, match) => {
    const row = (match.scores ?? []).find((entry) => entry.playerId === playerId);
    return sum + Number(row?.score ?? 0);
  }, 0);

  const matchesPlayed = playedMatches.length;
  const winRate = matchesPlayed === 0 ? 0 : (wins / matchesPlayed) * 100;

  return {
    matchesPlayed,
    wins,
    winRate,
    totalScore,
  };
}

export function getAllPlayerStats(players = [], matches = []) {
  return players.map((player) => ({
    player,
    stats: getPlayerStats(player.id, matches),
  }));
}