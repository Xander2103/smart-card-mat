import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { getEngine } from "../game/registry";

const LOG_MAX = 200;

function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

function normalizeSeat(value, playersCount = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return playersCount > 0 ? playersCount - 1 : 0;
  if (playersCount <= 0) return 0;
  return ((n % playersCount) + playersCount) % playersCount;
}

function normalizePlayers(players) {
  if (!Array.isArray(players)) return [];

  return players
    .slice(0, 4)
    .map((player, index) => ({
      id: player?.id ?? `player_${index}`,
      name: player?.name ?? `Player ${index + 1}`,
      isGuest: !!player?.isGuest,
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
    const players = normalizePlayers(action.players);
    const fallbackDealer = 0;
    const previousDealerSeat =
      typeof state.tableDealerSeat === "number" ? state.tableDealerSeat : fallbackDealer;

    const nextDealerSeat =
      players.length > 0
        ? normalizeSeat(previousDealerSeat, players.length)
        : 0;

    return {
      ...state,
      players,
      tableDealerSeat: nextDealerSeat,
      lastError: null,
      log: pushLog(state.log, `PLAYERS|SET|COUNT=${players.length}`),
    };
  }

  if (action.type === "set_table_dealer") {
    const playersCount = state.players?.length ?? 4;
    const dealerSeat = normalizeSeat(action.dealerSeat, playersCount);

    return {
      ...state,
      tableDealerSeat: dealerSeat,
      log: pushLog(state.log, `TABLE|DEALER|SEAT=${dealerSeat + 1}`),
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
  return next;
}