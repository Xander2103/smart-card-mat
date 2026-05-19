function getUserIdFromPlayerId(playerId) {
  const match = String(playerId ?? "").match(/^user_(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function buildMatchPlayers(players = []) {
  return players.map((player, index) => {
    const playerId = player?.id ?? `player_${index}`;

    const inferredUserId = getUserIdFromPlayerId(playerId);
    const userId = player?.userId ?? inferredUserId ?? null;

    const source =
      userId != null
        ? "user"
        : player?.source ??
          (player?.isGuest ? "guest" : "local");

    return {
      playerId,
      name: player?.name ?? `Player ${index + 1}`,
      userId,
      source,
      username: player?.username ?? null,
    };
  });
}