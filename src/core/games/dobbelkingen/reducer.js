// src/core/games/dobbelkingen/reducer.js
import { getDobbelState } from "./reducerParts/slice";
import { handleCloseContractOverlay, handleAdjustTotalScore } from "./reducerParts/handlers/ui";
import {
  handleStartDobbelkingen,
  handleChooseContract,
  handleAbortContract,
} from "./reducerParts/handlers/flow";
import { handleUndoLastPlay, handleResetPile } from "./reducerParts/handlers/undo";
import { handleConfirmTurn } from "./reducerParts/confirmTurn";

export function reduceDobbelkingen(state, action) {
  if (state.modeId !== "dobbelkingen") return state;

  const d = getDobbelState(state);

  switch (action.type) {
    case "close_contract_overlay":
      return handleCloseContractOverlay(state, d);

    case "start_dobbelkingen":
      return handleStartDobbelkingen(state, d);

    case "adjust_total_score":
      return handleAdjustTotalScore(state, d, action);

    case "choose_contract":
      return handleChooseContract(state, d, action);

    case "abort_contract":
      return handleAbortContract(state, d);

    case "undo_last_play":
      return handleUndoLastPlay(state, d);

    case "reset_pile":
      return handleResetPile(state, d);

    case "confirm_turn":
      return handleConfirmTurn(state, d);

    default:
      return state;
  }
}