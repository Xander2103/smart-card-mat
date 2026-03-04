// src/core/games/dobbelkingen/reducer.js
import { determineTrickWinner } from "../../game/trickLogic";
import { computeScoresFromTrickHistory } from "./scoring";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

function clampIndex(i, max) {
  if (max <= 0) return 0;
  return ((i % max) + max) % max;
}

function inc(obj, key) {
  return { ...(obj ?? {}), [key]: ((obj?.[key] ?? 0) + 1) };
}

function hasPlayedContractTwice(d, contract) {
  return (d.contractPlays?.[contract] ?? 0) >= 2;
}

function canPickContract(d, contract) {
  if (!contract) return false;
  if (d.lastContract === contract) return false;
  if (hasPlayedContractTwice(d, contract)) return false;
  return true;
}

function anyContractLeft(d) {
  const list = d.contracts ?? [];
  return list.some((c) => canPickContract(d, c));
}

function clearHandRuntimeFields() {
  return {
    confirmedTurnCard: null,
    pile: [],
    currentTrick: [],
    trickHistory: [],
    lastTrick: null,
    lastTrickWinnerIndex: null,
    usedCardCodes: [],
    usedCardSet: {},
    tricksPlayedInContract: 0,
  };
}

function getDobbelState(state) {
  const playersCount = state.players?.length ?? 4;

  return state.game?.dobbelkingen ?? {
    chooserIndex: 0,
    leaderIndex: 0,
    currentPlayerIndex: 0,
    contract: null,

    contracts: [
      "MINSTE_SLAGEN",
      "MINSTE_HARTEN",
      "GEEN_HARTEN_KONING",
      "MINSTE_BOEREN_KONINGEN",
      "GEEN_SLAG_7_13",
      "MINSTE_QUEENS",
    ],
    contractPlays: {},
    lastContract: null,

    totalScores: Array(playersCount).fill(0),
    lastResult: null,

    ...clearHandRuntimeFields(),
  };
}

function setDobbelState(state, nextDobbel) {
  return { ...state, game: { ...(state.game ?? {}), dobbelkingen: nextDobbel } };
}

export function reduceDobbelkingen(state, action) {
  // jouw rootRouter gebruikt phase/activeMode, dus check niet op modeId
  const d = getDobbelState(state);

  // START
  if (action.type === "start_dobbelkingen") {
    const chooser = d.chooserIndex ?? 0;

    const nextD = { ...d, contract: null, ...clearHandRuntimeFields() };

    return setDobbelState(
      {
        ...state,
        phase: "CHOOSING_CONTRACT",
        lastError: null,
        log: pushLog(state.log, `DOBBELKINGEN|START|CHOOSER=P${chooser}`),
      },
      nextD
    );
  }

  // CHOOSE CONTRACT
  if (action.type === "choose_contract") {
    if (state.phase !== "CHOOSING_CONTRACT") return state;

    const contract = action.contract ?? null;
    if (!contract) return state;

    if (!canPickContract(d, contract)) {
      return {
        ...state,
        lastError: `Contract kan niet: ${contract}`,
        log: pushLog(state.log, `ERROR|CONTRACT_BLOCKED|${contract}`),
      };
    }

    const playersCount = state.players?.length ?? 4;
    const chooser = clampIndex(d.chooserIndex ?? 0, playersCount);
    const leader = clampIndex(chooser + 1, playersCount);

    const nextD = {
      ...d,
      contract,
      leaderIndex: leader,
      currentPlayerIndex: leader,
      ...clearHandRuntimeFields(),
    };

    return setDobbelState(
      {
        ...state,
        phase: "PLAYING_TRICK",
        turnZone: leader + 1,
        lastError: null,
        log: pushLog(state.log, `DOBBELKINGEN|CONTRACT|${contract}|LEADER=P${leader}`),
      },
      nextD
    );
  }

  // ABORT CONTRACT
  if (action.type === "abort_contract") {
    if (state.phase !== "PLAYING_TRICK") return state;

    const nextD = { ...d, contract: null, ...clearHandRuntimeFields() };

    return setDobbelState(
      {
        ...state,
        phase: "CHOOSING_CONTRACT",
        lastError: null,
        log: pushLog(state.log, "CONTRACT|ABORT|BACK_TO_CHOOSING"),
      },
      nextD
    );
  }

  // UNDO
  if (action.type === "undo_last_play") {
    const pile = d.pile ?? [];
    if (pile.length === 0) return state;

    const last = pile[pile.length - 1];
    const nextPile = pile.slice(0, -1);

    const nextTrick = (d.currentTrick ?? []).filter(
      (p) => !(p.uid === last.uid && p.zone === last.zone && p.playerIndex === last.playerIndex)
    );

    const playersCount = state.players?.length ?? 4;
    const prevPlayerIndex = (d.currentPlayerIndex - 1 + playersCount) % playersCount;

    const rebuiltUsedSet = {};
    const rebuiltUsedCodes = [];
    for (const p of nextPile) {
      if (!p?.card) continue;
      if (!rebuiltUsedSet[p.card]) rebuiltUsedCodes.push(p.card);
      rebuiltUsedSet[p.card] = true;
    }

    const nextD = {
      ...d,
      pile: nextPile,
      currentTrick: nextTrick,
      currentPlayerIndex: prevPlayerIndex,
      confirmedTurnCard: null,
      usedCardCodes: rebuiltUsedCodes,
      usedCardSet: rebuiltUsedSet,
    };

    return setDobbelState(
      { ...state, lastError: null, log: pushLog(state.log, `UNDO|${last.zone}|${last.uid}|P${last.playerIndex}`) },
      nextD
    );
  }

  // RESET PILE
  if (action.type === "reset_pile") {
    const nextD = {
      ...d,
      pile: [],
      confirmedTurnCard: null,
      currentTrick: [],
      usedCardCodes: [],
      usedCardSet: {},
      tricksPlayedInContract: 0,
    };

    return setDobbelState(
      { ...state, lastError: null, log: pushLog(state.log, "PILE|RESET") },
      nextD
    );
  }

  // CONFIRM TURN
  if (action.type === "confirm_turn") {
    if (state.phase !== "PLAYING_TRICK") return state;

    const playersCount = state.players?.length ?? 4;

    const expectedZone = (d.currentPlayerIndex ?? 0) + 1;
    const zoneIndex = expectedZone - 1;

    const uid = state.zones?.[zoneIndex] ?? null;
    if (!uid) return state;

    const card = state.mapping?.[uid] ?? null;
    if (!card) return state;

    // duplicate in contract
    if (d.usedCardSet?.[card]) {
      return {
        ...state,
        lastError: `Kaart ${card} is al gebruikt in dit contract!`,
        log: pushLog(state.log, `ERROR|DUPLICATE_CARD|${card}|P${d.currentPlayerIndex}`),
      };
    }

    // player already played this trick
    if ((d.currentTrick ?? []).some((p) => p.playerIndex === d.currentPlayerIndex)) {
      return state;
    }

    const played = { playerIndex: d.currentPlayerIndex, zone: expectedZone, uid, card };
    const nextTrick = [...(d.currentTrick ?? []), played];

    let nextLog = pushLog(state.log, `CONFIRM|${expectedZone}|${uid}|${card}|P${d.currentPlayerIndex}`);

    const nextUsedCodes = [...(d.usedCardCodes ?? []), card];
    const nextUsedSet = { ...(d.usedCardSet ?? {}), [card]: true };

    // default next player if trick not complete
    let nextPlayerIndex = (d.currentPlayerIndex + 1) % playersCount;

    // ✅ TRICK COMPLETE
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, d.contract);
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

      // ✅ contract ends only after 13 tricks (no early-stop)
      const contractDone = nextTricksPlayed >= 13;

      if (contractDone) {
        const nextChooser = clampIndex((d.chooserIndex ?? 0) + 1, playersCount);

        const contractScores = computeScoresFromTrickHistory(baseAfterTrickD.trickHistory, playersCount);

        const prevTotal = d.totalScores ?? Array(playersCount).fill(0);
        const nextTotal = Array.from(
          { length: playersCount },
          (_, i) => (prevTotal[i] ?? 0) + (contractScores[i] ?? 0)
        );

        const lastResult = {
          contract: d.contract,
          contractScores,
          totalScores: nextTotal,
          timestamp: Date.now(),
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
            log: pushLog(nextLog, `CONTRACT_END|TRICKS=13|NEXT_CHOOSER=P${nextChooser}`),
          },
          nextD
        );
      }

      // continue contract
      return setDobbelState({ ...state, lastError: null, log: nextLog }, baseAfterTrickD);
    }

    // ✅ TRICK NOT COMPLETE
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

  return state;
}