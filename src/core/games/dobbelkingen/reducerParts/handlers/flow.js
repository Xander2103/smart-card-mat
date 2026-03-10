// src/core/games/dobbelkingen/reducerParts/handlers/flow.js
import {
  getDobbelState,
  setDobbelState,
  clearHandRuntimeFields,
  pushLog,
  clampIndex,
} from "../state";
import { canPickContract } from "../contractsRules";
import { normalizeTroefSuit, getTroefStarterIndex } from "../troefFlow.js";

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

function buildMatchSummary({ players, d, finalScores, finishedAt }) {
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

export function handleDobbelFlowAction(state, action) {
  const d = getDobbelState(state);
  const players = state.players ?? [];
  const playersCount = players.length || 4;

  if (action.type === "start_dobbelkingen") {
    const now = Date.now();

    const nextD = {
      ...d,
      chooserIndex: 0,
      leaderIndex: 0,
      currentPlayerIndex: 0,
      contract: null,
      contractPlays: {},
      lastContract: null,
      roundPhase: 1,
      troefPickCounts: Array(playersCount).fill(0),
      troefChooserIndex: 0,
      currentTrumpSuit: null,
      currentContractStarterIndex: 0,
      totalScores: Array(playersCount).fill(0),
      lastResult: null,
      history: [],
      matchSummary: null,
      matchStartedAt: now,
      matchFinishedAt: null,
      ...clearHandRuntimeFields(),
    };

    return setDobbelState(
      {
        ...state,
        phase: "CHOOSING_CONTRACT",
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "DOBBELKINGEN|START|PHASE=1"),
      },
      nextD
    );
  }

  if (action.type === "debug_go_to_phase2") {
    const startedAt = d.matchStartedAt ?? Date.now();

    return setDobbelState(
      {
        ...state,
        phase: "CHOOSING_TROEF",
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "DOBBELKINGEN|DEBUG_GO_TO_PHASE2"),
      },
      {
        ...d,
        roundPhase: 2,
        contract: null,
        chooserIndex: 0,
        troefChooserIndex: 0,
        troefPickCounts: Array(playersCount).fill(0),
        leaderIndex: 0,
        currentPlayerIndex: 0,
        currentTrumpSuit: null,
        currentContractStarterIndex: 0,
        lastResult: null,
        matchStartedAt: startedAt,
        matchFinishedAt: null,
        matchSummary: null,
        ...clearHandRuntimeFields(),
      }
    );
  }

  if (action.type === "debug_finish_phase2_match") {
    if (d.roundPhase !== 2) return state;

    const finishedAt = Date.now();
    const finalScores = [...(d.totalScores ?? Array(playersCount).fill(0))];
    const summary = buildMatchSummary({
      players,
      d,
      finalScores,
      finishedAt,
    });

    return setDobbelState(
      {
        ...state,
        phase: "DOBBELKINGEN_DONE",
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "DOBBELKINGEN|DEBUG_FINISH_PHASE2_MATCH"),
      },
      {
        ...d,
        contract: null,
        currentTrumpSuit: null,
        currentContractStarterIndex: 0,
        matchFinishedAt: finishedAt,
        matchSummary: summary,
        lastResult: null,
        ...clearHandRuntimeFields(),
      }
    );
  }

  if (action.type === "choose_contract") {
    if (state.phase !== "CHOOSING_CONTRACT") return state;
    if (d.roundPhase !== 1) return state;

    const contract = action.contract ?? null;
    if (!contract) return state;

    if (!canPickContract(d, contract)) {
      return {
        ...state,
        lastError: `Contract kan niet: ${contract}`,
        log: pushLog(state.log, `ERROR|CONTRACT_BLOCKED|${contract}`),
      };
    }

    const chooser = clampIndex(d.chooserIndex ?? 0, playersCount);
    const leader = clampIndex(chooser + 1, playersCount);

    return setDobbelState(
      {
        ...state,
        phase: "PLAYING_TRICK",
        turnZone: leader + 1,
        lastError: null,
        log: pushLog(
          state.log,
          `DOBBELKINGEN|PHASE1_CONTRACT|${contract}|CHOOSER=P${chooser}|LEADER=P${leader}`
        ),
      },
      {
        ...d,
        contract,
        leaderIndex: leader,
        currentPlayerIndex: leader,
        currentTrumpSuit: null,
        currentContractStarterIndex: leader,
        lastResult: null,
        ...clearHandRuntimeFields(),
      }
    );
  }

  if (action.type === "choose_troef_suit") {
    if (state.phase !== "CHOOSING_TROEF") return state;
    if (d.roundPhase !== 2) return state;

    const suit = normalizeTroefSuit(action.suit);
    if (!suit) {
      return {
        ...state,
        lastError: `Ongeldige troefkleur: ${action.suit}`,
        log: pushLog(state.log, `ERROR|INVALID_TROEF_SUIT|${action.suit}`),
      };
    }

    const chooser = clampIndex(d.troefChooserIndex ?? 0, playersCount);
    const leader = getTroefStarterIndex(chooser, playersCount);

    return setDobbelState(
      {
        ...state,
        phase: "PLAYING_TRICK",
        turnZone: leader + 1,
        lastError: null,
        log: pushLog(
          state.log,
          `DOBBELKINGEN|PHASE2_TROEF|SUIT=${suit}|CHOOSER=P${chooser}|LEADER=P${leader}`
        ),
      },
      {
        ...d,
        chooserIndex: chooser,
        contract: "TROEF",
        currentTrumpSuit: suit,
        leaderIndex: leader,
        currentPlayerIndex: leader,
        currentContractStarterIndex: leader,
        lastResult: null,
        ...clearHandRuntimeFields(),
      }
    );
  }

  if (action.type === "abort_contract") {
    if (state.phase !== "PLAYING_TRICK") return state;

    const backPhase =
      d.roundPhase === 2 ? "CHOOSING_TROEF" : "CHOOSING_CONTRACT";

    return setDobbelState(
      {
        ...state,
        phase: backPhase,
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, `CONTRACT|ABORT|BACK_TO_${backPhase}`),
      },
      {
        ...d,
        contract: null,
        currentTrumpSuit: d.roundPhase === 2 ? d.currentTrumpSuit : null,
        ...clearHandRuntimeFields(),
      }
    );
  }

  return state;
}