export function getPlayerStats(playerId, matches) {

  const playedMatches = matches.filter(match =>
    match.players.some(p => p.playerId === playerId)
  );

  const wins = matches.filter(match =>
    (match.winnerIds ?? []).includes(playerId)
  );

  const totalScore = playedMatches.reduce((sum, match) => {

    const entry = match.scores.find(
      s => s.playerId === playerId
    );

    return sum + (entry?.score ?? 0);

  }, 0);

  return {
    matchesPlayed: playedMatches.length,
    wins: wins.length,
    winRate: playedMatches.length
      ? wins.length / playedMatches.length
      : 0,
    totalScore
  };
}