import { storageService } from "../storage/services/storageService";

const DEV_PLAYERS = [
  { name: "DEV 1" },
  { name: "DEV 2" },
  { name: "DEV 3" },
  { name: "DEV 4" },
];

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function ensureDevPlayersExist() {
  const existingPlayers = storageService.getPlayers();

  for (const devPlayer of DEV_PLAYERS) {
    const exists = existingPlayers.some((player) => player.name === devPlayer.name);

    if (!exists) {
      storageService.createPlayer(devPlayer.name);
    }
  }
}

function getDevPlayersFromStorage() {
  const storedPlayers = storageService.getPlayers();

  return DEV_PLAYERS.map((devPlayer) => {
    const found = storedPlayers.find((player) => player.name === devPlayer.name);

    return {
      id: found?.id ?? devPlayer.name.toLowerCase().replace(/\s+/g, "_"),
      name: found?.name ?? devPlayer.name,
    };
  });
}

function createZeroSumScores(players) {
  const shuffled = shuffle(players);

  const a = Math.floor(Math.random() * 121) - 60;
  const b = Math.floor(Math.random() * 121) - 60;
  const c = Math.floor(Math.random() * 121) - 60;
  const d = -(a + b + c);

  let rawScores = [a, b, c, d];

  if (Math.abs(d) > 100) {
    const values = [a, b, c, d].sort((x, y) => y - x);
    rawScores = [
      values[0],
      values[1],
      values[2],
      -(values[0] + values[1] + values[2]),
    ];
  }

  const combined = shuffled.map((player, index) => ({
    playerId: player.id,
    name: player.name,
    score: rawScores[index],
  }));

  const ranked = [...combined].sort((x, y) => y.score - x.score);

  return ranked.map((row, index) => ({
    playerId: row.playerId,
    score: row.score,
    rank: index + 1,
  }));
}

function buildSimulatedContracts(players) {
  const contractPool = [
    "MINSTE_HARTEN",
    "LAATSTE_SLAG",
    "GEEN_SLAGEN",
    "MINSTE_BOEREN_KONINGEN",
    "MINSTE_QUEENS",
    "HARTEN_KONING",
    "TROEF",
  ];

  const entries = [];
  const rounds = Math.floor(Math.random() * 6) + 4;

  for (let i = 0; i < rounds; i += 1) {
    const chooser = players[i % players.length];

    entries.push({
      chooserPlayerId: chooser.id,
      contract: randomFrom(contractPool),
      scoreDelta: Math.floor(Math.random() * 41) - 20,
    });
  }

  return entries;
}

function buildSimulatedMatchRecord(matchIndex = 0) {
  ensureDevPlayersExist();

  const players = getDevPlayersFromStorage();
  const scores = createZeroSumScores(players);
  const winner = scores.find((row) => row.rank === 1) ?? null;
  const contracts = buildSimulatedContracts(players);

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
      devPlayersOnly: true,
      zeroSum: true,
    },
    gameData: {
      simulated: true,
      contracts,
    },
  };
}

export function simulateDobbelkingenMatches(count = 1) {
  for (let i = 0; i < count; i += 1) {
    const matchRecord = buildSimulatedMatchRecord(i);
    storageService.saveMatch(matchRecord);
  }
}