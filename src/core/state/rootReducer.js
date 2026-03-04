import { setUniqueMappingOverwrite } from "../mapping/uniqueMapping";
import { getEngine } from "../game/registry";

const LOG_MAX = 200;
function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

export function applyRootAction(state, action) {
  // ---- mode open/close ----
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

    return state;
  }

  
  // ---- mapping ----
  if (action.type === "select_uid") {
    return { ...state, selectedUid: action.uid };
  }

  if (action.type === "register_mapping" || action.type === "assign_uid_to_card") {
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

  // ---- settings/deck ----
  if (action.type === "set_auto_confirm") return { ...state, autoConfirm: !!action.value };

  
  if (action.type === "set_deck_setup") return { ...state, deckSetup: !!action.value };

  if (action.type === "set_deck_index") {
    const max = action.maxIndex ?? 51;
    const i = Math.max(0, Math.min(max, action.index ?? 0));
    return { ...state, deckIndex: i };
  }

  return state;
}

/**
 * Router: root action eerst, daarna engine action (of omgekeerd).
 * Regel: game actions worden enkel door game reducer behandeld.
 */
export function rootReducer(state, action) {
  // 1) root actions (altijd)
  let next = applyRootAction(state, action);

  // 2) engine actions (alleen als active mode)
  const engine = next.modeId ? getEngine(next.modeId) : null;
  if (!engine?.reduce) return next;

  // laat engine alleen reageren op actions die bij die game horen
  return engine.reduce(next, action);
}