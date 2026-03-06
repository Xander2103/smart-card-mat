import { pushLog } from "../utils";
import { setDobbelState } from "../slice";

export function handleUndoLastPlay(state, d) {
  const pile = d.pile ?? [];
  if (pile.length === 0) return state;

  const last = pile[pile.length - 1];
  const nextPile = pile.slice(0, -1);

  const nextTrick = (d.currentTrick ?? []).filter(
    (p) => !(p.uid === last.uid && p.zone === last.zone && p.playerIndex === last.playerIndex)
  );

  const playersCount = state.players?.length ?? 4;
  const prevPlayerIndex = (d.currentPlayerIndex - 1 + playersCount) % playersCount;

  const rebuiltUsedSet = {};
  const rebuiltUsedCodes = [];
  for (const p of nextPile) {
    if (!p?.card) continue;
    if (!rebuiltUsedSet[p.card]) rebuiltUsedCodes.push(p.card);
    rebuiltUsedSet[p.card] = true;
  }

  const nextD = {
    ...d,
    pile: nextPile,
    currentTrick: nextTrick,
    currentPlayerIndex: prevPlayerIndex,
    confirmedTurnCard: null,
    usedCardCodes: rebuiltUsedCodes,
    usedCardSet: rebuiltUsedSet,
  };

  return setDobbelState(
    { ...state, lastError: null, log: pushLog(state.log, `UNDO|${last.zone}|${last.uid}|P${last.playerIndex}`) },
    nextD
  );
}

export function handleResetPile(state, d) {
  const nextD = {
    ...d,
    pile: [],
    confirmedTurnCard: null,
    currentTrick: [],
    usedCardCodes: [],
    usedCardSet: {},
    tricksPlayedInContract: 0,
  };

  return setDobbelState(
    { ...state, lastError: null, log: pushLog(state.log, "PILE|RESET") },
    nextD
  );
}
