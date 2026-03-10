import { playerRepository } from "../repositories/playerRepository";
import { matchRepository } from "../repositories/matchRepository";
import { getPlayerStats as computePlayerStats } from "../../stats/statsService";

export const storageService = {
  getPlayers() {
    return playerRepository.getPlayers();
  },

  getPlayerById(playerId) {
    return playerRepository.getPlayerById(playerId);
  },

  createPlayer(name) {
    return playerRepository.createPlayer(name);
  },

  deletePlayer(playerId) {
    return playerRepository.deletePlayer(playerId);
  },

  getMatchHistory() {
    return matchRepository.getMatches();
  },

  getMatchById(matchId) {
    return matchRepository.getMatchById(matchId);
  },

  saveMatch(matchData) {
    return matchRepository.saveMatch(matchData);
  },

  deleteMatch(matchId) {
    return matchRepository.deleteMatch(matchId);
  },

  clearMatchHistory() {
    return matchRepository.clearMatches();
  },

  clearSimulatedMatches() {
    return matchRepository.clearSimulatedMatches();
  },

  getPlayerStats(playerId) {
    const matches = matchRepository.getMatches();
    return computePlayerStats(playerId, matches);
  },
};