import { getKleurenwiezenContract } from "./contracts";

export function createEmptyRuntime() {
  return {
    pile: [],
    currentTrick: [],
    trickHistory: [],
    usedCardCodes: [],
    usedCardSet: {},
    lastTrickWinnerIndex: null,
    lastTrick: null,
    currentPlayerIndex: 0,
    leaderIndex: 0,
    roundFinished: false,
    pointsAppliedForRound: false,
    lastResult: null,
    instantFailTriggered: false,
    earlyFinishAwardedTo: null,
    earlyFinishRemainingTricks: 0,
  };
}

export function getInitialKleurenwiezenState(playersCount = 4) {
  return {
    setupStep: 0,
    contractId: null,
    declarantSeat: null,
    partnerSeat: null,
    dealerSeat: playersCount > 0 ? playersCount - 1 : 0,
    starterSeat: 0,
    trumpSuit: null,
    troelTargetMode: "ownTrump",
    targetTricks: null,
    totalScores: Array(playersCount).fill(0),
    history: [],
    matchStartedAt: null,
    matchFinishedAt: null,
    pendingMatchFinalize: false,
    ...createEmptyRuntime(),
  };
}

export function getSetupStepList(contract) {
  const needsPartner = !!contract?.needsPartner;
  const needsTrump = !!contract?.needsTrump;

  return [
    { key: "contract", label: "Contract" },
    { key: "roles", label: "Rollen" },
    ...(needsPartner ? [{ key: "partner", label: "Partner" }] : []),
    ...(needsTrump ? [{ key: "trump", label: "Troef" }] : []),
    { key: "summary", label: "Samenvatting" },
  ];
}

export function getCurrentStepKey(slice) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const steps = getSetupStepList(contract);
  const index = Math.max(0, Math.min(steps.length - 1, slice?.setupStep ?? 0));
  return steps[index]?.key ?? "contract";
}

export function clampStep(slice, nextStep) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const steps = getSetupStepList(contract);
  return Math.max(0, Math.min(steps.length - 1, nextStep));
}

export function normalizeSeat(value, playersCount = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (playersCount <= 0) return 0;
  return ((n % playersCount) + playersCount) % playersCount;
}

export function getCalculatedStarterSeat(slice, playersCount = 4) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (contract?.id === "TROEL" && typeof slice?.partnerSeat === "number") {
    return normalizeSeat(slice.partnerSeat, playersCount);
  }

  const dealerSeat = normalizeSeat(slice?.dealerSeat ?? playersCount - 1, playersCount);
  return normalizeSeat((dealerSeat ?? 0) + 1, playersCount);
}

export function getEffectiveTargetTricks(slice) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (!contract) return null;
  if (contract.id === "TROEL") {
    return slice?.troelTargetMode === "otherTrump" ? 9 : 8;
  }
  return contract.targetTricks ?? null;
}

export function getTotalTricksForContract(slice) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  return contract?.totalTricks ?? 13;
}

export function shouldInstantFailAfterTrick(slice, winnerIndex) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (!contract?.instantFailOnDeclarantTrick) return false;
  return typeof slice?.declarantSeat === "number" && winnerIndex === slice.declarantSeat;
}

export function getAttackSeatList(slice, playersCount = 4) {
  const seats = [];
  if (typeof slice?.declarantSeat === "number") {
    seats.push(normalizeSeat(slice.declarantSeat, playersCount));
  }
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (contract?.needsPartner && typeof slice?.partnerSeat === "number") {
    const partnerSeat = normalizeSeat(slice.partnerSeat, playersCount);
    if (!seats.includes(partnerSeat)) seats.push(partnerSeat);
  }
  return seats;
}

export function getDefenseSeatList(slice, playersCount = 4) {
  const attackSeats = new Set(getAttackSeatList(slice, playersCount));
  const defenseSeats = [];
  for (let i = 0; i < playersCount; i += 1) {
    if (!attackSeats.has(i)) defenseSeats.push(i);
  }
  return defenseSeats;
}
