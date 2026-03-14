import { storageService } from "../storage/services/storageService";
import { KLEURENWIEZEN_CONTRACTS } from "../games/kleurenwiezen/contracts";

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function rankScores(scores) {
  const ranked = [...scores].sort((a, b) => b.score - a.score);
  return ranked.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function simulateKleurenwiezenMatch(players, options = {}) {
  const chosenPlayers = (players ?? []).slice(0, 4);
  if (chosenPlayers.length < 4) {
    throw new Error("Minstens 4 spelers nodig om Kleurenwiezen te simuleren.");
  }

  const contract = options.contract ?? randomFrom(KLEURENWIEZEN_CONTRACTS);
  const success = options.success !== false;
  const declarantSeat = options.declarantSeat ?? 0;
  const partnerSeat = contract.needsPartner ? (options.partnerSeat ?? ((declarantSeat + 2) % 4)) : null;
  const dealerSeat = options.dealerSeat ?? 3;
  const trumpSuit = contract.needsTrump ? (options.trumpSuit ?? "H") : null;
  const targetTricks = options.targetTricks ?? contract.targetTricks ?? 0;
  const attackTricks = success
    ? (contract.targetType === "exact" ? targetTricks : Math.min(13, targetTricks + (contract.needsPartner ? 1 : 0)))
    : Math.max(0, targetTricks - 1);
  const defenseTricks = 13 - attackTricks;

  const base = [0, 0, 0, 0];
  if (success) {
    const delta = contract.successPoints ?? (Array.isArray(contract.successScores) ? contract.successScores[0] : 15);
    base[declarantSeat] += delta;
    if (contract.needsPartner && partnerSeat != null) base[partnerSeat] += delta;
  } else {
    const loss = Math.abs(contract.failPlayersPoints ?? -18);
    const win = Math.abs(contract.failOppPoints ?? 12);
    base[declarantSeat] -= loss;
    if (contract.needsPartner && partnerSeat != null) base[partnerSeat] -= loss;
    base.forEach((_, idx) => {
      if (idx !== declarantSeat && idx !== partnerSeat) base[idx] += win;
    });
  }

  const scored = rankScores(chosenPlayers.map((player, index) => ({
    playerId: player.id,
    score: base[index],
  })));

  const winnerScore = Math.max(...scored.map((row) => row.score));
  const winnerIds = scored.filter((row) => row.score === winnerScore).map((row) => row.playerId);

  const record = {
    gameType: "kleurenwiezen",
    playedAt: new Date().toISOString(),
    players: chosenPlayers.map((player) => ({ playerId: player.id, name: player.name })),
    winnerIds,
    scores: scored,
    metadata: {
      simulated: true,
      source: "dev-tools",
      contractId: contract.id,
    },
    gameData: {
      contractId: contract.id,
      contractLabel: contract.label,
      declarantSeat,
      partnerSeat,
      dealerSeat,
      trumpSuit,
      attackTricks,
      defenseTricks,
      targetTricks,
      success,
      resultLabel: success ? "Contract gehaald" : "Contract niet gehaald",
    },
  };

  storageService.saveMatch(record);
  return record;
}
