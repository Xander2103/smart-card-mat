import { determineTrickWinner } from "../../game/trickLogic";
import { getKleurenwiezenContract } from "./contracts";
import {
  clampStep,
  createEmptyRuntime,
  getCalculatedStarterSeat,
  getCurrentStepKey,
  getEffectiveTargetTricks,
  getInitialKleurenwiezenState,
  getAttackSeatList,
  getDefenseSeatList,
  getTotalTricksForContract,
  normalizeSeat,
  shouldInstantFailAfterTrick,
} from "./helpers";
import { evaluateRound } from "./selectors";

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > 200 ? next.slice(0, 200) : next;
}

function getSlice(state) {
  return state.game?.kleurenwiezen ?? getInitialKleurenwiezenState(state.players?.length ?? 4);
}

function setSlice(state, nextSlice) {
  return {
    ...state,
    game: {
      ...(state.game ?? {}),
      kleurenwiezen: nextSlice,
    },
  };
}

function syncDerivedFields(slice, playersCount) {
  const starterSeat = getCalculatedStarterSeat(slice, playersCount);
  const targetTricks = getEffectiveTargetTricks(slice);
  return {
    ...slice,
    starterSeat,
    targetTricks,
  };
}

function getSetupError(slice, playersCount) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  if (!contract) return "Kies eerst een contract.";
  if (typeof slice?.declarantSeat !== "number") return "Kies een declarant.";
  if (contract.needsPartner && typeof slice?.partnerSeat !== "number") {
    return "Kies een partner voor dit contract.";
  }
  if (contract.needsPartner && slice?.partnerSeat === slice?.declarantSeat) {
    return "Declarant en partner mogen niet dezelfde speler zijn.";
  }
  if (contract.needsTrump && !slice?.trumpSuit) return "Kies een troefkleur.";
  if (contract.id === "TROEL" && !["ownTrump", "otherTrump"].includes(slice?.troelTargetMode)) {
    return "Kies voor troel of de partner eigen troef of andere troef speelt.";
  }
  const starterSeat = getCalculatedStarterSeat(slice, playersCount);
  if (starterSeat == null) return "Kan de eerste uitkomst niet bepalen.";
  return "";
}

function applyRoundEvaluation(slice, players) {
  const evaluation = evaluateRound(slice, players);
  const baseScores = slice.totalScores ?? Array(players.length || 4).fill(0);
  const nextTotalScores = baseScores.map((score, index) => score + (evaluation.playerDeltas?.[index] ?? 0));

  return {
    ...slice,
    totalScores: nextTotalScores,
    roundFinished: true,
    pointsAppliedForRound: true,
    lastResult: {
      id: `kw_result_${Date.now()}`,
      contractId: slice.contractId,
      contractLabel: getKleurenwiezenContract(slice.contractId)?.label ?? slice.contractId,
      declarantSeat: slice.declarantSeat,
      partnerSeat: slice.partnerSeat,
      dealerSeat: slice.dealerSeat,
      starterSeat: slice.starterSeat,
      trumpSuit: slice.trumpSuit,
      troelTargetMode: slice.troelTargetMode,
      targetTricks: slice.targetTricks,
      result: evaluation,
      timestamp: Date.now(),
    },
  };
}

function createClaimedTricks(slice, playersCount, awardedTo) {
  const totalTricks = getTotalTricksForContract(slice);
  const playedTricks = slice.trickHistory?.length ?? 0;
  const remainingTricks = Math.max(0, totalTricks - playedTricks);
  if (remainingTricks <= 0) {
    return {
      extraTricks: [],
      lastWinnerIndex: slice.lastTrickWinnerIndex ?? null,
      remainingTricks: 0,
    };
  }

  const attackSeats = getAttackSeatList(slice, playersCount);
  const defenseSeats = getDefenseSeatList(slice, playersCount);
  const fallbackSeat = typeof slice.declarantSeat === "number" ? slice.declarantSeat : 0;
  const awardedSeats = awardedTo === "defense" ? defenseSeats : attackSeats;
  const winnerIndex = awardedSeats[0] ?? fallbackSeat;

  const extraTricks = Array.from({ length: remainingTricks }, (_, index) => ({
    id: playedTricks + index + 1,
    plays: [],
    winnerIndex,
    contract: slice.contractId,
    trumpSuit: slice.trumpSuit,
    timestamp: Date.now() + index,
    synthetic: true,
    awardedTo,
  }));

  return {
    extraTricks,
    lastWinnerIndex: winnerIndex,
    remainingTricks,
  };
}

export function reduceKleurenwiezen(state, action) {
  if (state.modeId !== "kleurenwiezen") return state;

  const playersCount = state.players?.length ?? 4;
  const slice = syncDerivedFields(getSlice(state), playersCount);

  if (action.type === "set_kleurenwiezen_contract") {
    const contract = getKleurenwiezenContract(action.contractId);
    if (!contract) return state;

    let nextSlice = {
      ...slice,
      contractId: contract.id,
      setupStep: 0,
      trumpSuit: contract.needsTrump ? slice.trumpSuit : null,
      partnerSeat: contract.needsPartner ? slice.partnerSeat : null,
      troelTargetMode: contract.id === "TROEL" ? slice.troelTargetMode ?? "ownTrump" : "ownTrump",
    };
    nextSlice = syncDerivedFields(nextSlice, playersCount);
    return setSlice({ ...state, lastError: null }, nextSlice);
  }

  if (action.type === "set_kleurenwiezen_setup_field") {
    const field = action.field;
    if (!field) return state;
    let value = action.value;

    if (["declarantSeat", "partnerSeat"].includes(field)) {
      value = value == null ? null : normalizeSeat(value, playersCount);
    }

    if (field === "trumpSuit") {
      value = String(value ?? "").toUpperCase();
      value = ["H", "D", "C", "S"].includes(value) ? value : null;
    }

    if (field === "troelTargetMode") {
      value = value === "otherTrump" ? "otherTrump" : "ownTrump";
    }

    const nextSlice = syncDerivedFields({ ...slice, [field]: value }, playersCount);
    return setSlice({ ...state, lastError: null }, nextSlice);
  }

  if (action.type === "set_kleurenwiezen_step") {
    return setSlice({ ...state, lastError: null }, { ...slice, setupStep: clampStep(slice, Number(action.step) || 0) });
  }

  if (action.type === "next_kleurenwiezen_step") {
    return setSlice({ ...state, lastError: null }, { ...slice, setupStep: clampStep(slice, (slice.setupStep ?? 0) + 1) });
  }

  if (action.type === "prev_kleurenwiezen_step") {
    return setSlice({ ...state, lastError: null }, { ...slice, setupStep: clampStep(slice, (slice.setupStep ?? 0) - 1) });
  }

  if (action.type === "start_kleurenwiezen_round") {
    const setupError = getSetupError(slice, playersCount);
    if (setupError) return { ...state, lastError: setupError };

    const starterSeat = getCalculatedStarterSeat(slice, playersCount);
    const nextSlice = {
      ...slice,
      ...createEmptyRuntime(),
      currentPlayerIndex: starterSeat,
      leaderIndex: starterSeat,
      starterSeat,
      targetTricks: getEffectiveTargetTricks(slice),
      matchStartedAt: Date.now(),
      matchFinishedAt: null,
      pendingMatchFinalize: false,
    };

    return setSlice(
      {
        ...state,
        phase: "PLAYING_TRICK",
        lastError: null,
        log: pushLog(state.log, `KLEURENWIEZEN|START|${slice.contractId}`),
      },
      nextSlice
    );
  }

  if (action.type === "finish_kleurenwiezen_round") {
    const resultEntry = slice.lastResult;
    const finishedAt = Date.now();
    const nextDealer = normalizeSeat((slice.dealerSeat ?? playersCount - 1) + 1, playersCount);
    const nextSlice = syncDerivedFields(
      {
        ...slice,
        ...createEmptyRuntime(),

        // Terug naar contractkeuze/setup
        setupStep: 0,

        // Volgende deler
        dealerSeat: nextDealer,

        // Resultaat wel bewaren in history
        history: resultEntry ? [resultEntry, ...(slice.history ?? [])] : slice.history ?? [],

        // Belangrijk: actieve round-result leegmaken
        lastResult: null,
        pendingMatchFinalize: false,
        matchFinishedAt: null,

        // Zeker leegmaken voor volgende contractronde
        contractId: null,
        declarantSeat: null,
        partnerSeat: null,
        trumpSuit: null,
        currentTrick: [],
        trickHistory: [],
        usedCardCodes: [],
        roundFinished: false,
      },
      playersCount
    );

    return setSlice(
      {
        ...state,
        phase: "KLEURENWIEZEN_SETUP",
        lastError: null,
        log: pushLog(state.log, `KLEURENWIEZEN|ROUND_FINISH|${slice.contractId}`),
      },
      nextSlice
    );
  }

  if (action.type === "abort_contract") {
    const nextSlice = syncDerivedFields(
      {
        ...slice,
        ...createEmptyRuntime(),
        setupStep: 0,
        pendingMatchFinalize: false,
        matchFinishedAt: null,
      },
      playersCount
    );

    return setSlice(
      {
        ...state,
        phase: "KLEURENWIEZEN_SETUP",
        lastError: null,
        log: pushLog(state.log, "KLEURENWIEZEN|ABORT"),
      },
      nextSlice
    );
  }

  if (action.type === "undo_last_play") {
    const currentTrick = slice.currentTrick ?? [];
    if (currentTrick.length === 0) return state;

    const nextCurrentTrick = currentTrick.slice(0, -1);
    const removed = currentTrick[currentTrick.length - 1];
    const nextPile = (slice.pile ?? []).slice(0, -1);
    const nextUsedCodes = nextPile.map((play) => play.card).filter(Boolean);
    const nextUsedSet = Object.fromEntries(nextUsedCodes.map((code) => [code, true]));

    return setSlice(
      { ...state, lastError: null, log: pushLog(state.log, "KLEURENWIEZEN|UNDO") },
      {
        ...slice,
        currentTrick: nextCurrentTrick,
        pile: nextPile,
        usedCardCodes: nextUsedCodes,
        usedCardSet: nextUsedSet,
        currentPlayerIndex: typeof removed?.playerIndex === "number" ? removed.playerIndex : slice.currentPlayerIndex,
      }
    );
  }

  if (action.type === "finish_kleurenwiezen_round_early") {
    if (state.phase !== "PLAYING_TRICK") return state;
    if (slice.roundFinished) return state;

    const awardedTo = action.awardedTo === "defense" ? "defense" : "attack";
    const { extraTricks, lastWinnerIndex, remainingTricks } = createClaimedTricks(slice, playersCount, awardedTo);

    let nextSlice = {
      ...slice,
      currentTrick: [],
      trickHistory: [...(slice.trickHistory ?? []), ...extraTricks],
      leaderIndex: lastWinnerIndex ?? slice.leaderIndex,
      currentPlayerIndex: lastWinnerIndex ?? slice.currentPlayerIndex,
      lastTrickWinnerIndex: lastWinnerIndex ?? slice.lastTrickWinnerIndex,
      lastTrick: extraTricks[extraTricks.length - 1] ?? slice.lastTrick,
      roundFinished: true,
      earlyFinishAwardedTo: awardedTo,
      earlyFinishRemainingTricks: remainingTricks,
    };

    nextSlice = applyRoundEvaluation(nextSlice, state.players ?? []);

    return setSlice(
      {
        ...state,
        lastError: null,
        log: pushLog(state.log, `KLEURENWIEZEN|EARLY_FINISH|${awardedTo.toUpperCase()}|${remainingTricks}`),
      },
      nextSlice
    );
  }

  if (action.type === "reset_pile") {
    return setSlice(
      { ...state, lastError: null, log: pushLog(state.log, "KLEURENWIEZEN|RESET") },
      {
        ...slice,
        ...createEmptyRuntime(),
        currentPlayerIndex: slice.starterSeat ?? 0,
        leaderIndex: slice.starterSeat ?? 0,
      }
    );
  }

  if (action.type === "confirm_turn") {
    if (state.phase !== "PLAYING_TRICK") return state;
    if (slice.roundFinished) return state;

    const zoneIndex = slice.currentPlayerIndex ?? 0;
    const uid = state.zones?.[zoneIndex] ?? null;
    const card = uid ? state.mapping?.[uid] ?? null : null;
    if (!uid || !card) return { ...state, lastError: "Leg eerst een kaart in de juiste zone." };
    if (slice.usedCardSet?.[card]) return { ...state, lastError: `Kaart ${card} is al gespeeld in deze ronde.` };

    const play = {
      zone: zoneIndex + 1,
      uid,
      card,
      playerIndex: slice.currentPlayerIndex,
      timestamp: Date.now(),
    };

    const nextCurrentTrick = [...(slice.currentTrick ?? []), play];
    const nextPile = [...(slice.pile ?? []), play];
    const nextUsedCardCodes = [...(slice.usedCardCodes ?? []), card];
    const nextUsedCardSet = { ...(slice.usedCardSet ?? {}), [card]: true };

    if (nextCurrentTrick.length < playersCount) {
      return setSlice(
        { ...state, lastError: null },
        {
          ...slice,
          currentTrick: nextCurrentTrick,
          pile: nextPile,
          usedCardCodes: nextUsedCardCodes,
          usedCardSet: nextUsedCardSet,
          currentPlayerIndex: (slice.currentPlayerIndex + 1) % playersCount,
        }
      );
    }

    const winningPlay = determineTrickWinner(nextCurrentTrick, {
      contractId: slice.contractId,
      trumpSuit: slice.trumpSuit,
      starterPlayerIndex: slice.leaderIndex,
    });

    const winnerIndex = winningPlay?.playerIndex ?? slice.leaderIndex ?? 0;
    const trickResult = {
      id: (slice.trickHistory?.length ?? 0) + 1,
      plays: nextCurrentTrick,
      winnerIndex,
      contract: slice.contractId,
      trumpSuit: slice.trumpSuit,
      timestamp: Date.now(),
    };
    const nextTrickHistory = [...(slice.trickHistory ?? []), trickResult];
    const totalTricks = getTotalTricksForContract(slice);
    const instantFail = shouldInstantFailAfterTrick(slice, winnerIndex);
    const roundFinished = instantFail || nextTrickHistory.length >= totalTricks;

    let nextSlice = {
      ...slice,
      currentTrick: [],
      pile: nextPile,
      usedCardCodes: nextUsedCardCodes,
      usedCardSet: nextUsedCardSet,
      trickHistory: nextTrickHistory,
      leaderIndex: winnerIndex,
      currentPlayerIndex: winnerIndex,
      lastTrickWinnerIndex: winnerIndex,
      lastTrick: trickResult,
      roundFinished,
      instantFailTriggered: instantFail,
    };

    if (roundFinished) {
      nextSlice = applyRoundEvaluation(nextSlice, state.players ?? []);
    }

    return setSlice({ ...state, lastError: null }, nextSlice);
  }

  return state;
}
