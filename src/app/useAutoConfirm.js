import { useEffect, useRef } from "react";

import { AUTO_CONFIRM_MS } from "./appHelpers";

export function useAutoConfirm(appState, setAppState, applyAppAction) {
  const timerRef = useRef(null);
  const armedKeyRef = useRef(null);

  function clearAutoTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (!appState?.autoConfirm || appState.phase !== "PLAYING_TRICK") {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    const playersCount = appState.players?.length ?? 4;
    const currentPlayerIndex =
      appState.game?.dobbelkingen?.currentPlayerIndex ?? 0;
    const expectedZone = (currentPlayerIndex % playersCount) + 1;

    const uidInExpected = appState.zones?.[expectedZone - 1] ?? null;
    const cardInExpected = uidInExpected
      ? appState.mapping?.[uidInExpected] ?? null
      : null;

    const alreadyPlayed = (
      appState.game?.dobbelkingen?.currentTrick ?? []
    ).some((play) => play.playerIndex === currentPlayerIndex);

    if (!uidInExpected || !cardInExpected || alreadyPlayed) {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    const key = `${currentPlayerIndex}|${uidInExpected}|${cardInExpected}`;

    if (armedKeyRef.current === key && timerRef.current) {
      return;
    }

    armedKeyRef.current = key;
    clearAutoTimer();

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setAppState((prev) => applyAppAction(prev, { type: "confirm_turn" }));
    }, AUTO_CONFIRM_MS);
  }, [
    appState?.autoConfirm,
    appState?.phase,
    appState?.zones,
    appState?.mapping,
    appState?.players,
    appState?.game?.dobbelkingen?.currentPlayerIndex,
    appState?.game?.dobbelkingen?.currentTrick,
    setAppState,
    applyAppAction,
  ]);

  useEffect(() => {
    return () => {
      clearAutoTimer();
    };
  }, []);
}
