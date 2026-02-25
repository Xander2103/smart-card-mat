// src/core/state/reducer.js
import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { determineTrickWinner } from "../game/trickLogic";

function pushLog(prevLog, raw) {
  return [raw, ...prevLog].slice(0, 50);
}

export function applyEvent(state, ev) {
  const next = {
    ...state,
    zones: [...state.zones],
    log: pushLog(state.log, ev.raw),
  };

  if (ev.type === "placed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    // 1 UID kan maar in 1 zone tegelijk zitten
    for (let i = 0; i < next.zones.length; i++) {
      if (next.zones[i] === ev.uid) next.zones[i] = null;
    }

    // zone-overwrite
    next.zones[zoneIndex] = ev.uid;

    // ✅ turn-flow v1: als je in de turnZone iets plaatst, turnCard verandert mogelijk
    // → reset confirm snapshot
    if (next.turnZone === ev.zone) {
      next.confirmedTurnCard = null;
    }

    next.selectedUid = ev.uid;
    return next;
  }

  if (ev.type === "removed") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    if (next.zones[zoneIndex] === ev.uid) {
      next.zones[zoneIndex] = null;

      // ✅ turn-flow v1: als de confirmed kaart weggaat, reset confirm snapshot
      if (next.confirmedTurnCard?.uid === ev.uid) {
        next.confirmedTurnCard = null;
      }

      // game rule: turn reset als je turn-zone leegmaakt
      if (next.turnZone === ev.zone) next.turnZone = null;
    }
    return next;
  }

  if (ev.type === "turn") {
    const zoneIndex = ev.zone - 1;
    if (zoneIndex < 0 || zoneIndex >= next.zones.length) return next;

    // ✅ optioneel maar logisch: nieuwe turn gekozen → reset confirm snapshot
    next.confirmedTurnCard = null;

    next.turnZone = ev.zone;
    return next;
  }

  return next;
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

    if (state.confirmedTurnCard?.uid === turnCard.uid) return state;

    const playersCount = state.players?.length ?? 4;

    const alreadyPlayedThisTrick =
      (state.currentTrick ?? []).some(
        (p) => p.playerIndex === state.currentPlayerIndex
      );

    if (alreadyPlayedThisTrick) return state; // gelegd is gelegd

    const played = { playerIndex: state.currentPlayerIndex, ...turnCard };
    const nextTrick = [...(state.currentTrick ?? []), played];

    let nextLog = pushLog(
      state.log,
      `CONFIRM|${turnCard.zone}|${turnCard.uid}|${turnCard.card}|P${state.currentPlayerIndex}`
    );

    let nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;

    if (nextTrick.length === playersCount) {
      const winner = determineTrickWinner(nextTrick, state.gameMode);
      if (!winner) return state;

      if (state.gameMode === "NEXT_TURN") {
        nextPlayerIndex = (state.currentPlayerIndex + 1) % playersCount;
      } else {
        nextPlayerIndex = winner.playerIndex;
      }

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
      log: nextLog,
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
  // onbekende actions: state behouden
  return state;
}