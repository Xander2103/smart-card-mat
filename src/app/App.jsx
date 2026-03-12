import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "../styles/App.css";

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

function BluetoothIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v18m0-18 6 5-6 4m0-9-6 5 6 4m0 0 6 4-6 5m0-9-6 4 6 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const { isMobile, isLandscape } = useViewport();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBlePanel, setShowBlePanel] = useState(false);
  const [lockToast, setLockToast] = useState(false);
  const [mobileHeaderExpanded, setMobileHeaderExpanded] = useState(true);

  const [tab, setTab] = useState("play");

  const [bleStatus, setBleStatus] = useState("disconnected");
  const [bleConn, setBleConn] = useState(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const hadBleConnectionRef = useRef(false);
  const manualBleDisconnectRef = useRef(false);

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
          const wasManual = manualBleDisconnectRef.current;
          manualBleDisconnectRef.current = false;
          setBleConn(null);
          setBleStatus("disconnected");
          if (hadBleConnectionRef.current && !wasManual) {
            setShowDisconnectModal(true);
          }
        },
      });

      manualBleDisconnectRef.current = false;
      hadBleConnectionRef.current = true;
      setBleConn(conn);
      setBleStatus("connected");
    } catch (error) {
      console.error(error);
      manualBleDisconnectRef.current = false;
      setBleStatus("error");
      alert(error?.message ?? "Failed to connect Bluetooth");
    }
  }, [handleLine]);

  const disconnectBle = useCallback(async () => {
    if (!bleConn) return;

    manualBleDisconnectRef.current = true;

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


  const mobileCompactHeader =
    isMobile &&
    appState?.activeMode === "DOBBELKINGEN" &&
    ["DOBBELKINGEN_READY", "CHOOSING_CONTRACT", "CHOOSING_TROEF", "PLAYING_TRICK"].includes(appState?.phase);

  const mobileTableOnlyMode = mobileCompactHeader && appState?.phase === "PLAYING_TRICK";

  useEffect(() => {
    if (!lockToast) return undefined;
    const id = window.setTimeout(() => setLockToast(false), 2500);
    return () => window.clearTimeout(id);
  }, [lockToast]);

  const statusColor =
    bleStatus === "connected"
      ? "#4ade80"
      : bleStatus === "connecting..."
        ? "#fbbf24"
        : bleStatus === "error"
          ? "#fb7185"
          : "#ef4444";

  const bleGlow =
    bleStatus === "connected"
      ? "0 0 18px rgba(74, 222, 128, 0.42)"
      : bleStatus === "connecting..."
        ? "0 0 16px rgba(251, 191, 36, 0.30)"
        : "0 0 16px rgba(239, 68, 68, 0.28)";

  useEffect(() => {
    if (!mobileCompactHeader) {
      setMobileHeaderExpanded(true);
      return;
    }

    setMobileHeaderExpanded(!mobileTableOnlyMode);
  }, [mobileCompactHeader, mobileTableOnlyMode, appState?.phase]);

  const compactHeaderVisible = !mobileTableOnlyMode || mobileHeaderExpanded;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {mobileCompactHeader ? (
        compactHeaderVisible ? (
        <div style={{ ...theme.panel, padding: mobileTableOnlyMode ? 10 : 12, display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: mobileTableOnlyMode ? 8 : 10 }}>
            <button
              onClick={() => {
                setShowMobileMenu((v) => !v);
                setShowBlePanel(false);
              }}
              style={{ ...theme.button, padding: mobileTableOnlyMode ? "8px 10px" : "10px 12px", borderRadius: 16, fontSize: mobileTableOnlyMode ? 13 : 14 }}
            >
              ☰ Menu
            </button>

            <div style={{ textAlign: "center", minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: mobileTableOnlyMode ? 15 : 17 }}>Dobbelkingen</div>
              <div style={{ color: "#c8b6a1", fontSize: mobileTableOnlyMode ? 11 : 12, marginTop: 2 }}>
                {appState?.phase === "CHOOSING_CONTRACT"
                  ? "Contract kiezen"
                  : appState?.phase === "CHOOSING_TROEF"
                    ? "Troef kiezen"
                    : "Matchmodus actief"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => {
                  setShowBlePanel((v) => !v);
                  setShowMobileMenu(false);
                }}
                aria-label={`Bluetooth ${bleStatus}`}
                title={`Bluetooth ${bleStatus}`}
                style={{
                  ...theme.button,
                  width: mobileTableOnlyMode ? 42 : 46,
                  height: mobileTableOnlyMode ? 42 : 46,
                  borderRadius: 999,
                  padding: 0,
                  border: `1px solid ${statusColor}66`,
                  background: `${statusColor}14`,
                  boxShadow: bleGlow,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BluetoothIcon size={mobileTableOnlyMode ? 18 : 20} color={statusColor} />
              </button>

            </div>
          </div>

          {showBlePanel ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={connectBle} disabled={bleStatus === "connected" || bleStatus === "connecting..."} style={{ ...theme.button, opacity: bleStatus === "connected" || bleStatus === "connecting..." ? 0.55 : 1 }}>Connect BLE</button>
              <button onClick={disconnectBle} disabled={bleStatus !== "connected"} style={{ ...theme.button, opacity: bleStatus !== "connected" ? 0.55 : 1 }}>Disconnect</button>
            </div>
          ) : null}

          {showMobileMenu ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isLandscape ? "repeat(3, minmax(0, 140px))" : "repeat(2, minmax(0, 140px))",
                justifyContent: "center",
                gap: 12,
                paddingTop: 4,
              }}
            >
              {[
                { value: "play", label: "Play" },
                { value: "players", label: "Players", locked: playersLocked },
                { value: "history", label: "History" },
                { value: "stats", label: "Stats" },
                { value: "deck", label: "Deck Setup" },
                { value: "settings", label: "Settings" },
              ].map((item) => {
                const active = tab === item.value;
                const locked = !!item.locked;

                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      if (item.value === "players" && playersLocked) {
                        setLockToast(true);
                        return;
                      }
                      setTab(item.value);
                      setShowMobileMenu(false);
                    }}
                    style={{
                      ...theme.button,
                      minHeight: 58,
                      padding: "12px 10px",
                      borderRadius: 16,
                      textAlign: "center",
                      fontWeight: 900,
                      fontSize: 13,
                      border: active ? "1px solid rgba(251, 191, 36, 0.34)" : locked ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.08)",
                      background: active
                        ? "linear-gradient(180deg, rgba(251, 191, 36, 0.18) 0%, rgba(217, 119, 6, 0.14) 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                      color: locked ? "#f87171" : active ? "#fde68a" : "#f5efe6",
                      textDecoration: locked ? "line-through" : "none",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {lockToast ? (
            <div style={{ borderRadius: 14, padding: "8px 10px", background: "rgba(127,29,29,0.35)", border: "1px solid rgba(248,113,113,0.25)", color: "#fee2e2", fontWeight: 700, fontSize: 13 }}>
              Players zijn vergrendeld terwijl een match bezig is.
            </div>
          ) : null}
        </div>
        ) : (
        mobileTableOnlyMode ? null : (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4 }}>
          <button
            onClick={() => setMobileHeaderExpanded(true)}
            style={{ ...theme.button, padding: "7px 14px", borderRadius: 999, fontSize: 12 }}
          >
            Open header
          </button>
        </div>
        )
        )
      ) : (
        <div
          style={{
            ...theme.panel,
            width: "100%",
            padding: isMobile ? 16 : 20,
            display: "grid",
            gap: 14,
            background:
              "linear-gradient(180deg, rgba(39, 27, 21, 0.94) 0%, rgba(28, 20, 16, 0.94) 100%)",
            border: "1px solid rgba(251, 191, 36, 0.18)",
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "auto 1fr auto" : "1fr auto",
                alignItems: "center",
                gap: 14,
              }}
            >
              {isMobile ? (
                <button
                  onClick={() => {
                    setShowMobileMenu((v) => !v);
                    setShowBlePanel(false);
                  }}
                  style={{ ...theme.button, padding: "10px 12px", borderRadius: 16, justifySelf: "start" }}
                >
                  ☰ Menu
                </button>
              ) : (
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: 34 }}>Smart Card Mat</h1>
                  <div style={{ marginTop: 6, color: "#c8b6a1", maxWidth: "100%" }}>
                    RFID kaartdetectie, spelmodi en live scoring in een donkere tavern card-table look.
                  </div>
                </div>
              )}

              {isMobile ? (
                <div style={{ minWidth: 0, textAlign: "center" }}>
                  <h1 style={{ margin: 0, fontSize: 24 }}>Smart Card Mat</h1>
                  <div style={{ marginTop: 4, color: "#c8b6a1", fontSize: 12 }}>
                    RFID kaartdetectie, spelmodi en live scoring in een donkere tavern card-table look.
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => {
                  setShowBlePanel((v) => !v);
                  if (isMobile) setShowMobileMenu(false);
                }}
                aria-label={`Bluetooth ${bleStatus}`}
                title={`Bluetooth ${bleStatus}`}
                style={{
                  ...theme.button,
                  width: isMobile ? 48 : 52,
                  height: isMobile ? 48 : 52,
                  borderRadius: 999,
                  padding: 0,
                  border: `1px solid ${statusColor}66`,
                  background: `${statusColor}14`,
                  boxShadow: bleGlow,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  justifySelf: "end",
                }}
              >
                <BluetoothIcon size={isMobile ? 20 : 22} color={statusColor} />
              </button>
            </div>

            {showBlePanel ? (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto", justifyContent: isMobile ? undefined : "start", gap: 10, alignItems: "center" }}>
                <div style={{ borderRadius: 999, padding: "8px 12px", border: `1px solid ${statusColor}44`, background: `${statusColor}12`, boxShadow: bleGlow, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, justifyContent: "center" }}>
                  <BluetoothIcon size={16} color={statusColor} />
                  {bleStatus}
                </div>
                <button onClick={connectBle} disabled={bleStatus === "connected" || bleStatus === "connecting..."} style={{ ...theme.button, opacity: bleStatus === "connected" || bleStatus === "connecting..." ? 0.55 : 1 }}>Connect BLE</button>
                <button onClick={disconnectBle} disabled={bleStatus !== "connected"} style={{ ...theme.button, opacity: bleStatus !== "connected" ? 0.55 : 1 }}>Disconnect</button>
              </div>
            ) : null}

            {isMobile ? (
              showMobileMenu ? (
                <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", gap: 12, justifyContent: "center" }}>
                  {[
                    { value: "play", label: "Play" },
                    { value: "players", label: "Players", locked: playersLocked },
                    { value: "history", label: "History" },
                    { value: "stats", label: "Stats" },
                    { value: "deck", label: "Deck Setup" },
                    { value: "settings", label: "Settings" },
                  ].map((item) => {
                    const active = tab === item.value;
                    const locked = !!item.locked;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          if (item.value === "players" && playersLocked) {
                            setLockToast(true);
                            return;
                          }
                          setTab(item.value);
                          setShowMobileMenu(false);
                        }}
                        style={{
                          ...theme.button,
                          minHeight: 60,
                          padding: "12px 10px",
                          borderRadius: 18,
                          textAlign: "center",
                          fontWeight: 900,
                          fontSize: 14,
                          border: active ? "1px solid rgba(251, 191, 36, 0.34)" : locked ? "1px solid rgba(248,113,113,0.22)" : "1px solid rgba(255,255,255,0.08)",
                          background: active
                            ? "linear-gradient(180deg, rgba(251, 191, 36, 0.18) 0%, rgba(217, 119, 6, 0.14) 100%)"
                            : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                          color: locked ? "#f87171" : active ? "#fde68a" : "#f5efe6",
                          textDecoration: locked ? "line-through" : "none",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ) : null
            ) : (
              <Tabs
                value={tab}
                onChange={(next) => {
                  if (next === "players" && playersLocked) {
                    setLockToast(true);
                    return;
                  }
                  setTab(next);
                }}
                items={[
                  { value: "play", label: "Play" },
                  { value: "players", label: <span style={playersLocked ? { color: "#f87171", textDecoration: "line-through" } : undefined}>Players</span> },
                  { value: "history", label: "History" },
                  { value: "stats", label: "Stats" },
                  { value: "deck", label: "Deck Setup" },
                  { value: "settings", label: "Settings" },
                ]}
              />
            )}

            {!hasEnoughPlayers ? (
              <div style={{ borderRadius: 16, padding: "10px 12px", background: "rgba(127, 29, 29, 0.35)", border: "1px solid rgba(248, 113, 113, 0.25)", color: "#fee2e2", fontWeight: 700 }}>
                Kies eerst exact 4 spelers in de Players tab voordat je een match start.
              </div>
            ) : null}

            {lockToast ? (
              <div style={{ borderRadius: 16, padding: "10px 12px", background: "rgba(180, 83, 9, 0.18)", border: "1px solid rgba(251, 191, 36, 0.22)", color: "#fde68a", fontWeight: 700 }}>
                Players zijn vergrendeld terwijl een match bezig is.
              </div>
            ) : null}
          </div>
        </div>
      )}


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
          mobileHeaderExpanded={mobileHeaderExpanded}
          onToggleMobileHeader={() => setMobileHeaderExpanded((prev) => !prev)}
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
      {showDisconnectModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(4, 6, 12, 0.72)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              ...theme.panel,
              width: "min(92vw, 420px)",
              padding: 20,
              display: "grid",
              gap: 14,
              border: "1px solid rgba(248, 113, 113, 0.28)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(248, 113, 113, 0.35)",
                  background: "rgba(127, 29, 29, 0.28)",
                  boxShadow: "0 0 18px rgba(248, 113, 113, 0.20)",
                }}
              >
                <BluetoothIcon size={18} color="#fb7185" />
              </div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Bluetooth verbinding verbroken</div>
            </div>

            <div style={{ color: "#dbc6b6", lineHeight: 1.55 }}>
              Je toestel is gedisconnecteerd. Controleer je verbinding en verbind opnieuw als je verder wilt spelen.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDisconnectModal(false)}
                style={{ ...theme.button, minWidth: 96 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}