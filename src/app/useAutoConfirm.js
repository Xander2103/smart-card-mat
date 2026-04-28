import { useEffect } from "react";

export function useAutoConfirm(appState, setAppState, applyAppAction) {
  useEffect(() => {
    if (!appState?.autoConfirm || appState.phase !== "PLAYING_TRICK") {
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
      return;
    }

    setAppState((prev) => applyAppAction(prev, { type: "confirm_turn" }));
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
}