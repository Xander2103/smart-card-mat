// src/core/state/reducer.js
import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { determineTrickWinner } from "../game/trickLogic";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

function clampIndex(i, max) {
  if (max <= 0) return 0;
  return ((i % max) + max) % max;
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
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    if (state.turnZone === ev.zone) return state;

    return {
      ...state,
      confirmedTurnCard: null,
      turnZone: ev.zone,
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
        currentTrick: [],
        confirmedTurnCard: null,
        log: pushLog(state.log, "MODE|CLOSE"),
      };
    }

    if (mode === "DOBBELKINGEN") {
      return {
        ...state,
        activeMode: "DOBBELKINGEN",
        gameMode: "DOBBELKINGEN",
        phase: "DOBBELKINGEN_READY", // lobby
        contract: null,
        turnZone: null,
        currentTrick: [],
        confirmedTurnCard: null,
        log: pushLog(state.log, "MODE|OPEN|DOBBELKINGEN"),
      };
    }

    return state;
  }

  // Start Dobbelkingen: chooser moet contract kiezen
  if (action.type === "start_dobbelkingen") {
    const playersCount = state.players?.length ?? 4;
    const chooser = state.chooserIndex ?? 0;

    return {
      ...state,
      activeMode: "DOBBELKINGEN",
      gameMode: "DOBBELKINGEN",
      phase: "CHOOSING_CONTRACT",
      contract: null,
      turnZone: null,
      currentTrick: [],
      confirmedTurnCard: null,
      log: pushLog(state.log, `DOBBELKINGEN|START|CHOOSER=P${chooser}`),
    };
  }

  // Chooser kiest contract -> leader = chooser+1 start
  if (action.type === "choose_contract") {
    if (state.gameMode !== "DOBBELKINGEN") return state;
    if (state.phase !== "CHOOSING_CONTRACT") return state;

    const contract = action.contract;
    if (!contract) return state;

    const playersCount = state.players?.length ?? 4;
    const chooser = clampIndex(state.chooserIndex ?? 0, playersCount);
    const leader = clampIndex(chooser + 1, playersCount);

    return {
      ...state,
      phase: "PLAYING_TRICK",
      contract,
      leaderIndex: leader,
      currentPlayerIndex: leader,
      turnZone: leader + 1, // ✅ nodig voor jouw confirm_turn guards
      confirmedTurnCard: null,
      currentTrick: [],
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
    const playersCount = state.players?.length ?? 4;
    const zonesLen = state.zones?.length ?? state.zonesCount ?? 4;

    // verwachtte zone = current player
    const expectedZone = (state.currentPlayerIndex ?? 0) + 1;
    const zoneIndex = expectedZone - 1;

    const uid = state.zones?.[zoneIndex] ?? null;
    if (!uid) return state;

    const card = state.mapping?.[uid] ?? null;
    if (!card) return state;

    // al gespeeld in deze trick?
    const alreadyPlayedThisTrick = (state.currentTrick ?? []).some(
      (p) => p.playerIndex === state.currentPlayerIndex
    );
    if (alreadyPlayedThisTrick) return state;

    const played = { playerIndex: state.currentPlayerIndex, zone: expectedZone, uid, card };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(state.log, `CONFIRM|${expectedZone}|${uid}|${card}|P${state.currentPlayerIndex}`);

    // default next player
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    // default next turnZone volgt player (voor UI)
    let nextTurnZone = nextPlayerIndex + 1;
    if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

    // trick complete?
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.contract ?? state.gameMode);
      if (!winner) return state;

      nextPlayerIndex = winner.playerIndex;
      nextTurnZone = nextPlayerIndex + 1;
      if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

      const trickResult = {
        id: (state.trickHistory?.length ?? 0) + 1,
        gameMode: state.gameMode,
        contract: state.contract,
        plays: nextTrick,
        winnerIndex: winner.playerIndex,
        timestamp: Date.now(),
      };

      nextLog = pushLog(nextLog, `TRICK_WIN|P${winner.playerIndex}`);

      return {
        ...state,
        confirmedTurnCard: played,
        pile: [...(state.pile ?? []), played],
        currentTrick: [],
        currentPlayerIndex: nextPlayerIndex,
        turnZone: nextTurnZone,
        trickHistory: [...(state.trickHistory ?? []), trickResult],
        lastTrick: trickResult,
        lastTrickWinnerIndex: winner.playerIndex,
        log: nextLog,
      };
    }

    return {
      ...state,
      confirmedTurnCard: played,
      pile: [...(state.pile ?? []), played],
      currentTrick: nextTrick,
      currentPlayerIndex: nextPlayerIndex,
      turnZone: nextTurnZone,
      log: nextLog,
    };
  }

  if (action.type === "undo_last_play") {
    const pile = state.pile ?? [];
    if (pile.length === 0) return state;

    const last = pile[pile.length - 1];
    const nextPile = pile.slice(0, -1);

    const nextTrick = (state.currentTrick ?? []).filter(
      (p) =>
        !(
          p.uid === last.uid &&
          p.zone === last.zone &&
          p.playerIndex === last.playerIndex
        )
    );

    const playersCount = state.players?.length ?? 4;
    const prevPlayerIndex =
      (state.currentPlayerIndex - 1 + playersCount) % playersCount;

    const prevTurnZone = prevPlayerIndex + 1;

    return {
      ...state,
      pile: nextPile,
      currentTrick: nextTrick,
      currentPlayerIndex: prevPlayerIndex,
      turnZone: prevTurnZone,
      confirmedTurnCard: null,
      log: pushLog(state.log, `UNDO|${last.zone}|${last.uid}|P${last.playerIndex}`),
    };
  }

  if (action.type === "reset_pile") {
    return {
      ...state,
      pile: [],
      confirmedTurnCard: null,
      log: pushLog(state.log, "PILE|RESET"),
    };
  }

  return state;
}