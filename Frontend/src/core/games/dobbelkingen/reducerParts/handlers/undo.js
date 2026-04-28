// src/core/games/dobbelkingen/reducerParts/handlers/undo.js
import { getDobbelState, setDobbelState, pushLog } from "../state";

export function handleDobbelUndoAction(state, action) {
  const d = getDobbelState(state);

  if (action.type === "undo_last_play") {
    const pile = d.pile ?? [];
    if (pile.length === 0) return state;

    const last = pile[pile.length - 1];
    const nextPile = pile.slice(0, -1);

    const nextTrick = (d.currentTrick ?? []).filter(
      (p) =>
        !(
          p.uid === last.uid &&
          p.zone === last.zone &&
          p.playerIndex === last.playerIndex
        )
    );

    const playersCount = state.players?.length ?? 4;
    const prevPlayerIndex =
      (d.currentPlayerIndex - 1 + playersCount) % playersCount;

    const rebuiltUsedSet = {};
    const rebuiltUsedCodes = [];

    for (const p of nextPile) {
      if (!p?.card) continue;
      if (!rebuiltUsedSet[p.card]) rebuiltUsedCodes.push(p.card);
      rebuiltUsedSet[p.card] = true;
    }

    return setDobbelState(
      {
        ...state,
        lastError: null,
        log: pushLog(
          state.log,
          `UNDO|${last.zone}|${last.uid}|P${last.playerIndex}`
        ),
      },
      {
        ...d,
        pile: nextPile,
        currentTrick: nextTrick,
        currentPlayerIndex: prevPlayerIndex,
        confirmedTurnCard: null,
        usedCardCodes: rebuiltUsedCodes,
        usedCardSet: rebuiltUsedSet,
      }
    );
  }

  if (action.type === "reset_pile") {
    return setDobbelState(
      {
        ...state,
        lastError: null,
        log: pushLog(state.log, "PILE|RESET"),
      },
      {
        ...d,
        pile: [],
        confirmedTurnCard: null,
        currentTrick: [],
        usedCardCodes: [],
        usedCardSet: {},
        tricksPlayedInContract: 0,
      }
    );
  }

  return state;
}