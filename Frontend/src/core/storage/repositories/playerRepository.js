import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";

function normalizePlayerName(name) {
  return String(name ?? "").trim();
}

function normalizeStoredPlayer(player) {
  const cleanName = normalizePlayerName(player?.name);

  return {
    id: player?.id ?? createId("player"),
    name: cleanName,
    source: player?.source ?? "guest",
    userId: player?.userId ?? null,
    isGuest: player?.isGuest ?? false,
    isLocalProfile: player?.isLocalProfile ?? true,
    archived: player?.archived ?? false,
    createdAt: player?.createdAt ?? nowIso(),
  };
}

export const playerRepository = {
  getPlayers() {
    const players = localStorageAdapter.get(STORAGE_KEYS.PLAYERS, []);

    return players
      .map(normalizeStoredPlayer)
      .filter((player) => player.name);
  },

  getPlayerById(playerId) {
    const players = this.getPlayers();
    return players.find((player) => player.id === playerId) ?? null;
  },

  createPlayer(name) {
    const cleanName = normalizePlayerName(name);

    if (!cleanName) {
      throw new Error("Spelernaam is verplicht.");
    }

    const players = this.getPlayers();

    const existing = players.find(
      (player) => player.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    const player = {
      id: createId("player"),
      name: cleanName,
      source: "guest",
      userId: null,
      isGuest: false,
      isLocalProfile: true,
      archived: false,
      createdAt: nowIso(),
    };

    const updated = [...players, player];
    localStorageAdapter.set(STORAGE_KEYS.PLAYERS, updated);

    return player;
  },

  deletePlayer(playerId) {
    const players = this.getPlayers();
    const updated = players.filter((player) => player.id !== playerId);
    localStorageAdapter.set(STORAGE_KEYS.PLAYERS, updated);
  },
};