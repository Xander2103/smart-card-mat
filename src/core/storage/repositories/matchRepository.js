import { STORAGE_KEYS } from "../keys";
import { localStorageAdapter } from "../adapter/localStorageAdapter";
import { createId } from "../../utils/id";
import { nowIso } from "../../utils/time";

export const matchRepository = {

  getMatches() {
    return localStorageAdapter.get(STORAGE_KEYS.MATCHES, []);
  },

  getMatchById(matchId) {
    const matches = this.getMatches();
    return matches.find(m => m.id === matchId) ?? null;
  },

  saveMatch(matchData) {

    const matches = this.getMatches();

    const match = {
      id: createId("match"),
      ...matchData,
      createdAt: nowIso()
    };

    const updated = [...matches, match];

    localStorageAdapter.set(STORAGE_KEYS.MATCHES, updated);

    return match;
  }

};