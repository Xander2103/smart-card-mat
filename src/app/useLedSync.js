import { useEffect, useRef } from "react";
import { leds } from "../transport/ledClient";

function getDobbelSlice(appState) {
  return appState?.game?.dobbelkingen ?? null;
}

function getKleurenSlice(appState) {
  return appState?.game?.kleurenwiezen ?? null;
}

function getWinnerSeatIndex(appState) {
  if (appState?.modeId === "dobbelkingen") {
    const d = getDobbelSlice(appState);
    return d?.matchSummary?.winnerPlayerIndex ?? null;
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

    return Number.isFinite(bestIndex) ? bestIndex : null;
  }

  return null;
}

function getTrickWinnerSeatIndex(appState) {
  if (appState?.modeId === "dobbelkingen") {
    const d = getDobbelSlice(appState);
    return d?.lastTrickWinnerIndex ?? null;
  }

  if (appState?.modeId === "kleurenwiezen") {
    const k = getKleurenSlice(appState);
    return k?.lastTrickWinnerIndex ?? null;
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

function getActiveSeatIndex(appState, gameState) {
  if (!isPlayingPhase(appState)) return null;

  if (appState?.modeId === "dobbelkingen") {
    const d = getDobbelSlice(appState);
    return d?.currentPlayerIndex ?? null;
  }

  if (appState?.modeId === "kleurenwiezen") {
    const k = getKleurenSlice(appState);
    return k?.currentPlayerIndex ?? null;
  }

  if (Number.isInteger(gameState?.expectedZone)) {
    return gameState.expectedZone - 1;
  }

  return null;
}

function buildSnapshot(appState, gameState, bleStatus) {
  return {
    bleStatus,
    modeId: appState?.modeId ?? null,
    phase: appState?.phase ?? null,
    expectedZone: gameState?.expectedZone ?? null,
    canConfirm: !!gameState?.canConfirm,
    lastError: appState?.lastError ?? null,
    trickWinner: getTrickWinnerSeatIndex(appState),
    winner: getWinnerSeatIndex(appState),
    activeSeat: getActiveSeatIndex(appState, gameState),
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

    if (current.winner != null) {
      if (previous?.winner !== current.winner || previous?.phase !== current.phase) {
        leds.winner(current.winner);
      }
      return;
    }

    if (current.phase !== previous?.phase || current.modeId !== previous?.modeId) {
      if (!current.modeId || current.phase === "HOME") {
        leds.off();
      } else if (isSetupPhase(appState)) {
        leds.setup();
      }
    }

    if (isSetupPhase(appState) && (current.phase !== previous?.phase || current.modeId !== previous?.modeId)) {
      leds.setup();
    }

    if (isPlayingPhase(appState)) {
      if (
        current.activeSeat !== previous?.activeSeat ||
        current.canConfirm !== previous?.canConfirm ||
        current.phase !== previous?.phase
      ) {
        if (current.activeSeat != null) {
          if (current.canConfirm) {
            leds.turn(current.activeSeat);
          } else {
            leds.expect(current.activeSeat);
          }
        }
      }
    }

    if (current.lastError && current.lastError !== previous?.lastError && current.activeSeat != null) {
      leds.error(current.activeSeat);
    }

    if (current.trickWinner != null && current.trickWinner !== previous?.trickWinner) {
      leds.trickWin(current.trickWinner);
    }
  }, [appState, bleStatus, gameState]);
}
