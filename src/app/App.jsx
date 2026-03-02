import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { applyAction, applyEvent } from "../core/state/reducer";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";

import { connectSerial } from "../transport/serialTransport";
import { computeGameState } from "../core/game/engine";

import { Tabs } from "../ui/tabs";
import { PlayScreen } from "../ui/screens/PlayScreen";
import { DeckSetupScreen } from "../ui/screens/DeckSetupScreen";
import { SettingsScreen } from "../ui/screens/SettingsScreen";

import { CARD_BY_CODE } from "../core/mapping/deck52";

export default function App() {
  const ZONES = 4;

  // tabs
  const [tab, setTab] = useState("play");

  // serial
  const [serialStatus, setSerialStatus] = useState("disconnected");
  const [serialConn, setSerialConn] = useState(null);

  // app state
  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  const { zones, log, turnZone, selectedUid, mapping } = appState;

  // persist mapping
  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  const gameState = useMemo(() => computeGameState(appState), [appState]);

  // cardNames shown in ZoneGrid
  const cardNames = useMemo(() => {
    return zones.map((uid) => {
      if (!uid) return null;
      const code = mapping[uid] ?? null;
      if (!code) return null;
      const card = CARD_BY_CODE[code];
      return card ? `${card.label} (${card.name})` : code;
    });
  }, [zones, mapping]);

  function dispatchAction(action) {
    setAppState((prev) => applyAction(prev, action));
  }

  // serial connect/disconnect
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

  function handleLine(line) {
    const cleaned = (line ?? "").trim();
    if (!cleaned) return;

    const ev = parseEvent(cleaned);
    if (!ev) return;

    setAppState((prev) => applyEvent(prev, ev));
  }

  // click on zone selects uid
  function handleZoneClick(zoneNr) {
    const uid = zones[zoneNr - 1];
    if (!uid) return;
    dispatchAction({ type: "select_uid", uid });
  }

  // manual confirm
  const confirmTurnNow = useCallback(() => {
    dispatchAction({
      type: "confirm_turn",
      turnCard: gameState.turnCard, // snapshot
    });
  }, [gameState.turnCard]);

  const resetPile = useCallback(() => {
    dispatchAction({ type: "reset_pile" });
  }, []);

  const undoLastPlay = useCallback(() => {
    dispatchAction({ type: "undo_last_play" });
  }, []);

  // auto confirm effect
  const AUTO_CONFIRM_MS = 800;
  const autoConfirmTimerRef = useRef(null);
  const lastAutoConfirmKeyRef = useRef(null);

  useEffect(() => {
    // guard: only if enabled and confirm possible
    if (
      !appState.autoConfirm ||
      !gameState.canConfirm ||
      !gameState.turnCard ||
      !appState.turnZone
    ) {
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
      lastAutoConfirmKeyRef.current = null;
      return;
    }

    const key = `${gameState.turnCard.zone}|${gameState.turnCard.uid}`;

    if (lastAutoConfirmKeyRef.current === key && autoConfirmTimerRef.current) return;

    if (autoConfirmTimerRef.current) {
      clearTimeout(autoConfirmTimerRef.current);
      autoConfirmTimerRef.current = null;
    }

    lastAutoConfirmKeyRef.current = key;

    autoConfirmTimerRef.current = setTimeout(() => {
      confirmTurnNow();
      autoConfirmTimerRef.current = null;
    }, AUTO_CONFIRM_MS);

    return () => {
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
    };
  }, [
    appState.autoConfirm,
    appState.turnZone,
    gameState.canConfirm,
    gameState.turnCard?.zone,
    gameState.turnCard?.uid,
    confirmTurnNow,
  ]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Smart Card Mat</h1>

      {/* USB Serial */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button
          onClick={connectUsb}
          disabled={serialStatus === "connected" || serialStatus === "connecting..."}
        >
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
          turnZone={turnZone}
          cardNames={cardNames}
          onZoneClick={handleZoneClick}
          onConfirmTurn={confirmTurnNow}
          onUndo={undoLastPlay}
          onResetPile={resetPile}
          showDebug={true}
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