import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";
import { saveMatchToApi } from "../../api/matchApi";

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

function updateStoredMatch(matchId, updates) {
  const matches = localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);

  const updated = matches.map((match) => {
    if (match.id !== matchId) {
      return match;
    }

    return {
      ...match,
      ...updates,
    };
  });

  localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);
}

function syncMatchToApi(match) {
  saveMatchToApi(match)
    .then((savedMatch) => {
      updateStoredMatch(match.id, {
        apiSyncStatus: "synced",
        apiId: savedMatch.id,
        syncedAt: nowIso(),
        syncError: null,
      });

      console.log("Match synced to Laravel:", savedMatch);
    })
    .catch((error) => {
      updateStoredMatch(match.id, {
        apiSyncStatus: "failed",
        syncError: error.message,
        lastSyncAttemptAt: nowIso(),
      });

      console.warn("Match saved locally, but Laravel sync failed:", error);
    });
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

    const existingMatchKey =
      matchData?.gameData?.summary?.matchId ??
      matchData?.metadata?.matchId ??
      null;

    if (existingMatchKey) {
      const existingMatch = matches.find((match) => {
        const storedMatchKey =
          match?.gameData?.summary?.matchId ??
          match?.metadata?.matchId ??
          null;

        return storedMatchKey === existingMatchKey;
      });

      if (existingMatch) {
        return existingMatch;
      }
    }

    const match = {
      id: createId("match"),
      playedAt: matchData.playedAt ?? nowIso(),
      winnerIds: matchData.winnerIds ?? [],
      metadata: matchData.metadata ?? {},
      gameData: matchData.gameData ?? {},
      ...matchData,
      apiSyncStatus: "pending",
      apiId: null,
      syncedAt: null,
      syncError: null,
      createdAt: nowIso(),
    };

    const updated = [...matches, match];
    localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);

    syncMatchToApi(match);

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