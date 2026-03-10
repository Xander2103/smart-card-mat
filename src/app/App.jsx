import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { applyAppAction } from "../core/state/applyAppAction";
import { applyRootEvent } from "../core/state/rootEvents";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";

import { connectBluetooth } from "../transport/bluetoothTransport";
import { computeGameState } from "../core/game/computeGameState";

import { Tabs } from "../ui/tabs";
import { useViewport } from "../ui/play/useViewport";
import { PlayScreen } from "../ui/screens/PlayScreen";
import { DeckSetupScreen } from "../ui/screens/DeckSetupScreen";
import { SettingsScreen } from "../ui/screens/SettingsScreen";
import { PlayersScreen } from "../ui/screens/PlayersScreen";
import { HistoryScreen } from "../ui/screens/HistoryScreen";
import { StatsScreen } from "../ui/screens/StatsScreen";

import { CARD_BY_CODE } from "../core/mapping/deck52";


const theme = {
  panel: {
    border: "1px solid rgba(251, 191, 36, 0.18)",
    background: "rgba(39, 27, 21, 0.84)",
    backdropFilter: "blur(18px)",
    borderRadius: 22,
    boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
    color: "#f5efe6",
  },
  button: {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
    color: "#f5efe6",
  },
};

const ZONES = 4;
const AUTO_CONFIRM_DELAY_MS = 400;
const AUTO_CONFIRM_MS = 650;

function isMatchLocked(appState) {
  const phase = appState?.phase ?? "HOME";

  return (
    phase === "CHOOSING_CONTRACT" ||
    phase === "CHOOSING_TROEF" ||
    phase === "PLAYING_TRICK"
  );
}

export default function App() {
  const { isMobile } = useViewport();

  const [tab, setTab] = useState("play");

  const [bleStatus, setBleStatus] = useState("disconnected");
  const [bleConn, setBleConn] = useState(null);

  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  const timerRef = useRef(null);
  const armedKeyRef = useRef(null);

  const dispatchAction = useCallback((action) => {
    setAppState((prev) => applyAppAction(prev, action));
  }, []);

  const zones = appState?.zones ?? Array.from({ length: ZONES }, () => null);
  const selectedUid = appState?.selectedUid ?? null;
  const mapping = appState?.mapping ?? {};
  const selectedPlayers = appState?.players ?? [];
  const hasEnoughPlayers = selectedPlayers.length === 4;
  const playersLocked = isMatchLocked(appState);

  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  const gameState = useMemo(() => computeGameState(appState), [appState]);

  const cardNames = useMemo(() => {
    return zones.map((uid) => {
      if (!uid) return null;

      const code = mapping[uid] ?? null;
      if (!code) return null;

      const card = CARD_BY_CODE?.[code];
      return card ? `${card.label} (${card.name})` : code;
    });
  }, [zones, mapping]);

  const handleLine = useCallback((line) => {
    const cleaned = (line ?? "").trim();
    if (!cleaned) return;

    console.log("[BLE IN]", cleaned);

    const ev = parseEvent(cleaned);
    if (!ev) return;

    setAppState((prev) => {
      const nextState = applyRootEvent(prev, ev);

      if (
        nextState.phase === "PLAYING_TRICK" &&
        nextState.autoConfirm &&
        ev.type === "placed"
      ) {
        window.setTimeout(() => {
          setAppState((prev2) =>
            applyAppAction(prev2, { type: "confirm_turn" })
          );
        }, AUTO_CONFIRM_DELAY_MS);
      }

      return nextState;
    });
  }, []);

  const connectBle = useCallback(async () => {
    try {
      setBleStatus("connecting...");

      const conn = await connectBluetooth({
        onLine: handleLine,
        onDisconnected: () => {
          setBleConn(null);
          setBleStatus("disconnected");
        },
      });

      setBleConn(conn);
      setBleStatus("connected");
    } catch (error) {
      console.error(error);
      setBleStatus("error");
      alert(error?.message ?? "Failed to connect Bluetooth");
    }
  }, [handleLine]);

  const disconnectBle = useCallback(async () => {
    if (!bleConn) return;

    try {
      await bleConn.disconnect();
    } catch (error) {
      console.error(error);
    }

    setBleConn(null);
    setBleStatus("disconnected");
  }, [bleConn]);

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

  const handleStartDobbelkingen = useCallback(() => {
    if (!hasEnoughPlayers) {
      setTab("players");
      return;
    }

    dispatchAction({ type: "start_dobbelkingen" });
  }, [dispatchAction, hasEnoughPlayers]);

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
  ]);

  useEffect(() => {
    return () => {
      clearAutoTimer();
    };
  }, []);

  const statusColor =
    bleStatus === "connected"
      ? "#4ade80"
      : bleStatus === "connecting..."
        ? "#fbbf24"
        : bleStatus === "error"
          ? "#fb7185"
          : "#94a3b8";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          ...theme.panel,
          padding: isMobile ? 16 : 20,
          display: "grid",
          gap: 14,
          background:
            "linear-gradient(180deg, rgba(39, 27, 21, 0.94) 0%, rgba(28, 20, 16, 0.94) 100%)",
          border: "1px solid rgba(251, 191, 36, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 34 }}>
              Smart Card Mat
            </h1>
            <div style={{ marginTop: 6, color: "#c8b6a1", maxWidth: 740 }}>
              RFID kaartdetectie, spelmodi en live scoring in een donkere tavern
              card-table look.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              width: isMobile ? "100%" : "auto",
            }}
          >
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
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: statusColor,
                  boxShadow: `0 0 14px ${statusColor}`,
                }}
              />
              BLE {bleStatus}
            </div>

            <button
              onClick={connectBle}
              disabled={
                bleStatus === "connected" || bleStatus === "connecting..."
              }
              style={{
                ...theme.button,
                opacity:
                  bleStatus === "connected" || bleStatus === "connecting..."
                    ? 0.55
                    : 1,
                flex: isMobile ? 1 : "0 1 auto",
              }}
            >
              Connect BLE
            </button>

            <button
              onClick={disconnectBle}
              disabled={bleStatus !== "connected"}
              style={{
                ...theme.button,
                opacity: bleStatus !== "connected" ? 0.55 : 1,
                flex: isMobile ? 1 : "0 1 auto",
              }}
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
            { value: "players", label: "Players" },
            { value: "history", label: "History" },
            { value: "stats", label: "Stats" },
            { value: "deck", label: "Deck Setup" },
            { value: "settings", label: "Settings" },
          ]}
        />

        {!hasEnoughPlayers ? (
          <div
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              background: "rgba(127, 29, 29, 0.35)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              color: "#fee2e2",
              fontWeight: 700,
            }}
          >
            Kies eerst exact 4 spelers in de Players tab voordat je een match
            start.
          </div>
        ) : null}

        {playersLocked ? (
          <div
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              background: "rgba(180, 83, 9, 0.18)",
              border: "1px solid rgba(251, 191, 36, 0.22)",
              color: "#fde68a",
              fontWeight: 700,
            }}
          >
            Players zijn vergrendeld terwijl een match bezig is.
          </div>
        ) : null}
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
          showDebug={!!appState.devMode}
          onOpenDobbelkingen={() =>
            dispatchAction({ type: "open_mode", mode: "DOBBELKINGEN" })
          }
          onCloseMode={() => dispatchAction({ type: "open_mode", mode: null })}
          onStartDobbelkingen={handleStartDobbelkingen}
          onChooseDobbelkingenContract={(contract) =>
            dispatchAction({ type: "choose_contract", contract })
          }
          onBackFromContract={() =>
            dispatchAction({ type: "abort_contract" })
          }
          dispatchAction={dispatchAction}
        />
      )}

      {tab === "players" && (
        <PlayersScreen
          appState={appState}
          dispatchAction={dispatchAction}
          locked={playersLocked}
        />
      )}

      {tab === "history" && <HistoryScreen/>}

      {tab === "stats" && <StatsScreen />}

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