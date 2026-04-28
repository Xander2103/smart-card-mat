import { storageService } from "../storage/services/storageService";
import { matchRecordBuilders } from "./matchRecordBuilders";

function didDobbelkingenJustFinish(prevState, nextState) {
  const prevDobbel = prevState?.game?.dobbelkingen;
  const nextDobbel = nextState?.game?.dobbelkingen;
  return !prevDobbel?.matchFinishedAt && !!nextDobbel?.matchFinishedAt;
}

function didKleurenwiezenJustFinish(prevState, nextState) {
  const prevSlice = prevState?.game?.kleurenwiezen;
  const nextSlice = nextState?.game?.kleurenwiezen;
  const prevFinishedAt = prevSlice?.matchFinishedAt ?? null;
  const nextFinishedAt = nextSlice?.matchFinishedAt ?? null;
  return !prevFinishedAt && !!nextFinishedAt && nextFinishedAt !== prevFinishedAt;
}

export function persistFinishedMatchIfNeeded(prevState, nextState) {
  const modeId = nextState?.modeId;
  if (!modeId) return nextState;

  let finished = false;
  if (modeId === "dobbelkingen") finished = didDobbelkingenJustFinish(prevState, nextState);
  if (modeId === "kleurenwiezen") finished = didKleurenwiezenJustFinish(prevState, nextState);
  if (!finished) return nextState;

  const builder = matchRecordBuilders[modeId];
  if (!builder) return nextState;

  const matchRecord = builder(nextState);
  storageService.saveMatch(matchRecord);
  return nextState;
}
