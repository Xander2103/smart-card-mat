import { determineTrickWinner } from "../../../game/trickLogic";
import { computeScoresFromTrickHistory } from "../scoring";
import { getContract } from "../contracts";
import { pushLog, clampIndex, inc, countHeartsInTrickHistory } from "./utils";
import { clearHandRuntimeFields, setDobbelState } from "./slice";
import { anyContractLeft } from "./contractsRules";

export function handleConfirmTurn(state, d) {
  if (state.phase !== "PLAYING_TRICK") return state;

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
      log: pushLog(state.log, `ERROR|DUPLICATE_CARD|${card}|P${d.currentPlayerIndex}`),
    };
  }

  if ((d.currentTrick ?? []).some((p) => p.playerIndex === d.currentPlayerIndex)) {
    return state;
  }

  const played = { playerIndex: d.currentPlayerIndex, zone: expectedZone, uid, card };
  const nextTrick = [...(d.currentTrick ?? []), played];

  let nextLog = pushLog(state.log, `CONFIRM|${expectedZone}|${uid}|${card}|P${d.currentPlayerIndex}`);

  const nextUsedCodes = [...(d.usedCardCodes ?? []), card];
  const nextUsedSet = { ...(d.usedCardSet ?? {}), [card]: true };

  let nextPlayerIndex = (d.currentPlayerIndex + 1) % playersCount;

  if (nextTrick.length !== playersCount) {
    const nextD = {
      ...d,
      confirmedTurnCard: played,
      pile: [...(d.pile ?? []), played],
      currentTrick: nextTrick,
      currentPlayerIndex: nextPlayerIndex,
      usedCardCodes: nextUsedCodes,
      usedCardSet: nextUsedSet,
    };

    return setDobbelState({ ...state, lastError: null, log: nextLog }, nextD);
  }

  const starterIndex =
    typeof d.lastTrickWinnerIndex === "number" ? d.lastTrickWinnerIndex : d.leaderIndex;

  const winner = determineTrickWinner(nextTrick, d.contract, starterIndex);
  if (!winner) return state;

  const winnerIndex = winner.playerIndex;
  const nextTricksPlayed = (d.tricksPlayedInContract ?? 0) + 1;

  nextLog = pushLog(nextLog, `TRICK_WIN|P${winnerIndex}`);
  nextLog = pushLog(nextLog, `TRICKS_IN_CONTRACT|${nextTricksPlayed}/13`);

  const trickResult = {
    id: (d.trickHistory?.length ?? 0) + 1,
    contract: d.contract,
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
  let endEarlyMeta = null;

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
      const res = impl.shouldEndEarly({ trickHistory: baseAfterTrickD.trickHistory });

      if (res === true) {
        endEarly = true;
        endEarlyReason = "ENDED_EARLY";
      } else if (res && typeof res === "object") {
        endEarly = !!res.endEarly;
        endEarlyReason = res.reason ?? (endEarly ? "ENDED_EARLY" : null);
        endEarlyMeta = res.meta ?? null;
      }
    }
  }

  nextLog = pushLog(
    nextLog,
    `END_EARLY|${d.contract}|${endEarly ? "YES" : "NO"}|${endEarlyReason ?? "-"}`
  );

  const contractDone = nextTricksPlayed >= 13 || endEarly;

  if (contractDone) {
    const nextChooser = clampIndex((d.chooserIndex ?? 0) + 1, playersCount);

    const contractScores = computeScoresFromTrickHistory(
      baseAfterTrickD.trickHistory,
      playersCount
    );

    const prevTotal = d.totalScores ?? Array(playersCount).fill(0);
    const nextTotal = Array.from(
      { length: playersCount },
      (_, i) => (prevTotal[i] ?? 0) + (contractScores[i] ?? 0)
    );

    const lastResult = {
      contract: d.contract,
      contractScores,
      totalScores: nextTotal,
      endedEarly: endEarly,
      endedEarlyReason: endEarlyReason,
      timestamp: Date.now(),
      overlayClosed: false,
      endedByPlayerIndex:
        endEarlyReason === "HEARTS_KING_PLAYED"
          ? (baseAfterTrickD.lastTrickWinnerIndex ?? null)
          : null,
      endedByCard: endEarlyReason === "HEARTS_KING_PLAYED" ? "KH" : null,
      endedEarlyMeta: endEarlyMeta,
    };

    const nextPhase = anyContractLeft({
      ...d,
      contractPlays: inc(d.contractPlays, d.contract),
      lastContract: d.contract,
    })
      ? "CHOOSING_CONTRACT"
      : "DOBBELKINGEN_DONE";

    const nextD = {
      ...d,
      contractPlays: inc(d.contractPlays, d.contract),
      lastContract: d.contract,
      contract: null,
      chooserIndex: nextChooser,
      leaderIndex: 0,
      currentPlayerIndex: nextChooser,
      totalScores: nextTotal,
      lastResult,
      ...clearHandRuntimeFields(),
    };

    return setDobbelState(
      {
        ...state,
        phase: nextPhase,
        lastError: null,
        turnZone: null,
        log: pushLog(
          nextLog,
          endEarly
            ? `CONTRACT_END_EARLY|${lastResult.contract}|${endEarlyReason}|NEXT_CHOOSER=P${nextChooser}`
            : `CONTRACT_END|TRICKS=13|NEXT_CHOOSER=P${nextChooser}`
        ),
      },
      nextD
    );
  }

  return setDobbelState({ ...state, lastError: null, log: nextLog }, baseAfterTrickD);
}
