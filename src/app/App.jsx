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

const theme = {
  panel: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "rgba(15, 23, 42, 0.76)",
    backdropFilter: "blur(18px)",
    borderRadius: 22,
    boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
    color: "#e5eefb",
  },
  button: {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "#e5eefb",
  },
};

export default function App() {
  const ZONES = 4;

  const [tab, setTab] = useState("play");
  const [serialStatus, setSerialStatus] = useState("disconnected");
  const [serialConn, setSerialConn] = useState(null);
  const [appState, setAppState] = useState(() => createInitialState({ zonesCount: ZONES }));

  const dispatchAction = useCallback((action) => {
    setAppState((prev) => rootReducer(prev, action));
  }, []);

  const zones = appState?.zones ?? Array.from({ length: ZONES }, () => null);
  const selectedUid = appState?.selectedUid ?? null;
  const mapping = appState?.mapping ?? {};

  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  const gameState = useMemo(() => computeGameState(appState), [appState]);

  const cardNames = useMemo(
    () =>
      zones.map((uid) => {
        if (!uid) return null;
        const code = mapping[uid] ?? null;
        if (!code) return null;
        const card = CARD_BY_CODE?.[code];
        return card ? `${card.label} (${card.name})` : code;
      }),
    [zones, mapping]
  );

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

  const AUTO_CONFIRM_DELAY_MS = 400;

  function handleLine(line) {
    const cleaned = (line ?? "").trim();
    if (!cleaned) return;

    const ev = parseEvent(cleaned);
    if (!ev) return;

    setAppState((prev) => {
      const s = applyRootEvent(prev, ev);

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
    if (!appState?.autoConfirm || appState.phase !== "PLAYING_TRICK") {
      clearAutoTimer();
      armedKeyRef.current = null;
      return;
    }

    const playersCount = appState.players?.length ?? 4;
    const cpi = appState.currentPlayerIndex ?? 0;
    const expectedZone = (cpi % playersCount) + 1;

    const uidInExpected = appState.zones?.[expectedZone - 1] ?? null;
    const cardInExpected = uidInExpected ? appState.mapping?.[uidInExpected] ?? null : null;
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

  const statusColor =
    serialStatus === "connected"
      ? "#4ade80"
      : serialStatus === "connecting..."
        ? "#fbbf24"
        : serialStatus === "error"
          ? "#fb7185"
          : "#94a3b8";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ ...theme.panel, padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34 }}>Smart Card Mat</h1>
            <div style={{ marginTop: 6, color: "#9fb0cf" }}>
              RFID kaartdetectie, spelmodi en live scoring op één scherm.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                border: `1px solid ${statusColor}44`,
                background: `${statusColor}12`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 999, background: statusColor, boxShadow: `0 0 14px ${statusColor}` }} />
              USB {serialStatus}
            </div>

            <button
              onClick={connectUsb}
              disabled={serialStatus === "connected" || serialStatus === "connecting..."}
              style={{ ...theme.button, opacity: serialStatus === "connected" || serialStatus === "connecting..." ? 0.55 : 1 }}
            >
              Connect USB
            </button>

            <button
              onClick={disconnectUsb}
              disabled={serialStatus !== "connected"}
              style={{ ...theme.button, opacity: serialStatus !== "connected" ? 0.55 : 1 }}
            >
              Disconnect
            </button>
          </div>
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
      </div>

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
          dispatchAction={dispatchAction}
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

      {tab === "settings" && <SettingsScreen appState={appState} dispatchAction={dispatchAction} />}
    </div>
  );
}
