// src/core/state/reducer.js
import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { determineTrickWinner } from "../game/trickLogic";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

function clampTurnZone(zone, zonesCount) {
  if (!zonesCount || zonesCount <= 0) return null;
  if (!zone || zone < 1) return 1;
  if (zone > zonesCount) return 1;
  return zone;
}

function playerIndexToZone(playerIndex) {
  return playerIndex + 1; // v1 mapping: P0->Z1, P1->Z2, ...
}

export function applyEvent(state, ev) {
  // werk op copies, maar log pas op het einde als er change is
  const nextZones = [...state.zones];

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // ✅ echte anti-duplicate: exact dezelfde UID zit al in dezelfde zone
    if (nextZones[zoneIndex] === ev.uid) {
      return state; // geen log, geen side-effects
    }

    // 1 UID kan maar in 1 zone tegelijk zitten
    for (let i = 0; i < nextZones.length; i++) {
      if (nextZones[i] === ev.uid) nextZones[i] = null;
    }

    // zone-overwrite
    nextZones[zoneIndex] = ev.uid;

    const next = {
      ...state,
      zones: nextZones,
      log: pushLog(state.log, ev.raw),
      selectedUid: ev.uid,
    };

    return next;
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // ✅ anti-duplicate: als deze UID daar niet zit -> ignore (geen log)
    if (nextZones[zoneIndex] !== ev.uid) {
      return state;
    }

    nextZones[zoneIndex] = null;

    const next = {
      ...state,
      zones: nextZones,
      log: pushLog(state.log, ev.raw),
    };

    // turn-flow: confirmed kaart weg -> reset snapshot
    if (next.confirmedTurnCard?.uid === ev.uid) {
      next.confirmedTurnCard = null;
    }

    // game rule: turn reset als je turn-zone leegmaakt
    if (next.turnZone === ev.zone) next.turnZone = null;

    return next;
  }

  if (ev.type === "turn") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= nextZones.length) return state;

    // ✅ anti-duplicate: dezelfde turn opnieuw -> ignore (geen log)
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

export function applyAction(state, action) {
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

  if (action.type === "confirm_turn") {
    const turnCard = action.turnCard;
    if (!turnCard) return state;

    // ✅ guard 1: er moet een turnZone gekozen zijn
    if (!state.turnZone) return state;

    // ✅ guard 2: alleen kaart uit de huidige turnZone mag bevestigd worden
    if (turnCard.zone !== state.turnZone) return state;

    // ✅ guard 3: zone moet effectief die UID bevatten op dit moment
    const zoneIndex = state.turnZone - 1;
    const uidInZone = state.zones?.[zoneIndex] ?? null;
    if (!uidInZone || uidInZone !== turnCard.uid) return state;

    // ✅ duplicate confirm guard
    if (state.confirmedTurnCard?.uid === turnCard.uid) return state;

    const playersCount = state.players?.length ?? 4;

    const alreadyPlayedThisTrick = (state.currentTrick ?? []).some(
      (p) => p.playerIndex === state.currentPlayerIndex
    );
    if (alreadyPlayedThisTrick) return state; // gelegd is gelegd

    const played = { playerIndex: state.currentPlayerIndex, ...turnCard };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(
      state.log,
      `CONFIRM|${turnCard.zone}|${turnCard.uid}|${turnCard.card}|P${state.currentPlayerIndex}`
    );

    // default next player
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    // ✅ auto-advance turnZone (v1 mapping: spelerIndex 0->zone1, 1->zone2, ...)
    let nextTurnZone = nextPlayerIndex + 1;
    if (nextTurnZone < 1 || nextTurnZone > (state.zones?.length ?? 4)) nextTurnZone = 1;

    // Trick complete?
    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.gameMode);
      if (!winner) return state;

      if (state.gameMode === "NEXT_TURN") {
        nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;
      } else {
        nextPlayerIndex = winner.playerIndex;
      }

      // ✅ turn naar startspeler volgende trick
      nextTurnZone = nextPlayerIndex + 1;
      if (nextTurnZone < 1 || nextTurnZone > (state.zones?.length ?? 4)) nextTurnZone = 1;

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

    // remove from pile
    const nextPile = pile.slice(0, -1);

    // remove from currentTrick (laatste play)
    const nextTrick = (state.currentTrick ?? []).filter(
      (p) =>
        !(
          p.uid === last.uid &&
          p.zone === last.zone &&
          p.playerIndex === last.playerIndex
        )
    );

    // player terugzetten naar degene die net speelde
    const playersCount = state.players?.length ?? 4;
    const prevPlayerIndex =
      (state.currentPlayerIndex - 1 + playersCount) % playersCount;

    // turnZone terug naar die speler
    const prevTurnZone = prevPlayerIndex + 1;

    return {
      ...state,
      pile: nextPile,
      currentTrick: nextTrick,
      currentPlayerIndex: prevPlayerIndex,
      turnZone: prevTurnZone,
      confirmedTurnCard: null, // zodat je opnieuw kan leggen
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

  if (action.type === "set_deck_setup") {
    return { ...state, deckSetup: !!action.value };
  }

  if (action.type === "set_deck_index") {
    const i = Math.max(0, Math.min(action.maxIndex ?? 51, action.index ?? 0));
    return { ...state, deckIndex: i };
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

  if (action.type === "set_auto_confirm") {
    return { ...state, autoConfirm: !!action.value };
  }

  if (action.type === "set_deck_index") {
    const max = action.maxIndex ?? 51;
    const i = Math.max(0, Math.min(max, action.index ?? 0));
    return { ...state, deckIndex: i };
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
  // --- TURN CONTROLS (Optie C) ---

  if (action.type === "start_turn") {
    // Als al gestart: niets doen
    if (state.turnZone) return state;

    // Start: eerste niet-lege zone, anders zone 1
    const zones = state.zones ?? [];
    const idx = zones.findIndex((uid) => uid != null);
    const startZone = idx >= 0 ? idx + 1 : 1;

    // Sync player index met zone (v1 mapping: zone1->P0, zone2->P1,...)
    const playersCount = state.players?.length ?? 4;
    const startPlayerIndex = Math.max(0, Math.min(playersCount - 1, startZone - 1));

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
      const startPlayerIndex = Math.max(0, Math.min(playersCount - 1, startZone - 1));

      return {
        ...state,
        turnZone: startZone,
        currentPlayerIndex: startPlayerIndex,
        log: pushLog(state.log, `TURN|START|Z${startZone}|P${startPlayerIndex}`),
      };
    }

    // next player/zone
    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;
    let nextTurnZone = nextPlayerIndex + 1;

    // Safety clamp naar zonesCount
    if (nextTurnZone < 1 || nextTurnZone > zonesCount) nextTurnZone = 1;

    if (skipEmpty) {
      // probeer max één rondje om een niet-lege zone te vinden
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
  // onbekende actions: state behouden
  return state;
}