import { playerRepository } from "../repositories/playerRepository";
import { matchRepository } from "../repositories/matchRepository";
import { getPlayerStats } from "../../stats/statsService";

export const storageService = {

  // Players
  getPlayers() {
    return playerRepository.getPlayers();
  },

  createPlayer(name) {
    return playerRepository.createPlayer(name);
  },

  getPlayerById(playerId) {
    return playerRepository.getPlayerById(playerId);
  },

  // Matches
  getMatchHistory() {
    return matchRepository.getMatches();
  },

  saveMatch(matchData) {
    return matchRepository.saveMatch(matchData);
  },

  // Stats
  getPlayerStats(playerId) {

    const matches = matchRepository.getMatches();

    return getPlayerStats(playerId, matches);
  }

};