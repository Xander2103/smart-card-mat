import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { determineTrickWinner } from "../game/trickLogic";
import { computeContractScoresFromTrickHistory } from "../games/dobbelkingen/scoring";

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

function hasPlayedContractTwice(state, contract) {
  return (state.contractPlays?.[contract] ?? 0) >= 2;
}

function canPickContract(state, contract) {
  if (!contract) return false;
  if (state.lastContract === contract) return false; // niet 2x na elkaar
  if (hasPlayedContractTwice(state, contract)) return false; // max 2x
  return true;
}

function anyContractLeft(state) {
  const list = state.contracts ?? [];
  return list.some((c) => canPickContract(state, c));
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

// -------------------- EVENTS --------------------

export function applyEvent(state, ev) {
  const nextZones = [...(state.zones ?? [])];

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    if (nextZones[zoneIndex] === ev.uid) return state;

    for (let i = 0; i < nextZones.length; i++) {
      if (nextZones[i] === ev.uid) nextZones[i] = null;
    }

    nextZones[zoneIndex] = ev.uid;

    return {
      ...state,
      zones: nextZones,
      selectedUid: ev.uid,
      lastError: null,
      log: pushLog(state.log, ev.raw),
    };
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    if (nextZones[zoneIndex] !== ev.uid) return state;

    nextZones[zoneIndex] = null;

    const next = {
      ...state,
      zones: nextZones,
      log: pushLog(state.log, ev.raw),
    };

    if (next.confirmedTurnCard?.uid === ev.uid) next.confirmedTurnCard = null;

    return next;
  }

  if (ev.type === "turn") {
    if (state.turnZone === ev.zone) return state;

    return {
      ...state,
      confirmedTurnCard: null,
      turnZone: ev.zone,
      lastError: null,
      log: pushLog(state.log, ev.raw),
    };
  }

  return state;
}

// -------------------- ACTIONS --------------------

export function applyAction(state, action) {
  // ---------- UI / mode selection ----------

  if (action.type === "open_mode") {
    const mode = action.mode ?? null;

    if (!mode) {
      return {
        ...state,
        activeMode: null,
        gameMode: null,
        phase: "HOME",
        contract: null,
        turnZone: null,
        lastError: null,
        ...clearHandRuntimeFields(),
        log: pushLog(state.log, "MODE|CLOSE"),
      };
    }

    if (mode === "DOBBELKINGEN") {
      return {
        ...state,
        activeMode: "DOBBELKINGEN",
        gameMode: "DOBBELKINGEN",
        phase: "DOBBELKINGEN_READY",
        contract: null,
        turnZone: null,
        lastError: null,
        ...clearHandRuntimeFields(),
        log: pushLog(state.log, "MODE|OPEN|DOBBELKINGEN"),
      };
    }

    return state;
  }

  if (action.type === "start_dobbelkingen") {
    const chooser = state.chooserIndex ?? 0;

    return {
      ...state,
      activeMode: "DOBBELKINGEN",
      gameMode: "DOBBELKINGEN",
      phase: "CHOOSING_CONTRACT",
      contract: null,
      turnZone: null,
      lastError: null,
      ...clearHandRuntimeFields(),
      log: pushLog(state.log, `DOBBELKINGEN|START|CHOOSER=P${chooser}`),
    };
  }

  if (action.type === "choose_contract") {
    if (state.gameMode !== "DOBBELKINGEN") return state;
    if (state.phase !== "CHOOSING_CONTRACT") return state;

    const contract = action.contract;
    if (!contract) return state;

    if (!canPickContract(state, contract)) {
      return {
        ...state,
        lastError: `Contract kan niet: ${contract}`,
        log: pushLog(state.log, `ERROR|CONTRACT_BLOCKED|${contract}`),
      };
    }

    const playersCount = state.players?.length ?? 4;
    const chooser = clampIndex(state.chooserIndex ?? 0, playersCount);
    const leader = clampIndex(chooser + 1, playersCount);

    return {
      ...state,
      phase: "PLAYING_TRICK",
      contract,
      leaderIndex: leader,
      currentPlayerIndex: leader,
      turnZone: leader + 1,
      lastError: null,
      ...clearHandRuntimeFields(),
      log: pushLog(state.log, `DOBBELKINGEN|CONTRACT|${contract}|LEADER=P${leader}`),
    };
  }

  // ---------- mapping ----------

  if (action.type === "select_uid") {
    return { ...state, selectedUid: action.uid };
  }

  if (action.type === "register_mapping") {
    const uid = action.uid ?? state.selectedUid;
    const cardName = action.cardName;
    if (!uid || !cardName) return state;

    const nextMapping = setUniqueMappingOverwrite(state.mapping, uid, cardName);
    return {
      ...state,
      mapping: nextMapping,
      log: pushLog(state.log, `MAP|${uid}|${cardName}`),
    };
  }

  if (action.type === "assign_uid_to_card") {
    const { uid, cardName } = action;
    if (!uid || !cardName) return state;

    const nextMapping = setUniqueMappingOverwrite(state.mapping, uid, cardName);
    return {
      ...state,
      mapping: nextMapping,
      log: pushLog(state.log, `MAP|${uid}|${cardName}`),
    };
  }

  // ---------- settings / deck ----------

  if (action.type === "set_auto_confirm") {
    return { ...state, autoConfirm: !!action.value };
  }

  if (action.type === "set_deck_setup") {
    return { ...state, deckSetup: !!action.value };
  }

  if (action.type === "set_deck_index") {
    const max = action.maxIndex ?? 51;
    const i = Math.max(0, Math.min(max, action.index ?? 0));
    return { ...state, deckIndex: i };
  }

  // ---------- gameplay ----------

  if (action.type === "confirm_turn") {
    if (state.phase !== "PLAYING_TRICK") return state;

    const playersCount = state.players?.length ?? 4;
    const zonesLen = state.zones?.length ?? state.zonesCount ?? 4;

    const expectedZone = (state.currentPlayerIndex ?? 0) + 1;
    const zoneIndex = expectedZone - 1;

    const uid = state.zones?.[zoneIndex] ?? null;
    if (!uid) return state;

    const card = state.mapping?.[uid] ?? null;
    if (!card) return state;

    if (state.usedCardSet?.[card]) {
      return {
        ...state,
        lastError: `Kaart ${card} is al gebruikt in dit contract!`,
        log: pushLog(state.log, `ERROR|DUPLICATE_CARD|${card}|P${state.currentPlayerIndex}`),
      };
    }

    const alreadyPlayedThisTrick = (state.currentTrick ?? []).some(
      (p) => p.playerIndex === state.currentPlayerIndex
    );
    if (alreadyPlayedThisTrick) return state;

    const played = { playerIndex: state.currentPlayerIndex, zone: expectedZone, uid, card };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(state.log, `CONFIRM|${expectedZone}|${uid}|${card}|P${state.currentPlayerIndex}`);

    const nextUsedCodes = [...(state.usedCardCodes ?? []), card];
    const nextUsedSet = { ...(state.usedCardSet ?? {}), [card]: true };

    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    let nextTurnZone = nextPlayerIndex + 1;
    if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

    // trick complete?
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.contract ?? state.gameMode);
      if (!winner) return state;

      const winnerIndex = winner.playerIndex;

      const nextTricksPlayed = (state.tricksPlayedInContract ?? 0) + 1;
      nextLog = pushLog(nextLog, `TRICK_WIN|P${winnerIndex}`);
      nextLog = pushLog(nextLog, `TRICKS_IN_CONTRACT|${nextTricksPlayed}/13`);

      const trickResult = {
        id: (state.trickHistory?.length ?? 0) + 1,
        gameMode: state.gameMode,
        contract: state.contract,
        plays: nextTrick,
        winnerIndex,
        timestamp: Date.now(),
      };

      nextPlayerIndex = winnerIndex;
      nextTurnZone = nextPlayerIndex + 1;
      if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

      const baseAfterTrick = {
        ...state,
        confirmedTurnCard: played,
        pile: [...(state.pile ?? []), played],
        currentTrick: [],
        currentPlayerIndex: nextPlayerIndex,
        turnZone: nextTurnZone,
        trickHistory: [...(state.trickHistory ?? []), trickResult],
        lastTrick: trickResult,
        lastTrickWinnerIndex: winnerIndex,
        usedCardCodes: nextUsedCodes,
        usedCardSet: nextUsedSet,
        tricksPlayedInContract: nextTricksPlayed,
        lastError: null,
        log: nextLog,
      };

      // END condition: 13 slagen => contract gedaan
      if (nextTricksPlayed >= 13) {
        const playersCount2 = state.players?.length ?? 4;
        const nextChooser = clampIndex((state.chooserIndex ?? 0) + 1, playersCount2);

        const contractScores = computeContractScoresFromTrickHistory(baseAfterTrick.trickHistory, playersCount2);
        const prevTotal = state.totalScores ?? Array(playersCount2).fill(0);
        const nextTotal = Array.from({ length: playersCount2 }, (_, i) => (prevTotal[i] ?? 0) + (contractScores[i] ?? 0));

        const lastResult = {
          contract: state.contract,
          penalties: null,
          contractScores,
          totalScores: nextTotal,
          timestamp: Date.now(),
        };

        const nextPhase = anyContractLeft(baseAfterTrick)
          ? "CHOOSING_CONTRACT"
          : "DOBBELKINGEN_DONE";

        return {
          ...baseAfterTrick,
          phase: nextPhase,

          // totals
          totalScores: nextTotal,
          lastResult,

          // contract loop bookkeeping
          contractPlays: inc(state.contractPlays, state.contract),
          lastContract: state.contract,
          contract: null,

          chooserIndex: nextChooser,
          currentPlayerIndex: nextChooser,
          turnZone: null,

          // reset runtime for next contract
          ...clearHandRuntimeFields(),

          log: pushLog(baseAfterTrick.log, `CONTRACT_END|TRICKS=13|NEXT_CHOOSER=P${nextChooser}`),
        };
      }

      return baseAfterTrick;
    }

    // trick ongoing
    return {
      ...state,
      confirmedTurnCard: played,
      pile: [...(state.pile ?? []), played],
      currentTrick: nextTrick,
      currentPlayerIndex: nextPlayerIndex,
      turnZone: nextTurnZone,
      usedCardCodes: nextUsedCodes,
      usedCardSet: nextUsedSet,
      lastError: null,
      log: nextLog,
    };
  }

  if (action.type === "undo_last_play") {
    const pile = state.pile ?? [];
    if (pile.length === 0) return state;

    const last = pile[pile.length - 1];
    const nextPile = pile.slice(0, -1);

    const nextTrick = (state.currentTrick ?? []).filter(
      (p) => !(p.uid === last.uid && p.zone === last.zone && p.playerIndex === last.playerIndex)
    );

    const playersCount = state.players?.length ?? 4;
    const prevPlayerIndex = (state.currentPlayerIndex - 1 + playersCount) % playersCount;

    const rebuiltUsedSet = {};
    const rebuiltUsedCodes = [];
    for (const p of nextPile) {
      if (!p?.card) continue;
      if (!rebuiltUsedSet[p.card]) rebuiltUsedCodes.push(p.card);
      rebuiltUsedSet[p.card] = true;
    }

    return {
      ...state,
      pile: nextPile,
      currentTrick: nextTrick,
      currentPlayerIndex: prevPlayerIndex,
      turnZone: prevPlayerIndex + 1,
      confirmedTurnCard: null,
      usedCardCodes: rebuiltUsedCodes,
      usedCardSet: rebuiltUsedSet,
      lastError: null,
      log: pushLog(state.log, `UNDO|${last.zone}|${last.uid}|P${last.playerIndex}`),
    };
  }

  if (action.type === "abort_contract") {
    if (state.phase !== "PLAYING_TRICK") return state;

    // terug naar contract kiezen, maar behoud wat je wil behouden:
    // - players + scores blijven (want dat is totaal over contracten)
    // - contract zelf stoppen zonder "contractPlays" te incrementen
    // - runtime resetten

    return {
      ...state,
      phase: "CHOOSING_CONTRACT",
      contract: null,
      turnZone: null,
      confirmedTurnCard: null,
      lastError: null,
      ...clearHandRuntimeFields(),
      log: pushLog(state.log, "CONTRACT|ABORT|BACK_TO_CHOOSING"),
    };
  }

  if (action.type === "reset_pile") {
    return {
      ...state,
      pile: [],
      confirmedTurnCard: null,
      currentTrick: [],
      usedCardCodes: [],
      usedCardSet: {},
      tricksPlayedInContract: 0,
      lastError: null,
      log: pushLog(state.log, "PILE|RESET"),
    };
  }

  return state;
}