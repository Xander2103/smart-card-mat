export function normalizeApiPlayers(apiMatch, rawState) {
  if (Array.isArray(rawState?.players) && rawState.players.length > 0) {
    return rawState.players;
  }

  return (apiMatch?.players ?? []).map((player) => ({
    playerId: player.player_id,
    name: player.name,
    userId: player.user_id ?? null,
    source: player.source ?? "guest",
    username: player.username ?? null,
  }));
}

export function normalizeApiScores(apiMatch, rawState) {
  if (Array.isArray(rawState?.scores) && rawState.scores.length > 0) {
    return rawState.scores;
  }

  return (apiMatch?.players ?? []).map((player) => ({
    playerId: player.player_id,
    score: Number(player.score ?? 0),
    rank: player?.stats?.rank ?? null,
  }));
}

export function normalizeApiWinnerIds(apiMatch, rawState) {
  if (Array.isArray(rawState?.winnerIds)) {
    return rawState.winnerIds;
  }

  const winners = (apiMatch?.players ?? [])
    .filter((player) => player.is_winner)
    .map((player) => player.player_id);

  if (winners.length > 0) {
    return winners;
  }

  return apiMatch?.winner_player_id ? [apiMatch.winner_player_id] : [];
}

export function normalizeApiMatch(apiMatch) {
  const rawState = apiMatch?.raw_state ?? {};
  const clientMatchId =
    apiMatch?.client_match_id ?? rawState?.id ?? `api_${apiMatch.id}`;

  return {
    ...rawState,

    id: clientMatchId,
    apiId: apiMatch.id,
    apiSyncStatus: "synced",
    syncedAt: apiMatch.updated_at ?? null,
    syncError: null,
    isOnlineMatch: true,
    isOnlineOnly: true,

    gameType: rawState?.gameType ?? apiMatch?.mode ?? "-",
    playedAt:
      rawState?.playedAt ?? apiMatch?.played_at ?? apiMatch?.created_at ?? null,

    winnerIds: normalizeApiWinnerIds(apiMatch, rawState),
    players: normalizeApiPlayers(apiMatch, rawState),
    scores: normalizeApiScores(apiMatch, rawState),

    metadata: rawState?.metadata ?? {},
    gameData: rawState?.gameData ?? {},
  };
}

export function getMatchMergeKey(match) {
  return match?.id ?? match?.client_match_id ?? `api_${match?.apiId}`;
}

export function mergeMatches(localMatches = [], apiMatches = []) {
  const merged = new Map();

  for (const localMatch of localMatches) {
    merged.set(getMatchMergeKey(localMatch), {
      ...localMatch,
      isOnlineOnly: false,
    });
  }

  for (const apiMatch of apiMatches) {
    const normalized = normalizeApiMatch(apiMatch);
    const key = getMatchMergeKey(normalized);
    const existing = merged.get(key);

    merged.set(key, {
      ...existing,
      ...normalized,
      isOnlineOnly: !existing,
    });
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );
}

export function buildAccountPlayersFromMatches(matches = []) {
  const playersById = new Map();

  for (const match of matches) {
    for (const player of match.players ?? []) {
      if (player?.source !== "user") continue;

      const id = player?.playerId ?? player?.id;
      if (!id) continue;

      const existing = playersById.get(id);

      playersById.set(id, {
        id,
        name: existing?.name ?? player?.name ?? "Unknown player",
        userId: existing?.userId ?? player?.userId ?? null,
        source: "user",
        username: existing?.username ?? player?.username ?? null,
        isFromMatchHistory: true,
      });
    }
  }

  return [...playersById.values()];
}