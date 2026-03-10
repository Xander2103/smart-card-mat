import { rootReducer } from "./rootReducer";
import { persistFinishedMatchIfNeeded } from "../matches/matchPersistence";

export function applyAppAction(prevState, action) {
  const reducedState = rootReducer(prevState, action);
  const nextState = persistFinishedMatchIfNeeded(prevState, reducedState);
  return nextState;
}