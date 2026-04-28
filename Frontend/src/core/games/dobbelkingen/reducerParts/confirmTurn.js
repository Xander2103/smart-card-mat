// src/core/games/dobbelkingen/reducerParts/confirmTurn.js
import { determineTrickWinner } from "../../../game/trickLogic";
import { getContract } from "../contracts";
import {
  getDobbelState,
  setDobbelState,
  pushLog,
} from "./state";
import { countHeartsInTrickHistory } from "./contractsRules";
import {
  finishDobbelContract,
  computeDobbelContractScores,
} from "./finishContract";

export function handleDobbelConfirmTurn(state, action) {
  if (action.type !== "confirm_turn") return state;
  if (state.phase !== "PLAYING_TRICK") return state;

  const d = getDobbelState(state);
  const playersCount = state.players?.length ?? 4;

  const expectedZone = (d.currentPlayerIndex ?? 0) + 1;
  const zoneIndex = expectedZone - 1;

  const uid = state.zones?.[zoneIndex] ?? null;
  if (!uid) return state;

  const card = state.mapping?.[uid] ?? null;
  if (!card) return state;

  if (d.usedCardSet?.[card]) {
    return {
      ...state,
      lastError: `Kaart ${card} is al gebruikt in dit contract!`,
      log: pushLog(
        state.log,
        `ERROR|DUPLICATE_CARD|${card}|P${d.currentPlayerIndex}`
      ),
    };
  }

  if ((d.currentTrick ?? []).some((p) => p.playerIndex === d.currentPlayerIndex)) {
    return state;
  }

  const played = {
    playerIndex: d.currentPlayerIndex,
    zone: expectedZone,
    uid,
    card,
  };

  const nextTrick = [...(d.currentTrick ?? []), played];

  let nextLog = pushLog(
    state.log,
    `CONFIRM|${expectedZone}|${uid}|${card}|P${d.currentPlayerIndex}`
  );

  const nextUsedCodes = [...(d.usedCardCodes ?? []), card];
  const nextUsedSet = { ...(d.usedCardSet ?? {}), [card]: true };

  let nextPlayerIndex = (d.currentPlayerIndex + 1) % playersCount;

  if (nextTrick.length !== playersCount) {
    return setDobbelState(
      { ...state, lastError: null, log: nextLog },
      {
        ...d,
        confirmedTurnCard: played,
        pile: [...(d.pile ?? []), played],
        currentTrick: nextTrick,
        currentPlayerIndex: nextPlayerIndex,
        usedCardCodes: nextUsedCodes,
        usedCardSet: nextUsedSet,
      }
    );
  }

  const starterIndex =
    typeof d.lastTrickWinnerIndex === "number"
      ? d.lastTrickWinnerIndex
      : d.currentContractStarterIndex || d.leaderIndex;

  const winner = determineTrickWinner(nextTrick, {
    contractId: d.contract,
    trumpSuit: d.currentTrumpSuit,
    starterPlayerIndex: starterIndex,
  });

  if (!winner) return state;

  const winnerIndex = winner.playerIndex;
  const nextTricksPlayed = (d.tricksPlayedInContract ?? 0) + 1;

  nextLog = pushLog(nextLog, `TRICK_WIN|P${winnerIndex}`);
  nextLog = pushLog(nextLog, `TRICKS_IN_CONTRACT|${nextTricksPlayed}/13`);

  const trickResult = {
    id: (d.trickHistory?.length ?? 0) + 1,
    contract: d.contract,
    trumpSuit: d.currentTrumpSuit ?? null,
    plays: nextTrick,
    winnerIndex,
    timestamp: Date.now(),
  };

  nextPlayerIndex = winnerIndex;

  const baseAfterTrickD = {
    ...d,
    confirmedTurnCard: played,
    pile: [...(d.pile ?? []), played],
    currentTrick: [],
    currentPlayerIndex: nextPlayerIndex,
    trickHistory: [...(d.trickHistory ?? []), trickResult],
    lastTrick: trickResult,
    lastTrickWinnerIndex: winnerIndex,
    usedCardCodes: nextUsedCodes,
    usedCardSet: nextUsedSet,
    tricksPlayedInContract: nextTricksPlayed,
  };

  let endEarly = false;
  let endEarlyReason = null;

  if (d.contract === "MINSTE_HARTEN") {
    const heartsPlayed = countHeartsInTrickHistory(baseAfterTrickD.trickHistory);
    nextLog = pushLog(nextLog, `HEARTS_PLAYED|${heartsPlayed}/13`);

    if (heartsPlayed >= 13) {
      endEarly = true;
      endEarlyReason = "ALL_HEARTS_PLAYED";
    }
  }

  if (!endEarly) {
    const impl = getContract(d.contract);
    if (impl?.shouldEndEarly) {
      const res = impl.shouldEndEarly({
        trickHistory: baseAfterTrickD.trickHistory,
      });

      if (res === true) {
        endEarly = true;
        endEarlyReason = "ENDED_EARLY";
      } else if (res && typeof res === "object") {
        endEarly = !!res.endEarly;
        endEarlyReason = res.reason ?? (endEarly ? "ENDED_EARLY" : null);
      }
    }
  }

  const contractDone = nextTricksPlayed >= 13 || endEarly;

  if (!contractDone) {
    return setDobbelState(
      { ...state, lastError: null, log: nextLog },
      baseAfterTrickD
    );
  }

  const contractScores = computeDobbelContractScores(
    baseAfterTrickD.trickHistory,
    playersCount
  );

  return finishDobbelContract({
    state,
    dobbelStateAfterTrick: baseAfterTrickD,
    contractScores,
    endEarly,
    endEarlyReason,
    nextLog,
  });
}