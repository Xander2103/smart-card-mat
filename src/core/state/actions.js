// core/state/actions.js
export const setTurnZone = (zone) => ({ type: "SET_TURN_ZONE", zone });
export const startTurn = () => ({ type: "START_TURN" });
export const nextTurn = (opts = {}) => ({ type: "NEXT_TURN", opts }); 
// opts: { skipEmpty?: boolean }