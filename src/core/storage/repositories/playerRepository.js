import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";

export const playerRepository = {

  getPlayers() {
    return localStorageAdapter.get(STORAGE_KEYS.PLAYERS, []);
  },

  getPlayerById(playerId) {
    const players = this.getPlayers();
    return players.find(p => p.id === playerId) ?? null;
  },

  createPlayer(name) {

    const players = this.getPlayers();

    const player = {
      id: createId("player"),
      name: name.trim(),
      createdAt: nowIso(),
      archived: false
    };

    const updated = [...players, player];

    localStorageAdapter.set(STORAGE_KEYS.PLAYERS, updated);

    return player;
  }

};