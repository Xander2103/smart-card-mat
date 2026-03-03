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
  // reset alles dat hoort bij 1 contract-handje (13 slagen)
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

function applyMinsteSlagenScore(players, winnerIndex) {
  return (players ?? []).map((p, i) => {
    if (i !== winnerIndex) return p;
    return { ...p, score: (p.score ?? 0) - 1 };
  });
}

// -------------------- EVENTS --------------------

export function applyEvent(state, ev) {
  const nextZones = [...(state.zones ?? [])];

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // exact duplicate in zelfde zone -> ignore
    if (nextZones[zoneIndex] === ev.uid) return state;

    // 1 UID kan maar in 1 zone tegelijk
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
    // jij gebruikt turnZone niet meer als waarheid, maar laat dit gerust bestaan
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

    // expected zone = current player
    const expectedZone = (state.currentPlayerIndex ?? 0) + 1;
    const zoneIndex = expectedZone - 1;

    const uid = state.zones?.[zoneIndex] ?? null;
    if (!uid) return state;

    const card = state.mapping?.[uid] ?? null; // code zoals "AC"
    if (!card) return state;

    // DUPLICATE check (per contract-hand)
    if (state.usedCardSet?.[card]) {
      return {
        ...state,
        lastError: `Kaart ${card} is al gebruikt in dit contract!`,
        log: pushLog(state.log, `ERROR|DUPLICATE_CARD|${card}|P${state.currentPlayerIndex}`),
      };
    }

    // player al gespeeld in deze trick?
    const alreadyPlayedThisTrick = (state.currentTrick ?? []).some(
      (p) => p.playerIndex === state.currentPlayerIndex
    );
    if (alreadyPlayedThisTrick) return state;

    const played = { playerIndex: state.currentPlayerIndex, zone: expectedZone, uid, card };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(state.log, `CONFIRM|${expectedZone}|${uid}|${card}|P${state.currentPlayerIndex}`);

    // mark card as used (per contract)
    const nextUsedCodes = [...(state.usedCardCodes ?? []), card];
    const nextUsedSet = { ...(state.usedCardSet ?? {}), [card]: true };

    // default next player
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    // UI turnzone
    let nextTurnZone = nextPlayerIndex + 1;
    if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

    // trick complete?
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.contract ?? state.gameMode);
      if (!winner) return state;

      const winnerIndex = winner.playerIndex;

      // score update
      let nextPlayers = state.players;
      if (state.contract === "MINSTE_SLAGEN") {
        nextPlayers = applyMinsteSlagenScore(state.players, winnerIndex);
        nextLog = pushLog(nextLog, `SCORE|-1|P${winnerIndex}|MINSTE_SLAGEN`);
      }

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

      // winner comes out
      nextPlayerIndex = winnerIndex;
      nextTurnZone = nextPlayerIndex + 1;
      if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

      // base after trick (hand still ongoing)
      const baseAfterTrick = {
        ...state,
        players: nextPlayers,
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
        const playersCount2 = nextPlayers?.length ?? 4;
        const nextChooser = clampIndex((state.chooserIndex ?? 0) + 1, playersCount2);

        const scoresSnapshot = (nextPlayers ?? []).map((p) => p.score ?? 0);

        const lastResult = {
          contract: state.contract,
          penalties: null,
          scores: scoresSnapshot,
          timestamp: Date.now(),
        };

        const nextPhase = anyContractLeft(baseAfterTrick)
          ? "CHOOSING_CONTRACT"
          : "DOBBELKINGEN_DONE";

        return {
          ...baseAfterTrick,
          phase: nextPhase,

          // contract loop bookkeeping
          contractPlays: inc(state.contractPlays, state.contract),
          lastContract: state.contract,
          contract: null,

          chooserIndex: nextChooser,
          currentPlayerIndex: nextChooser,
          turnZone: null,

          lastResult,

          // reset runtime for next contract
          ...clearHandRuntimeFields(),

          log: pushLog(baseAfterTrick.log, `CONTRACT_END|TRICKS=13|NEXT_CHOOSER=P${nextChooser}`),
        };
      }

      return baseAfterTrick;
    }

    // trick nog bezig
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

    // rebuild usedCardSet from nextPile
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