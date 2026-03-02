// src/core/state/reducer.js
import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { determineTrickWinner } from "../game/trickLogic";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

// -------------------- EVENTS --------------------

export function applyEvent(state, ev) {
  const nextZones = [...(state.zones ?? [])];

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // anti-duplicate: exact dezelfde UID zit al in dezelfde zone
    if (nextZones[zoneIndex] === ev.uid) return state;

    // 1 UID kan maar in 1 zone tegelijk zitten
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

    // anti-duplicate: als deze UID daar niet zit -> ignore
    if (nextZones[zoneIndex] !== ev.uid) return state;

    nextZones[zoneIndex] = null;

    const next = {
      ...state,
      zones: nextZones,
      log: pushLog(state.log, ev.raw),
    };

    // confirmed kaart weg -> reset snapshot
    if (next.confirmedTurnCard?.uid === ev.uid) {
      next.confirmedTurnCard = null;
    }

    // rule: als je turn-zone leegmaakt -> turn reset
    if (next.turnZone === ev.zone) {
      next.turnZone = null;
    }

    return next;
  }

  if (ev.type === "turn") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // anti-duplicate: dezelfde turn opnieuw -> ignore
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
  // ---- mapping / selection ----

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

  // ---- settings / deck ----

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

  // ---- mode start ----

  if (action.type === "start_mode") {
    const mode = action.mode;
    if (!mode) return state;

    const playersCount = state.players?.length ?? 4;

    // chooser blijft wat hij is (default 0)
    const chooser = state.chooserIndex ?? 0;

    // jouw rule: wie kiest -> volgende start met uitkomen
    const leader = (chooser + 1) % playersCount;

    return {
      ...state,
      gameMode: mode,
      phase: "PLAYING_TRICK",
      leaderIndex: leader,
      currentPlayerIndex: leader,
      turnZone: leader + 1, // ✅ belangrijk zolang confirm_turn turnZone guards gebruikt
      currentTrick: [],
      confirmedTurnCard: null,
      log: pushLog(
        state.log,
        `MODE|START|${mode}|CHOOSER=P${chooser}|LEADER=P${leader}`
      ),
    };
  }

  // ---- turn controls (optional/manual) ----

  if (action.type === "start_turn") {
    if (state.turnZone) return state;

    const zones = state.zones ?? [];
    const idx = zones.findIndex((uid) => uid != null);
    const startZone = idx >= 0 ? idx + 1 : 1;

    const playersCount = state.players?.length ?? 4;
    const startPlayerIndex = Math.max(
      0,
      Math.min(playersCount - 1, startZone - 1)
    );

    return {
      ...state,
      turnZone: startZone,
      currentPlayerIndex: startPlayerIndex,
      log: pushLog(state.log, `TURN|START|Z${startZone}|P${startPlayerIndex}`),
    };
  }

  if (action.type === "set_turn_zone") {
    const z = Number(action.zone);
    const zonesCount = state.zones?.length ?? state.zonesCount ?? 4;
    if (!(z >= 1 && z <= zonesCount)) return state;

    const playersCount = state.players?.length ?? 4;
    const nextPlayerIndex = Math.max(0, Math.min(playersCount - 1, z - 1));

    return {
      ...state,
      turnZone: z,
      currentPlayerIndex: nextPlayerIndex,
      log: pushLog(state.log, `TURN|SET|Z${z}|P${nextPlayerIndex}`),
    };
  }

  if (action.type === "next_turn") {
    const zonesCount = state.zones?.length ?? state.zonesCount ?? 4;
    const playersCount = state.players?.length ?? 4;
    const skipEmpty = !!action.skipEmpty;

    // Als nog niet gestart: start meteen
    if (!state.turnZone) {
      const idx = (state.zones ?? []).findIndex((uid) => uid != null);
      const startZone = idx >= 0 ? idx + 1 : 1;
      const startPlayerIndex = Math.max(
        0,
        Math.min(playersCount - 1, startZone - 1)
      );

      return {
        ...state,
        turnZone: startZone,
        currentPlayerIndex: startPlayerIndex,
        log: pushLog(state.log, `TURN|START|Z${startZone}|P${startPlayerIndex}`),
      };
    }

    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;
    let nextTurnZone = nextPlayerIndex + 1;

    if (nextTurnZone < 1 || nextTurnZone > zonesCount) nextTurnZone = 1;

    if (skipEmpty) {
      for (let i = 0; i < zonesCount; i++) {
        const uid = state.zones?.[nextTurnZone - 1] ?? null;
        if (uid != null) break;

        nextPlayerIndex = (nextPlayerIndex + 1) % playersCount;
        nextTurnZone = nextPlayerIndex + 1;
        if (nextTurnZone < 1 || nextTurnZone > zonesCount) nextTurnZone = 1;
      }
    }

    return {
      ...state,
      currentPlayerIndex: nextPlayerIndex,
      turnZone: nextTurnZone,
      log: pushLog(state.log, `TURN|NEXT|Z${nextTurnZone}|P${nextPlayerIndex}`),
    };
  }

  // ---- gameplay ----

  if (action.type === "confirm_turn") {
    const turnCard = action.turnCard;
    if (!turnCard) return state;

    // guard 1: er moet een turnZone gekozen zijn
    if (!state.turnZone) return state;

    // guard 2: alleen kaart uit de huidige turnZone mag bevestigd worden
    if (turnCard.zone !== state.turnZone) return state;

    // guard 3: zone moet effectief die UID bevatten op dit moment
    const zoneIndex = state.turnZone - 1;
    const uidInZone = state.zones?.[zoneIndex] ?? null;
    if (!uidInZone || uidInZone !== turnCard.uid) return state;

    // duplicate confirm guard
    if (state.confirmedTurnCard?.uid === turnCard.uid) return state;

    const playersCount = state.players?.length ?? 4;

    const alreadyPlayedThisTrick = (state.currentTrick ?? []).some(
      (p) => p.playerIndex === state.currentPlayerIndex
    );
    if (alreadyPlayedThisTrick) return state;

    const played = { playerIndex: state.currentPlayerIndex, ...turnCard };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(
      state.log,
      `CONFIRM|${turnCard.zone}|${turnCard.uid}|${turnCard.card}|P${state.currentPlayerIndex}`
    );

    // default next player
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    // auto-advance turnZone (v1 mapping)
    let nextTurnZone = nextPlayerIndex + 1;
    const zonesLen = state.zones?.length ?? 4;
    if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

    // Trick complete?
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.gameMode);
      if (!winner) return state;

      if (state.gameMode === "NEXT_TURN") {
        nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;
      } else {
        nextPlayerIndex = winner.playerIndex;
      }

      nextTurnZone = nextPlayerIndex + 1;
      if (nextTurnZone < 1 || nextTurnZone > zonesLen) nextTurnZone = 1;

      const trickResult = {
        id: (state.trickHistory?.length ?? 0) + 1,
        gameMode: state.gameMode,
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

    // Trick nog bezig
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

  if (action.type === "start_dobbelkingen") {
    const playersCount = state.players?.length ?? 4;
    const chooser = state.chooserIndex ?? 0;

    return {
      ...state,
      gameMode: "DOBBELKINGEN",
      phase: "CHOOSING_CONTRACT",
      contract: null,
      currentTrick: [],
      confirmedTurnCard: null,
      // turnZone blijft null tot contract gekozen is
      log: pushLog(state.log, `DOBBELKINGEN|START|CHOOSER=P${chooser}`),
    };
  }

  if (action.type === "choose_contract") {
    // alleen als je echt in dobbelkingen zit
    if (state.gameMode !== "DOBBELKINGEN") return state;
    if (state.phase !== "CHOOSING_CONTRACT") return state;

    const contract = action.contract;
    if (!contract) return state;

    const playersCount = state.players?.length ?? 4;
    const chooser = state.chooserIndex ?? 0;

    // jouw regel: volgende in de rij komt uit
    const leader = (chooser + 1) % playersCount;

    return {
      ...state,
      phase: "PLAYING_TRICK",
      contract,                 // bv "MINSTE_SLAGEN"
      leaderIndex: leader,
      currentPlayerIndex: leader,
      turnZone: leader + 1,     // ✅ nodig voor jouw confirm_turn guards
      currentTrick: [],
      confirmedTurnCard: null,
      log: pushLog(state.log, `DOBBELKINGEN|CONTRACT|${contract}|LEADER=P${leader}`),
    };
  }

  return state;
}