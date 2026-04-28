import { useEffect, useRef } from "react";

import { playUiSound } from "../lib/uiSound";

export function useUiSounds(appState) {
  const prevTrickCountRef = useRef(0);
  const prevOverlayOpenRef = useRef(false);
  const prevDoneRef = useRef(false);
  const prevLastErrorRef = useRef("");

  useEffect(() => {
    function isInteractiveButton(target) {
      return !!target?.closest?.("button, [role='button']");
    }

    function handlePointerOver(event) {
      if (!isInteractiveButton(event.target)) return;
      playUiSound("hover");
    }

    function handleClick(event) {
      if (!isInteractiveButton(event.target)) return;
      playUiSound("click");
    }

    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    const trickCount = appState?.game?.dobbelkingen?.trickHistory?.length ?? 0;
    if (trickCount > prevTrickCountRef.current) {
      playUiSound("trickWin");
    }
    prevTrickCountRef.current = trickCount;
  }, [appState?.game?.dobbelkingen?.trickHistory]);

  useEffect(() => {
    const overlayOpen = !!appState?.game?.dobbelkingen?.contractOverlay?.open;
    if (overlayOpen && !prevOverlayOpenRef.current) {
      playUiSound("contractDone");
    }
    prevOverlayOpenRef.current = overlayOpen;
  }, [appState?.game?.dobbelkingen?.contractOverlay?.open]);

  useEffect(() => {
    const isDone = appState?.phase === "DONE";
    if (isDone && !prevDoneRef.current) {
      playUiSound("winner");
    }
    prevDoneRef.current = isDone;
  }, [appState?.phase]);

  useEffect(() => {
    const err = String(appState?.lastError ?? "");
    if (err && err !== prevLastErrorRef.current) {
      playUiSound("error");
    }
    prevLastErrorRef.current = err;
  }, [appState?.lastError]);
}
