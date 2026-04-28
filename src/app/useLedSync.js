import { useEffect, useRef } from "react";
import { leds } from "../transport/ledClient";

function getDobbelSlice(appState) {
  return appState?.game?.dobbelkingen ?? null;
}

function getKleurenSlice(appState) {
  return appState?.game?.kleurenwiezen ?? null;
}

function getWinnerZone(appState) {
  if (appState?.modeId === "dobbelkingen") {
    const d = getDobbelSlice(appState);
    const winnerIndex = d?.matchSummary?.winnerPlayerIndex ?? null;
    return Number.isInteger(winnerIndex) ? winnerIndex + 1 : null;
  }

  if (appState?.modeId === "kleurenwiezen") {
    const k = getKleurenSlice(appState);
    const deltas = k?.lastResult?.result?.playerDeltas;

    if (!Array.isArray(deltas) || deltas.length === 0) {
      return null;
    }

    let bestIndex = 0;
    let bestValue = Number(deltas[0] ?? Number.NEGATIVE_INFINITY);

    for (let i = 1; i < deltas.length; i += 1) {
      const value = Number(deltas[i] ?? Number.NEGATIVE_INFINITY);
      if (value > bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    }

    return bestIndex + 1;
  }

  return null;
}

function getTrickWinnerZone(appState) {
  if (appState?.modeId === "dobbelkingen") {
    const d = getDobbelSlice(appState);
    const winnerIndex = d?.lastTrickWinnerIndex ?? null;
    return Number.isInteger(winnerIndex) ? winnerIndex + 1 : null;
  }

  if (appState?.modeId === "kleurenwiezen") {
    const k = getKleurenSlice(appState);
    const winnerIndex = k?.lastTrickWinnerIndex ?? null;
    return Number.isInteger(winnerIndex) ? winnerIndex + 1 : null;
  }

  return null;
}

function isSetupPhase(appState) {
  return [
    "DOBBELKINGEN_READY",
    "CHOOSING_CONTRACT",
    "CHOOSING_TROEF",
    "KLEURENWIEZEN_SETUP",
  ].includes(appState?.phase);
}

function isPlayingPhase(appState) {
  return appState?.phase === "PLAYING_TRICK";
}

function getExpectedZone(gameState) {
  return Number.isInteger(gameState?.expectedZone) ? gameState.expectedZone : null;
}

function buildSnapshot(appState, gameState, bleStatus) {
  return {
    bleStatus,
    modeId: appState?.modeId ?? null,
    phase: appState?.phase ?? null,
    expectedZone: getExpectedZone(gameState),
    canConfirm: !!gameState?.canConfirm,
    lastError: appState?.lastError ?? null,
    trickWinnerZone: getTrickWinnerZone(appState),
    winnerZone: getWinnerZone(appState),
  };
}

export function useLedSync(appState, gameState, bleStatus) {
  const previousRef = useRef(null);

  useEffect(() => {
    const current = buildSnapshot(appState, gameState, bleStatus);
    const previous = previousRef.current;
    previousRef.current = current;

    if (bleStatus !== "connected") {
      return;
    }

    const becameConnected = previous?.bleStatus !== "connected";
    if (becameConnected) {
      leds.connected();
      leds.intro();
    }

    if (current.winnerZone != null) {
      if (
        previous?.winnerZone !== current.winnerZone ||
        previous?.phase !== current.phase
      ) {
        leds.winner(current.winnerZone);
      }
      return;
    }

    if (
      current.phase !== previous?.phase ||
      current.modeId !== previous?.modeId
    ) {
      if (!current.modeId || current.phase === "HOME") {
        leds.off();
      } else if (isSetupPhase(appState)) {
        leds.setup();
      }
    }

    if (
      isSetupPhase(appState) &&
      (current.phase !== previous?.phase || current.modeId !== previous?.modeId)
    ) {
      leds.setup();
    }

    if (isPlayingPhase(appState)) {
      if (
        current.expectedZone !== previous?.expectedZone ||
        current.canConfirm !== previous?.canConfirm ||
        current.phase !== previous?.phase
      ) {
        if (current.expectedZone != null) {
          if (current.canConfirm) {
            leds.turn(current.expectedZone);
          } else {
            leds.expect(current.expectedZone);
          }
        }
      }

      if (
        current.canConfirm &&
        !previous?.canConfirm &&
        current.expectedZone != null
      ) {
        leds.scanOk(current.expectedZone);
      }
    }

    if (
      current.lastError &&
      current.lastError !== previous?.lastError &&
      current.expectedZone != null
    ) {
      leds.error(current.expectedZone);
    }

    if (
      current.trickWinnerZone != null &&
      current.trickWinnerZone !== previous?.trickWinnerZone
    ) {
      leds.trickWin(current.trickWinnerZone);
    }
  }, [appState, bleStatus, gameState]);
}