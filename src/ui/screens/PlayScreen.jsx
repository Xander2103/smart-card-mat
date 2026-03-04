// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { ContractEndOverlay } from "../ContractEndOverlay";
import { useEffect, useMemo, useState } from "react";

export function PlayScreen({
  appState,
  gameState,
  zones,
  turnZone,
  cardNames,
  onZoneClick,
  onConfirmTurn,
  onUndo,
  onResetPile,
  showDebug = true,
  onBackFromContract,

  // mode flow
  onOpenDobbelkingen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,
}) {
  // ---- dobbelkingen slice ----
  const d = appState.game?.dobbelkingen ?? null;

  const players = appState.players ?? [];

  const chooserIndex = typeof d?.chooserIndex === "number" ? d.chooserIndex : null;
  const leaderIndex = typeof d?.leaderIndex === "number" ? d.leaderIndex : null;
  const currentIndex = typeof d?.currentPlayerIndex === "number" ? d.currentPlayerIndex : null;

  const chooserName =
    chooserIndex !== null ? (players[chooserIndex]?.name ?? "-") : "-";
  const leaderName =
    leaderIndex !== null ? (players[leaderIndex]?.name ?? "-") : "-";
  const currentName =
    currentIndex !== null ? (players[currentIndex]?.name ?? "-") : "-";

  const contractId = d?.contract ?? appState.contract ?? null;

  // ---- screens ----
  const showModesHome = appState.phase === "HOME";
  const showLobby =
    appState.phase === "DOBBELKINGEN_READY" ||
    appState.phase === "CHOOSING_CONTRACT";
  const showGameUi = appState.phase === "PLAYING_TRICK";

  // ✅ Mat layout: [1,2,4,3]
  const DISPLAY_ZONES = useMemo(() => [1, 2, 4, 3], []);
  const zonesForGrid = DISPLAY_ZONES.map((z) => zones?.[z - 1] ?? null);
  const cardNamesForGrid = DISPLAY_ZONES.map((z) => cardNames?.[z - 1] ?? null);

  // ZoneGrid verwacht turnZone als "grid positie" (1..4)
  const turnZoneForGrid = (() => {
    const real = gameState?.expectedZone ?? null; // echte zone 1..4
    const idx = DISPLAY_ZONES.indexOf(real);
    return idx >= 0 ? idx + 1 : null; // grid pos 1..4
  })();

  function handleGridClick(gridPos) {
    const realZone = DISPLAY_ZONES[gridPos - 1];
    if (!realZone) return;
    onZoneClick?.(realZone);
  }

  // -------------------------------------------
  // ✅ Overlay: einde MINSTE_HARTEN bij 13 harten
  // -------------------------------------------
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayKey, setOverlayKey] = useState(null);

  useEffect(() => {
    const r = d?.lastResult ?? null;
    if (!r) return;

    if (r.endedEarlyReason === "ALL_HEARTS_PLAYED") {
      const key = `hearts-${r.timestamp ?? Date.now()}`;
      if (overlayKey === key) return; // al getoond

      setOverlayKey(key);
      setOverlayOpen(true);
    }
  }, [d?.lastResult?.timestamp, d?.lastResult?.endedEarlyReason, overlayKey]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ContractEndOverlay
        open={overlayOpen}
        title="Alle harten zijn gespeeld ❤️"
        message="Dit contract stopt automatisch. Kies het volgende contract om door te spelen."
        onClose={() => setOverlayOpen(false)}
      />

      {/* A) HOME: alleen game modes */}
      {showModesHome && (
        <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />
      )}

      {/* B) LOBBY: dobbelkingen panel */}
      {showLobby && appState.activeMode === "DOBBELKINGEN" && (
        <DobbelkingenPanel
          appState={appState}
          onClose={onCloseMode}
          onStart={onStartDobbelkingen}
          onChooseContract={onChooseDobbelkingenContract}
        />
      )}

      {/* C) IN-GAME UI */}
      {showGameUi && (
        <>
          {/* ERROR */}
          {appState.lastError && (
            <div
              style={{
                border: "2px solid #ff4d4f",
                background: "#fff1f0",
                color: "#a8071a",
                borderRadius: 14,
                padding: "14px 16px",
                fontWeight: 800,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>🚫 {appState.lastError}</div>

              <button
                onClick={() => {
                  // optioneel later: dispatchAction({type:"clear_error"})
                }}
                style={{
                  border: "1px solid #ff4d4f",
                  background: "white",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          )}

          {/* controls bar */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={onConfirmTurn}
                disabled={!gameState?.canConfirm || appState.autoConfirm}
              >
                Confirm turn (manual)
              </button>

              <button onClick={onUndo}>Undo last play</button>
              <button onClick={onResetPile}>Reset pile</button>

              <button
                onClick={() => {
                  const ok = window.confirm(
                    "Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen."
                  );
                  if (ok) onBackFromContract?.();
                }}
              >
                ← Terug
              </button>

              <div style={{ marginLeft: "auto" }}>
                Mode: <b>{appState.gameMode ?? "-"}</b> • Contract:{" "}
                <b>{contractId ?? "-"}</b> • Chooser: <b>{chooserName}</b> • Leader:{" "}
                <b>{leaderName}</b> • Current: <b>{currentName}</b> • TurnZone:{" "}
                <b>{turnZone ?? "-"}</b>
              </div>
            </div>
          </div>

          {/* zones */}
          <ZoneGrid
            zones={zonesForGrid}
            zoneNumbers={DISPLAY_ZONES}
            turnZone={turnZoneForGrid}
            cardNames={cardNamesForGrid}
            onZoneClick={handleGridClick}
          />

          {/* scores */}
          <Scoreboard
            players={players}
            scores={gameState?.scores ?? []}
            currentPlayerIndex={currentIndex ?? 0}
          />

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            <b>Played cards:</b>{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {(d?.usedCardCodes ?? appState.usedCardCodes ?? [])
                .slice(-20)
                .join(" • ") || "-"}
            </span>
          </div>

          {/* debug */}
          {showDebug && (
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Debug log</h3>
              <DebugLog lines={appState.log} />
            </div>
          )}
        </>
      )}
    </div>
  );
}