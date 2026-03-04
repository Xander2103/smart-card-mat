// src/app/App.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { rootReducer } from "../core/state/rootReducer";
import { applyRootEvent } from "../core/state/rootEvents";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";

import { connectSerial } from "../transport/serialTransport";
import { computeGameState } from "../core/game/computeGameState";

import { Tabs } from "../ui/tabs";
import { PlayScreen } from "../ui/screens/PlayScreen";
import { DeckSetupScreen } from "../ui/screens/DeckSetupScreen";
import { SettingsScreen } from "../ui/screens/SettingsScreen";

import { CARD_BY_CODE } from "../core/mapping/deck52";

export default function App() {
  const ZONES = 4;

  const [tab, setTab] = useState("play");

  const [serialStatus, setSerialStatus] = useState("disconnected");
  const [serialConn, setSerialConn] = useState(null);

  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  // ✅ single dispatcher
  const dispatchAction = useCallback((action) => {
    setAppState((prev) => rootReducer(prev, action));
  }, []);

  // ✅ SAFE reads (no more crashes)
  const zones = appState?.zones ?? Array.from({ length: ZONES }, () => null);
  const selectedUid = appState?.selectedUid ?? null;
  const mapping = appState?.mapping ?? {};

  // persist mapping
  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  // derived game state
  const gameState = useMemo(() => computeGameState(appState), [appState]);

  // cardNames shown in ZoneGrid
  const cardNames = useMemo(() => {
    return zones.map((uid) => {
      if (!uid) return null;
      const code = mapping[uid] ?? null;
      if (!code) return null;
      const card = CARD_BY_CODE?.[code];
      return card ? `${card.label} (${card.name})` : code;
    });
  }, [zones, mapping]);

  async function connectUsb() {
    try {
      setSerialStatus("connecting...");
      const conn = await connectSerial({
        onLine: (line) => handleLine(line),
        baudRate: 115200,
      });
      setSerialConn(conn);
      setSerialStatus("connected");
    } catch (e) {
      console.error(e);
      setSerialStatus("error");
      alert(e?.message ?? "Failed to connect serial");
    }
  }

  async function disconnectUsb() {
    if (!serialConn) return;
    await serialConn.disconnect();
    setSerialConn(null);
    setSerialStatus("disconnected");
  }

  // ✅ serial line -> applyRootEvent + optional auto-confirm delay
  const AUTO_CONFIRM_DELAY_MS = 400; // 300-400ms naar smaak

  function handleLine(line) {
    const cleaned = (line ?? "").trim();
    if (!cleaned) return;

    const ev = parseEvent(cleaned);
    if (!ev) return;

    setAppState((prev) => {
      let s = applyRootEvent(prev, ev);

      // auto-confirm: enkel tijdens spelen
      if (s.phase === "PLAYING_TRICK" && s.autoConfirm && ev.type === "placed") {
        window.setTimeout(() => {
          setAppState((prev2) => rootReducer(prev2, { type: "confirm_turn" }));
        }, AUTO_CONFIRM_DELAY_MS);
      }

      return s;
    });
  }

  function handleZoneClick(realZoneNumber) {
    const uid = zones?.[realZoneNumber - 1] ?? null;
    if (!uid) return;
    dispatchAction({ type: "select_uid", uid });
  }

  const confirmTurnNow = useCallback(() => {
    dispatchAction({ type: "confirm_turn" });
  }, [dispatchAction]);

  const resetPile = useCallback(() => {
    dispatchAction({ type: "reset_pile" });
  }, [dispatchAction]);

  const undoLastPlay = useCallback(() => {
    dispatchAction({ type: "undo_last_play" });
  }, [dispatchAction]);

  // ✅ auto-confirm fallback timer (als je NIET via serial "placed" wilt triggeren)
  const AUTO_CONFIRM_MS = 650;
  const timerRef = useRef(null);
  const armedKeyRef = useRef(null);

  function clearAutoTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (!appState?.autoConfirm) {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    if (appState.phase !== "PLAYING_TRICK") {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    const playersCount = appState.players?.length ?? 4;
    const cpi = appState.currentPlayerIndex ?? 0;
    const expectedZone = (cpi % playersCount) + 1;

    const uidInExpected = appState.zones?.[expectedZone - 1] ?? null;
    const cardInExpected = uidInExpected ? (appState.mapping?.[uidInExpected] ?? null) : null;

    const alreadyPlayed = (appState.currentTrick ?? []).some((p) => p.playerIndex === cpi);

    if (!uidInExpected || !cardInExpected || alreadyPlayed) {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    const key = `${cpi}|${uidInExpected}|${cardInExpected}`;
    if (armedKeyRef.current === key && timerRef.current) return;

    armedKeyRef.current = key;
    clearAutoTimer();

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setAppState((p) => rootReducer(p, { type: "confirm_turn" }));
    }, AUTO_CONFIRM_MS);
  }, [
    appState?.autoConfirm,
    appState?.phase,
    appState?.currentPlayerIndex,
    appState?.zones,
    appState?.mapping,
    appState?.currentTrick,
    appState?.players,
  ]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Smart Card Mat</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={connectUsb} disabled={serialStatus === "connected" || serialStatus === "connecting..."}>
          Connect USB
        </button>

        <button onClick={disconnectUsb} disabled={serialStatus !== "connected"}>
          Disconnect
        </button>

        <span>Status: {serialStatus}</span>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "play", label: "Play" },
          { value: "deck", label: "Deck Setup" },
          { value: "settings", label: "Settings" },
        ]}
      />

      {tab === "play" && (
        <PlayScreen
          appState={appState}
          gameState={gameState}
          zones={zones}
          turnZone={gameState?.expectedZone ?? null}
          cardNames={cardNames}
          onZoneClick={handleZoneClick}
          onConfirmTurn={confirmTurnNow}
          onUndo={undoLastPlay}
          onResetPile={resetPile}
          showDebug={true}
          onOpenDobbelkingen={() => dispatchAction({ type: "open_mode", mode: "DOBBELKINGEN" })}
          onCloseMode={() => dispatchAction({ type: "open_mode", mode: null })}
          onStartDobbelkingen={() => dispatchAction({ type: "start_dobbelkingen" })}
          onChooseDobbelkingenContract={(c) => dispatchAction({ type: "choose_contract", contract: c })}
          onBackFromContract={() => dispatchAction({ type: "abort_contract" })}
        />
      )}

      {tab === "deck" && (
        <DeckSetupScreen
          appState={appState}
          mapping={mapping}
          selectedUid={selectedUid}
          dispatchAction={dispatchAction}
        />
      )}

      {tab === "settings" && (
        <SettingsScreen appState={appState} dispatchAction={dispatchAction} />
      )}
    </div>
  );
}