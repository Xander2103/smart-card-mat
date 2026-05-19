import { storageService } from "../storage/services/storageService";
import { matchRecordBuilders } from "./matchRecordBuilders";

const persistedFinishedMatchKeys = new Set();

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

function getPlayerKey(players = []) {
  return players
    .map((player) => player?.id ?? player?.name ?? "unknown")
    .join("|");
}

function getDobbelkingenPersistKey(state) {
  const slice = state?.game?.dobbelkingen ?? {};
  const players = state?.players ?? [];

  const startedAt = slice?.matchStartedAt ?? "no-start";
  const finishedAt = slice?.matchFinishedAt ?? "no-finish";
  const summaryId = slice?.matchSummary?.matchId ?? null;

  /*
    Belangrijk:
    We gebruiken vooral startedAt + players.
    Bij jouw bug werd matchFinishedAt/summary.matchId 2x bijna tegelijk gezet,
    waardoor ids verschilden met 1ms. Daarom mag finishedAt niet de hoofd-key zijn.
  */
  return [
    "dobbelkingen",
    startedAt,
    getPlayerKey(players),
    summaryId ? "summary" : "no-summary",
    finishedAt ? "finished" : "not-finished",
  ].join("::");
}

function getKleurenwiezenPersistKey(state) {
  const slice = state?.game?.kleurenwiezen ?? {};
  const players = state?.players ?? [];

  const startedAt = slice?.matchStartedAt ?? "no-start";
  const contractId = slice?.contractId ?? "no-contract";
  const lastResultTimestamp = slice?.lastResult?.timestamp ?? slice?.matchFinishedAt ?? "no-result";

  return [
    "kleurenwiezen",
    startedAt,
    contractId,
    getPlayerKey(players),
    lastResultTimestamp ? "finished" : "not-finished",
  ].join("::");
}

function getPersistKey(modeId, state) {
  if (modeId === "dobbelkingen") {
    return getDobbelkingenPersistKey(state);
  }

  if (modeId === "kleurenwiezen") {
    return getKleurenwiezenPersistKey(state);
  }

  return `${modeId ?? "unknown"}::${Date.now()}`;
}

export function persistFinishedMatchIfNeeded(prevState, nextState) {
  const modeId = nextState?.modeId;
  if (!modeId) return nextState;

  let finished = false;

  if (modeId === "dobbelkingen") {
    finished = didDobbelkingenJustFinish(prevState, nextState);
  }

  if (modeId === "kleurenwiezen") {
    finished = didKleurenwiezenJustFinish(prevState, nextState);
  }

  if (!finished) return nextState;

  const builder = matchRecordBuilders[modeId];
  if (!builder) return nextState;

  const persistKey = getPersistKey(modeId, nextState);

  if (persistedFinishedMatchKeys.has(persistKey)) {
    console.info("Match persistence skipped duplicate:", persistKey);
    return nextState;
  }

  persistedFinishedMatchKeys.add(persistKey);

  const matchRecord = builder(nextState);
  storageService.saveMatch(matchRecord);

  return nextState;
}