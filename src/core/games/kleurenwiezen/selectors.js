import { getKleurenwiezenContract } from "./contracts";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "./helpers";

export function getTrumpLabel(suit) {
  switch (String(suit ?? "").toUpperCase()) {
    case "H":
      return "♥ Harten";
    case "D":
      return "♦ Ruiten";
    case "C":
      return "♣ Klaveren";
    case "S":
      return "♠ Schoppen";
    default:
      return "Geen troef";
  }
}

export function getContractLabel(contractId) {
  return getKleurenwiezenContract(contractId)?.label ?? "—";
}

export function getTrickWinsByPlayer(trickHistory = [], playersCount = 4) {
  const wins = Array(playersCount).fill(0);
  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;
    if (typeof winnerIndex === "number" && winnerIndex >= 0 && winnerIndex < playersCount) {
      wins[winnerIndex] += 1;
    }
  }
  return wins;
}

export function getAttackSeatSet(slice) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const attackSeats = new Set();
  if (typeof slice?.declarantSeat === "number") attackSeats.add(slice.declarantSeat);
  if (contract?.needsPartner && typeof slice?.partnerSeat === "number") attackSeats.add(slice.partnerSeat);
  return attackSeats;
}

export function getFriendlyTeamLabel(slice, players = []) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (!contract) return "—";

  const declarantName =
    typeof slice?.declarantSeat === "number"
      ? players?.[slice.declarantSeat]?.name ?? `Player ${slice.declarantSeat + 1}`
      : "—";

  if (!contract.needsPartner) {
    return `${declarantName} solo`;
  }

  const partnerName =
    typeof slice?.partnerSeat === "number"
      ? players?.[slice.partnerSeat]?.name ?? `Player ${slice.partnerSeat + 1}`
      : "Nog kiezen";

  return `${declarantName} + ${partnerName}`;
}

export function getTeamTrickSummary(slice, players = []) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const trickWins = getTrickWinsByPlayer(slice?.trickHistory ?? [], players.length || 4);
  const attackSeats = getAttackSeatSet(slice);

  let attackTricks = 0;
  let defenseTricks = 0;

  trickWins.forEach((count, index) => {
    if (attackSeats.has(index)) attackTricks += count;
    else defenseTricks += count;
  });

  return {
    attackLabel: getFriendlyTeamLabel(slice, players),
    defenseLabel: contract?.needsPartner ? "Tegenpartij" : "Rest van de tafel",
    attackTricks,
    defenseTricks,
  };
}

function getSuccessPoints(contract, actualAttackTricks, targetTricks, slice) {
  if (contract.id === "TROEL") {
    return slice?.troelTargetMode === "otherTrump" ? contract.troelSuccessOther : contract.troelSuccessOwn;
  }

  if (Array.isArray(contract.successScores) && contract.successScores.length > 0) {
    const index = Math.max(0, Math.min(contract.successScores.length - 1, actualAttackTricks - targetTricks));
    return contract.successScores[index];
  }

  return contract.successPoints ?? 0;
}

function getFailPlayersPoints(contract, actualAttackTricks, targetTricks) {
  if (typeof contract.failPlayersPoints === "number") return contract.failPlayersPoints;
  const under = Math.max(1, targetTricks - actualAttackTricks);
  const value = (contract.failStart ?? 0) + (under - 1) * (contract.failStep ?? 0);
  const limited = typeof contract.failMax === "number" ? Math.min(contract.failMax, value) : value;
  return -limited;
}

function getFailOppPoints(contract, actualAttackTricks, targetTricks) {
  if (typeof contract.failOppPoints === "number") return contract.failOppPoints;
  const under = Math.max(1, targetTricks - actualAttackTricks);
  const value = (contract.failOppBase ?? 0) + (under - 1) * (contract.failOppStep ?? 0);
  return typeof contract.failOppMax === "number" ? Math.min(contract.failOppMax, value) : value;
}

export function evaluateRound(slice, players = []) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const teamSummary = getTeamTrickSummary(slice, players);
  const targetTricks = getEffectiveTargetTricks(slice);
  const starterSeat = getCalculatedStarterSeat(slice, players.length || 4);

  if (!contract || targetTricks == null) {
    return {
      success: null,
      targetLabel: "—",
      resultLabel: "Nog geen contract geselecteerd",
      attackPoints: 0,
      defensePoints: 0,
      playerDeltas: Array(players.length || 4).fill(0),
      starterSeat,
      ...teamSummary,
    };
  }

  const actual = teamSummary.attackTricks;
  const success = contract.targetType === "exact" ? actual === targetTricks : actual >= targetTricks;
  const comparisonWord = contract.targetType === "exact" ? "exact" : "minstens";
  const attackSeats = getAttackSeatSet(slice);
  const playerCount = players.length || 4;
  const playerDeltas = Array(playerCount).fill(0);

  let attackPoints = 0;
  let defensePoints = 0;

  if (success) {
    attackPoints = getSuccessPoints(contract, actual, targetTricks, slice);
    attackSeats.forEach((seat) => {
      if (seat >= 0 && seat < playerCount) playerDeltas[seat] += attackPoints;
    });
  } else {
    attackPoints = getFailPlayersPoints(contract, actual, targetTricks);
    defensePoints = getFailOppPoints(contract, actual, targetTricks);
    attackSeats.forEach((seat) => {
      if (seat >= 0 && seat < playerCount) playerDeltas[seat] += attackPoints;
    });
    for (let i = 0; i < playerCount; i += 1) {
      if (!attackSeats.has(i)) playerDeltas[i] += defensePoints;
    }
  }

  return {
    success,
    targetTricks,
    targetLabel: `${comparisonWord} ${targetTricks} slagen`,
    resultLabel: success ? "Contract gehaald" : "Contract niet gehaald",
    attackPoints,
    defensePoints,
    playerDeltas,
    starterSeat,
    ...teamSummary,
  };
}
