// src/core/games/dobbelkingen/reducerParts/finishContract.js
import {
  getDobbelState,
  setDobbelState,
  clearHandRuntimeFields,
  pushLog,
  clampIndex,
  inc,
} from "./state";
import { anyPhase1ContractLeft } from "./contractsRules";
import {
  allPlayersPickedTroefTwice,
  getNextTroefChooserIndex,
} from "./troefFlow";
import { computeScoresFromTrickHistory } from "../scoring";
import { getContract } from "../contracts";

function buildHistoryEntry({
  d,
  chooserIndex,
  leaderIndex,
  contractScores,
  totalScoresAfter,
  endEarlyReason,
}) {
  const contractDef = getContract(d.contract);

  return {
    contract: d.contract,
    label: contractDef?.label ?? d.contract,
    chooserIndex,
    leaderIndex,
    trumpSuit: d.currentTrumpSuit ?? null,
    contractScores: [...(contractScores ?? [])],
    totalScoresAfter: [...(totalScoresAfter ?? [])],
    endedEarlyReason: endEarlyReason ?? null,
    timestamp: Date.now(),
  };
}

function buildRanking(finalScores, players) {
  return [...finalScores]
    .map((score, playerIndex) => ({
      playerIndex,
      name: players?.[playerIndex]?.name ?? `Player ${playerIndex + 1}`,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      ...row,
      place: index + 1,
    }));
}

function buildMatchSummary({
  players,
  d,
  finalScores,
  finishedAt,
}) {
  const ranking = buildRanking(finalScores, players);
  const winner = ranking[0] ?? null;

  return {
    matchId: `dobbelkingen_${finishedAt}`,
    game: "DOBBELKINGEN",
    startedAt: d.matchStartedAt ?? null,
    finishedAt,
    winnerPlayerIndex: winner?.playerIndex ?? null,
    winnerName: winner?.name ?? null,
    finalScores: [...finalScores],
    ranking,
    players: players.map((p, index) => ({
      playerIndex: index,
      name: p?.name ?? `Player ${index + 1}`,
    })),
    contracts: [...(d.history ?? [])],
  };
}

export function finishDobbelContract({
  state,
  dobbelStateAfterTrick,
  contractScores,
  endEarly,
  endEarlyReason,
  nextLog,
}) {
  const d = getDobbelState(state);
  const players = state.players ?? [];
  const playersCount = players.length || 4;

  const prevTotal = d.totalScores ?? Array(playersCount).fill(0);
  const nextTotal = Array.from(
    { length: playersCount },
    (_, i) => (prevTotal[i] ?? 0) + (contractScores[i] ?? 0)
  );

  if (d.roundPhase === 1) {
    const currentChooser = clampIndex(d.chooserIndex ?? 0, playersCount);
    const nextChooser = clampIndex((d.chooserIndex ?? 0) + 1, playersCount);
    const nextContractPlays = inc(d.contractPlays, d.contract);

    const historyEntry = buildHistoryEntry({
      d,
      chooserIndex: currentChooser,
      leaderIndex: d.leaderIndex ?? null,
      contractScores,
      totalScoresAfter: nextTotal,
      endEarlyReason,
    });

    const nextHistory = [...(d.history ?? []), historyEntry];

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
          ? dobbelStateAfterTrick.lastTrickWinnerIndex ?? null
          : null,
      endedByCard: endEarlyReason === "HEARTS_KING_PLAYED" ? "KH" : null,
    };

    const hasMorePhase1 = anyPhase1ContractLeft({
      ...d,
      contractPlays: nextContractPlays,
      lastContract: d.contract,
    });

    if (hasMorePhase1) {
      return setDobbelState(
        {
          ...state,
          phase: "CHOOSING_CONTRACT",
          lastError: null,
          turnZone: null,
          log: pushLog(
            nextLog,
            `PHASE1_CONTRACT_END|NEXT_CHOOSER=P${nextChooser}`
          ),
        },
        {
          ...d,
          contractPlays: nextContractPlays,
          lastContract: d.contract,
          contract: null,
          chooserIndex: nextChooser,
          leaderIndex: 0,
          currentPlayerIndex: nextChooser,
          currentTrumpSuit: null,
          currentContractStarterIndex: 0,
          totalScores: nextTotal,
          lastResult,
          history: nextHistory,
          ...clearHandRuntimeFields(),
        }
      );
    }

    return setDobbelState(
      {
        ...state,
        phase: "CHOOSING_TROEF",
        lastError: null,
        turnZone: null,
        log: pushLog(nextLog, "PHASE1_DONE|GO_TO_PHASE2_TROEF"),
      },
      {
        ...d,
        contractPlays: nextContractPlays,
        lastContract: d.contract,
        contract: null,
        roundPhase: 2,
        chooserIndex: 0,
        troefChooserIndex: 0,
        troefPickCounts: Array(playersCount).fill(0),
        leaderIndex: 0,
        currentPlayerIndex: 0,
        currentTrumpSuit: null,
        currentContractStarterIndex: 0,
        totalScores: nextTotal,
        lastResult,
        history: nextHistory,
        ...clearHandRuntimeFields(),
      }
    );
  }

  const chooser = clampIndex(d.troefChooserIndex ?? 0, playersCount);
  const nextTroefPickCounts = [
    ...(d.troefPickCounts ?? Array(playersCount).fill(0)),
  ];
  nextTroefPickCounts[chooser] = (nextTroefPickCounts[chooser] ?? 0) + 1;

  const historyEntry = buildHistoryEntry({
    d,
    chooserIndex: chooser,
    leaderIndex: d.leaderIndex ?? null,
    contractScores,
    totalScoresAfter: nextTotal,
    endEarlyReason: null,
  });

  const nextHistory = [...(d.history ?? []), historyEntry];

  const doneAllTroef = allPlayersPickedTroefTwice(
    nextTroefPickCounts,
    playersCount
  );

  const nextTroefChooser = getNextTroefChooserIndex(chooser, playersCount);

  if (doneAllTroef) {
    const finishedAt = Date.now();

    const summary = buildMatchSummary({
      players,
      d: {
        ...d,
        history: nextHistory,
      },
      finalScores: nextTotal,
      finishedAt,
    });

    return setDobbelState(
      {
        ...state,
        phase: "DOBBELKINGEN_DONE",
        lastError: null,
        turnZone: null,
        log: pushLog(nextLog, "PHASE2_DONE|DOBBELKINGEN_DONE"),
      },
      {
        ...d,
        contract: null,
        chooserIndex: nextTroefChooser,
        troefChooserIndex: nextTroefChooser,
        leaderIndex: 0,
        currentPlayerIndex: nextTroefChooser,
        currentTrumpSuit: null,
        currentContractStarterIndex: 0,
        troefPickCounts: nextTroefPickCounts,
        totalScores: nextTotal,
        history: nextHistory,
        matchFinishedAt: finishedAt,
        matchSummary: summary,
        lastResult: {
          contract: "TROEF",
          contractScores,
          totalScores: nextTotal,
          endedEarly: false,
          endedEarlyReason: null,
          timestamp: finishedAt,
          overlayClosed: true,
        },
        ...clearHandRuntimeFields(),
      }
    );
  }

  return setDobbelState(
    {
      ...state,
      phase: "CHOOSING_TROEF",
      lastError: null,
      turnZone: null,
      log: pushLog(
        nextLog,
        `TROEF_CONTRACT_END|NEXT_CHOOSER=P${nextTroefChooser}`
      ),
    },
    {
      ...d,
      contract: null,
      chooserIndex: nextTroefChooser,
      troefChooserIndex: nextTroefChooser,
      leaderIndex: 0,
      currentPlayerIndex: nextTroefChooser,
      currentTrumpSuit: null,
      currentContractStarterIndex: 0,
      troefPickCounts: nextTroefPickCounts,
      totalScores: nextTotal,
      history: nextHistory,
      lastResult: {
        contract: "TROEF",
        contractScores,
        totalScores: nextTotal,
        endedEarly: false,
        endedEarlyReason: null,
        timestamp: Date.now(),
        overlayClosed: true,
      },
      ...clearHandRuntimeFields(),
    }
  );
}

export function computeDobbelContractScores(trickHistory, playersCount) {
  return computeScoresFromTrickHistory(trickHistory, playersCount);
}