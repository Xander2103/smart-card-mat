function getMatchesForPlayer(playerId, matches = []) {
  return matches.filter((match) =>
    (match.players ?? []).some((player) => player.playerId === playerId)
  );
}

function getScoreRowsForPlayer(playerId, matches = []) {
  return getMatchesForPlayer(playerId, matches)
    .map((match) => ({
      match,
      scoreRow:
        (match.scores ?? []).find((entry) => entry.playerId === playerId) ?? null,
    }))
    .filter((entry) => entry.scoreRow);
}

function getSafeRate(part, total) {
  if (!total) return 0;
  return (part / total) * 100;
}

function getBestByCount(mapObj) {
  const entries = Object.entries(mapObj ?? {});
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0] ?? null;
}

function getWorstByCount(mapObj) {
  const entries = Object.entries(mapObj ?? {});
  if (entries.length === 0) return null;

  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0] ?? null;
}

function buildBaseStatsFromMatches(playerId, matches = []) {
  const scoreEntries = getScoreRowsForPlayer(playerId, matches);

  const matchesPlayed = scoreEntries.length;
  const wins = scoreEntries.filter((entry) => entry.scoreRow.rank === 1).length;
  const podiums = scoreEntries.filter((entry) => entry.scoreRow.rank <= 3).length;
  const lastPlaces = scoreEntries.filter((entry) => entry.scoreRow.rank === 4).length;
  const losses = matchesPlayed - wins;

  const totalScore = scoreEntries.reduce(
    (sum, entry) => sum + Number(entry.scoreRow.score ?? 0),
    0
  );

  const averageScore = matchesPlayed === 0 ? 0 : totalScore / matchesPlayed;

  const bestScore =
    scoreEntries.length === 0
      ? 0
      : Math.max(...scoreEntries.map((entry) => Number(entry.scoreRow.score ?? 0)));

  const worstScore =
    scoreEntries.length === 0
      ? 0
      : Math.min(...scoreEntries.map((entry) => Number(entry.scoreRow.score ?? 0)));

  return {
    matchesPlayed,
    wins,
    losses,
    winRate: getSafeRate(wins, matchesPlayed),
    podiums,
    lastPlaces,
    totalScore,
    averageScore,
    bestScore,
    worstScore,
  };
}

export function getPlayerStats(playerId, matches = []) {
  return buildBaseStatsFromMatches(playerId, matches);
}

export function getPlayerStatsByGameMode(playerId, matches = []) {
  const playerMatches = getMatchesForPlayer(playerId, matches);
  const grouped = {};

  for (const match of playerMatches) {
    const gameType = String(match.gameType ?? "unknown").toLowerCase();

    if (!grouped[gameType]) {
      grouped[gameType] = [];
    }

    grouped[gameType].push(match);
  }

  const result = {};

  for (const [gameType, gameMatches] of Object.entries(grouped)) {
    result[gameType] = buildBaseStatsFromMatches(playerId, gameMatches);
  }

  return result;
}

export function getPlayerGeneralInsights(playerId, matches = []) {
  const byGameMode = getPlayerStatsByGameMode(playerId, matches);

  const playedCounts = {};
  const avgScores = {};

  for (const [gameType, stats] of Object.entries(byGameMode)) {
    playedCounts[gameType] = stats.matchesPlayed;
    avgScores[gameType] = stats.averageScore;
  }

  const mostPlayedGame = getBestByCount(playedCounts);
  const leastPlayedGame = getWorstByCount(playedCounts);

  let bestGameMode = null;
  let worstGameMode = null;

  const avgEntries = Object.entries(avgScores);
  if (avgEntries.length > 0) {
    avgEntries.sort((a, b) => b[1] - a[1]);
    bestGameMode = avgEntries[0][0] ?? null;
    worstGameMode = avgEntries[avgEntries.length - 1][0] ?? null;
  }

  return {
    mostPlayedGame,
    leastPlayedGame,
    bestGameMode,
    worstGameMode,
  };
}

export function getDobbelkingenContractInsights(playerId, matches = []) {
  const dobbelMatches = getMatchesForPlayer(playerId, matches).filter(
    (match) => String(match.gameType ?? "").toLowerCase() === "dobbelkingen"
  );

  const contractPickCounts = {};
  const contractScores = {};

  for (const match of dobbelMatches) {
    const contracts = match?.gameData?.contracts ?? [];

    for (const contractEntry of contracts) {
      const chooserPlayerId = contractEntry?.chooserPlayerId ?? null;
      const contractName = contractEntry?.contract ?? null;
      const scoreDelta = Number(contractEntry?.scoreDelta ?? 0);

      if (!contractName) continue;
      if (chooserPlayerId !== playerId) continue;

      contractPickCounts[contractName] =
        (contractPickCounts[contractName] ?? 0) + 1;

      if (!contractScores[contractName]) {
        contractScores[contractName] = [];
      }

      contractScores[contractName].push(scoreDelta);
    }
  }

  const mostPickedContract = getBestByCount(contractPickCounts);
  const leastPickedContract = getWorstByCount(contractPickCounts);

  let bestContract = null;
  let worstContract = null;

  const avgEntries = Object.entries(contractScores).map(([contract, scores]) => ({
    contract,
    average:
      scores.length === 0
        ? 0
        : scores.reduce((sum, value) => sum + value, 0) / scores.length,
  }));

  if (avgEntries.length > 0) {
    avgEntries.sort((a, b) => b.average - a.average);
    bestContract = avgEntries[0]?.contract ?? null;
    worstContract = avgEntries[avgEntries.length - 1]?.contract ?? null;
  }

  return {
    mostPickedContract,
    leastPickedContract,
    bestContract,
    worstContract,
  };
}

export function getKleurenwiezenInsights(playerId, matches = []) {
  const kleurenMatches = getMatchesForPlayer(playerId, matches).filter(
    (match) => String(match.gameType ?? "").toLowerCase() === "kleurenwiezen"
  );

  let highestContract = null;
  let highestOrder = -1;

  for (const match of kleurenMatches) {
    const success = !!match?.gameData?.success;
    const order = Number(match?.gameData?.contractOrder ?? -1);
    const label = match?.gameData?.contractLabel ?? null;
    if (!success || !label) continue;
    if (order > highestOrder) {
      highestOrder = order;
      highestContract = label;
    }
  }

  return {
    highestAchievedContract: highestContract,
  };
}
