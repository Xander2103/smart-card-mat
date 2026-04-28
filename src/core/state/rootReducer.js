import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { getEngine } from "../game/registry";
import { persistFinishedMatchIfNeeded } from "../matches/matchPersistence";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

function normalizePlayers(players) {
  if (!Array.isArray(players)) return [];

  return players
    .slice(0, 4)
    .map((player, index) => ({
      id: player?.id ?? `player_${index}`,
      name: player?.name ?? `Player ${index + 1}`,
    }));
}

export function applyRootAction(state, action) {
  if (action.type === "open_mode") {
    const mode = action.mode ?? null;

    if (!mode) {
      return {
        ...state,
        modeId: null,
        activeMode: null,
        gameMode: null,
        phase: "HOME",
        contract: null,
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "MODE|CLOSE"),
      };
    }

    if (mode === "DOBBELKINGEN") {
      return {
        ...state,
        modeId: "dobbelkingen",
        activeMode: "DOBBELKINGEN",
        gameMode: "DOBBELKINGEN",
        phase: "DOBBELKINGEN_READY",
        contract: null,
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "MODE|OPEN|DOBBELKINGEN"),
      };
    }

    if (mode === "KLEURENWIEZEN") {
      return {
        ...state,
        modeId: "kleurenwiezen",
        activeMode: "KLEURENWIEZEN",
        gameMode: "KLEURENWIEZEN",
        phase: "KLEURENWIEZEN_SETUP",
        contract: null,
        turnZone: null,
        lastError: null,
        log: pushLog(state.log, "MODE|OPEN|KLEURENWIEZEN"),
      };
    }

    return state;
  }

  if (action.type === "set_players") {
    return {
      ...state,
      players: normalizePlayers(action.players),
      lastError: null,
      log: pushLog(
        state.log,
        `PLAYERS|SET|COUNT=${normalizePlayers(action.players).length}`
      ),
    };
  }

  if (action.type === "select_uid") {
    return { ...state, selectedUid: action.uid };
  }

  if (
    action.type === "register_mapping" ||
    action.type === "assign_uid_to_card"
  ) {
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

  if (action.type === "set_auto_confirm") {
    return { ...state, autoConfirm: !!action.value };
  }

  if (action.type === "set_dev_mode") {
    return { ...state, devMode: !!action.value };
  }

  if (action.type === "set_show_recent_cards") {
    return { ...state, showRecentCards: !!action.value };
  }

  if (action.type === "set_show_center_trick_label") {
    return { ...state, showCenterTrickLabel: !!action.value };
  }

  if (action.type === "set_led_brightness") {
    const value = Math.max(0, Math.min(255, Number(action.value) || 0));
    return { ...state, ledBrightness: value };
  }

  if (action.type === "set_deck_setup") {
    return { ...state, deckSetup: !!action.value };
  }

  if (action.type === "set_deck_index") {
    const max = action.maxIndex ?? 51;
    const i = Math.max(0, Math.min(max, action.index ?? 0));
    return { ...state, deckIndex: i };
  }

  return state;
}

export function rootReducer(state, action) {
  let next = applyRootAction(state, action);

  const engine = next.modeId ? getEngine(next.modeId) : null;
  if (!engine?.reduce) return next;

  next = engine.reduce(next, action);
  return persistFinishedMatchIfNeeded(state, next);
}