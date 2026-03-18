import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/App.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { applyAppAction } from "../core/state/applyAppAction";
import { applyRootEvent } from "../core/state/rootEvents";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";
import { computeGameState } from "../core/game/computeGameState";

import { PlayScreen } from "../ui/screens/PlayScreen";
import { DeckSetupScreen } from "../ui/screens/DeckSetupScreen";
import { SettingsScreen } from "../ui/screens/SettingsScreen";
import { PlayersScreen } from "../ui/screens/PlayersScreen";
import { HistoryScreen } from "../ui/screens/HistoryScreen";
import { StatsScreen } from "../ui/screens/StatsScreen";
import { useViewport } from "../ui/play/useViewport";

import { CARD_BY_CODE } from "../core/mapping/deck52";
import { playUiSound } from "../lib/uiSound";

import { AppHeader } from "./AppHeader";
import { DisconnectModal } from "./DisconnectModal";
import { ZONES, AUTO_CONFIRM_DELAY_MS, getBleStatusStyles, getCardNames, getMobileHeaderFlags, isMatchLocked } from "./appHelpers";
import { appTheme } from "./appTheme";
import { useAutoConfirm } from "./useAutoConfirm";
import { useBluetoothConnection } from "./useBluetoothConnection";
import { useUiSounds } from "./useUiSounds";
import { useLedSync } from "./useLedSync";

export default function App() {
  const { isMobile, isLandscape } = useViewport();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBlePanel, setShowBlePanel] = useState(false);
  const [lockToast, setLockToast] = useState(false);
  const [mobileHeaderExpanded, setMobileHeaderExpanded] = useState(true);
  const [tab, setTab] = useState("play");

  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  const dispatchAction = useCallback((action) => {
    setAppState((prev) => applyAppAction(prev, action));
  }, []);

  const handleLine = useCallback((line) => {
    const cleaned = (line ?? "").trim();
    if (!cleaned) return;

    console.log("[BLE IN]", cleaned);

    const ev = parseEvent(cleaned);
    if (!ev) return;

    if (ev.type === "placed") {
      playUiSound("scan");
    }

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

  const {
    bleStatus,
    connectBle,
    disconnectBle,
    showDisconnectModal,
    setShowDisconnectModal,
  } = useBluetoothConnection(handleLine);

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
  const cardNames = useMemo(
    () => getCardNames(zones, mapping, CARD_BY_CODE),
    [zones, mapping]
  );

  useAutoConfirm(appState, setAppState, applyAppAction);
  useUiSounds(appState);
  useLedSync(appState, gameState, bleStatus);

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

  const handleOpenKleurenwiezen = useCallback(() => {
    if (!hasEnoughPlayers) {
      setTab("players");
      return;
    }

    dispatchAction({ type: "open_mode", mode: "KLEURENWIEZEN" });
  }, [dispatchAction, hasEnoughPlayers]);

  const { mobileCompactHeader, mobileTableOnlyMode } = getMobileHeaderFlags(
    appState,
    isMobile
  );

  useEffect(() => {
    if (!lockToast) return undefined;
    const id = window.setTimeout(() => setLockToast(false), 2500);
    return () => window.clearTimeout(id);
  }, [lockToast]);

  const { statusColor, bleGlow } = getBleStatusStyles(bleStatus);

  useEffect(() => {
    if (!mobileCompactHeader) {
      setMobileHeaderExpanded(true);
      return;
    }

    setMobileHeaderExpanded(!mobileTableOnlyMode);
  }, [mobileCompactHeader, mobileTableOnlyMode, appState?.phase]);

  const compactHeaderVisible = !mobileTableOnlyMode || mobileHeaderExpanded;

  function handleZoneClick(realZoneNumber) {
    const uid = zones?.[realZoneNumber - 1] ?? null;
    if (!uid) return;

    dispatchAction({ type: "select_uid", uid });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <style>{`
        @keyframes blePulseRed {
          0% { box-shadow: 0 0 0 0 rgba(248,113,113,0.32), 0 0 10px rgba(248,113,113,0.18); }
          70% { box-shadow: 0 0 0 12px rgba(248,113,113,0.0), 0 0 22px rgba(248,113,113,0.28); }
          100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.0), 0 0 10px rgba(248,113,113,0.18); }
        }
      `}</style>

      <AppHeader
        theme={appTheme}
        appState={appState}
        isMobile={isMobile}
        isLandscape={isLandscape}
        tab={tab}
        setTab={setTab}
        playersLocked={playersLocked}
        hasEnoughPlayers={hasEnoughPlayers}
        lockToast={lockToast}
        setLockToast={setLockToast}
        bleStatus={bleStatus}
        showBlePanel={showBlePanel}
        setShowBlePanel={setShowBlePanel}
        connectBle={connectBle}
        disconnectBle={disconnectBle}
        statusColor={statusColor}
        bleGlow={bleGlow}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        mobileCompactHeader={mobileCompactHeader}
        mobileTableOnlyMode={mobileTableOnlyMode}
        compactHeaderVisible={compactHeaderVisible}
        mobileHeaderExpanded={mobileHeaderExpanded}
        setMobileHeaderExpanded={setMobileHeaderExpanded}
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
          showDebug={!!appState.devMode}
          onOpenDobbelkingen={() =>
            dispatchAction({ type: "open_mode", mode: "DOBBELKINGEN" })
          }
          onOpenKleurenwiezen={handleOpenKleurenwiezen}
          onCloseMode={() => dispatchAction({ type: "open_mode", mode: null })}
          onStartDobbelkingen={handleStartDobbelkingen}
          onChooseDobbelkingenContract={(contract) =>
            dispatchAction({ type: "choose_contract", contract })
          }
          onBackFromContract={() => dispatchAction({ type: "abort_contract" })}
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
          onGoPlay={() => setTab("play")}
        />
      )}

      {tab === "history" && <HistoryScreen />}
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

      <DisconnectModal
        theme={appTheme}
        open={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
      />
    </div>
  );
}
