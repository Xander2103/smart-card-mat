import { pushLog, clampIndex } from "../utils";
import { clearHandRuntimeFields, setDobbelState } from "../slice";
import { canPickContract } from "../contractsRules";

export function handleStartDobbelkingen(state, d) {
  const chooser = d.chooserIndex ?? 0;

  const nextD = {
    ...d,
    contract: null,
    lastResult: null,
    ...clearHandRuntimeFields(),
  };

  return setDobbelState(
    {
      ...state,
      phase: "CHOOSING_CONTRACT",
      lastError: null,
      log: pushLog(state.log, `DOBBELKINGEN|START|CHOOSER=P${chooser}`),
    },
    nextD
  );
}

export function handleChooseContract(state, d, action) {
  if (state.phase !== "CHOOSING_CONTRACT") return state;

  const contract = action.contract ?? null;
  if (!contract) return state;

  if (!canPickContract(d, contract)) {
    return {
      ...state,
      lastError: `Contract kan niet: ${contract}`,
      log: pushLog(state.log, `ERROR|CONTRACT_BLOCKED|${contract}`),
    };
  }

  const playersCount = state.players?.length ?? 4;
  const chooser = clampIndex(d.chooserIndex ?? 0, playersCount);
  const leader = clampIndex(chooser + 1, playersCount);

  const nextD = {
    ...d,
    contract,
    leaderIndex: leader,
    currentPlayerIndex: leader,
    lastResult: null,
    ...clearHandRuntimeFields(),
  };

  return setDobbelState(
    {
      ...state,
      phase: "PLAYING_TRICK",
      turnZone: leader + 1,
      lastError: null,
      log: pushLog(state.log, `DOBBELKINGEN|CONTRACT|${contract}|LEADER=P${leader}`),
    },
    nextD
  );
}

export function handleAbortContract(state, d) {
  if (state.phase !== "PLAYING_TRICK") return state;

  const nextD = {
    ...d,
    contract: null,
    ...clearHandRuntimeFields(),
  };

  return setDobbelState(
    {
      ...state,
      phase: "CHOOSING_CONTRACT",
      lastError: null,
      log: pushLog(state.log, "CONTRACT|ABORT|BACK_TO_CHOOSING"),
    },
    nextD
  );
}
