import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";

function validateMatchRecord(matchData) {
  if (!matchData?.gameType) {
    throw new Error("gameType is verplicht.");
  }

  if (!Array.isArray(matchData?.players) || matchData.players.length === 0) {
    throw new Error("players is verplicht.");
  }

  if (!Array.isArray(matchData?.scores)) {
    throw new Error("scores moet een array zijn.");
  }
}

export const matchRepository = {
  getMatches() {
    const matches = localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);

    return [...matches].sort(
      (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    );
  },

  getMatchById(matchId) {
    return this.getMatches().find((match) => match.id === matchId) ?? null;
  },

  saveMatch(matchData) {
    validateMatchRecord(matchData);

    const matches = localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);

    const match = {
      id: createId("match"),
      playedAt: matchData.playedAt ?? nowIso(),
      winnerIds: matchData.winnerIds ?? [],
      metadata: matchData.metadata ?? {},
      gameData: matchData.gameData ?? {},
      ...matchData,
      createdAt: nowIso(),
    };

    const updated = [...matches, match];
    localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);

    return match;
  },

  deleteMatch(matchId) {
    const matches = localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);
    const updated = matches.filter((match) => match.id !== matchId);
    localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);
  },

  clearMatches() {
    localStorageAdapter.set(STORAGE_KEYS.MATCHES, []);
  },

  clearSimulatedMatches() {
    const matches = localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);
    const updated = matches.filter((match) => !match?.metadata?.simulated);
    localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);
  },
};