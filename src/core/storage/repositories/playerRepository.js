import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";

function normalizePlayerName(name) {
  return String(name ?? "").trim();
}

export const playerRepository = {
  getPlayers() {
    return localStorageAdapter.get(STORAGE_KEYS.PLAYERS, []);
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
      createdAt: nowIso(),
      archived: false,
    };

    const updated = [...players, player];
    localStorageAdapter.set(STORAGE_KEYS.PLAYERS, updated);

    return player;
  },
};