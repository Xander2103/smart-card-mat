// src/core/games/dobbelkingen/reducer.js
import { handleDobbelUiAction } from "./reducerParts/handlers/ui";
import { handleDobbelFlowAction } from "./reducerParts/handlers/flow";
import { handleDobbelUndoAction } from "./reducerParts/handlers/undo";
import { handleDobbelConfirmTurn } from "./reducerParts/confirmTurn";

export function reduceDobbelkingen(state, action) {
  if (state.modeId !== "dobbelkingen") return state;

  const uiState = handleDobbelUiAction(state, action);
  if (uiState !== state) return uiState;

  const flowState = handleDobbelFlowAction(state, action);
  if (flowState !== state) return flowState;

  const undoState = handleDobbelUndoAction(state, action);
  if (undoState !== state) return undoState;

  const confirmState = handleDobbelConfirmTurn(state, action);
  if (confirmState !== state) return confirmState;

  return state;
}