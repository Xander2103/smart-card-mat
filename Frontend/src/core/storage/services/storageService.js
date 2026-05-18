import { playerRepository } from "../repositories/playerRepository";
import { matchRepository } from "../repositories/matchRepository";
import { getPlayerStats as computePlayerStats } from "../../stats/statsService";

function emitDataChanged() {
  window.dispatchEvent(new CustomEvent("smartcardmat:data-changed"));
}

export const storageService = {
  getPlayers() {
    return playerRepository.getPlayers();
  },

  getPlayerById(playerId) {
    return playerRepository.getPlayerById(playerId);
  },

  createPlayer(name) {
    const player = playerRepository.createPlayer(name);
    emitDataChanged();
    return player;
  },

  deletePlayer(playerId) {
    const result = playerRepository.deletePlayer(playerId);
    emitDataChanged();
    return result;
  },

  getMatchHistory() {
    return matchRepository.getMatches();
  },

  getMatchById(matchId) {
    return matchRepository.getMatchById(matchId);
  },

  saveMatch(matchData) {
    const result = matchRepository.saveMatch(matchData);
    emitDataChanged();
    return result;
  },

  async retryMatchSync(matchId) {
    const result = await matchRepository.retrySyncMatch(matchId);
    emitDataChanged();
    return result;
  },

  deleteMatch(matchId) {
    const result = matchRepository.deleteMatch(matchId);
    emitDataChanged();
    return result;
  },

  clearMatchHistory() {
    const result = matchRepository.clearMatches();
    emitDataChanged();
    return result;
  },

  clearSimulatedMatches() {
    const result = matchRepository.clearSimulatedMatches();
    emitDataChanged();
    return result;
  },

  getPlayerStats(playerId) {
    const matches = matchRepository.getMatches();
    return computePlayerStats(playerId, matches);
  },
};