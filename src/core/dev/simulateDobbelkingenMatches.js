import { storageService } from "../storage/services/storageService";

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function createRandomScores(players) {
  const base = players.map((player) => ({
    playerId: player.id,
    name: player.name,
    score: Math.floor(Math.random() * 101), // 0 - 100
  }));

  const sorted = [...base].sort((a, b) => b.score - a.score);

  return sorted.map((row, index) => ({
    playerId: row.playerId,
    score: row.score,
    rank: index + 1,
  }));
}

function ensureFourPlayers(appState) {
  const selectedPlayers = Array.isArray(appState?.players)
    ? appState.players.filter(Boolean)
    : [];

  const storedPlayers = storageService.getPlayers();

  const merged = [];
  const usedIds = new Set();

  function pushUnique(player) {
    if (!player?.id || usedIds.has(player.id)) return;
    usedIds.add(player.id);
    merged.push({
      id: player.id,
      name: player.name ?? "Unknown Player",
    });
  }

  selectedPlayers.forEach(pushUnique);
  storedPlayers.forEach(pushUnique);

  let simIndex = 1;
  while (merged.length < 4) {
    merged.push({
      id: `sim_player_${Date.now()}_${simIndex}`,
      name: `Sim Player ${simIndex}`,
    });
    simIndex += 1;
  }

  return merged.slice(0, 4);
}

function buildSimulatedMatchRecord(appState, matchIndex = 0) {
  const players = ensureFourPlayers(appState);
  const shuffledPlayers = shuffle(players);
  const scores = createRandomScores(shuffledPlayers);
  const winner = scores.find((row) => row.rank === 1) ?? null;

  return {
    gameType: "dobbelkingen",
    playedAt: new Date(Date.now() + matchIndex * 1000).toISOString(),
    players: players.map((player) => ({
      playerId: player.id,
      name: player.name,
    })),
    winnerIds: winner ? [winner.playerId] : [],
    scores,
    metadata: {
      simulated: true,
      source: "dev-tools",
    },
    gameData: {
      simulated: true,
    },
  };
}

export function simulateDobbelkingenMatches(appState, count = 1) {
  for (let i = 0; i < count; i += 1) {
    const matchRecord = buildSimulatedMatchRecord(appState, i);
    storageService.saveMatch(matchRecord);
  }
}