// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
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

  onOpenDobbelkingen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,
}) {
  // Dobbelkingen slice (single source)
  const d = appState?.game?.dobbelkingen ?? null;

  // screens
  const showModesHome = appState?.phase === "HOME";
  const showLobby = appState?.phase === "DOBBELKINGEN_READY" || appState?.phase === "CHOOSING_CONTRACT";
  const showGameUi = appState?.phase === "PLAYING_TRICK";

  // mat layout
  const DISPLAY_ZONES = useMemo(() => [1, 2, 4, 3], []);
  const zonesForGrid = DISPLAY_ZONES.map((z) => zones?.[z - 1] ?? null);
  const cardNamesForGrid = DISPLAY_ZONES.map((z) => cardNames?.[z - 1] ?? null);

  // expectedZone (real zone 1..4) -> grid pos 1..4
  const turnZoneForGrid = (() => {
    const real = gameState?.expectedZone ?? null;
    const idx = DISPLAY_ZONES.indexOf(real);
    return idx >= 0 ? idx + 1 : null;
  })();

  function handleGridClick(gridPos) {
    const realZone = DISPLAY_ZONES[gridPos - 1];
    if (!realZone) return;
    onZoneClick?.(realZone);
  }

  // ✅ last scanned glow (300ms) op de zone waar net bevestigd werd
  const [glowZoneGridPos, setGlowZoneGridPos] = useState(null);

  useEffect(() => {
    const ct = d?.confirmedTurnCard ?? null;
    if (!ct?.zone) return;

    const realZone = ct.zone; // 1..4
    const idx = DISPLAY_ZONES.indexOf(realZone);
    const gridPos = idx >= 0 ? idx + 1 : null;
    if (!gridPos) return;

    setGlowZoneGridPos(gridPos);
    const t = window.setTimeout(() => setGlowZoneGridPos(null), 320);
    return () => window.clearTimeout(t);
  }, [d?.confirmedTurnCard?.uid, d?.confirmedTurnCard?.zone, DISPLAY_ZONES]);

  const uiContract = d?.contract ?? appState?.contract ?? "-";
  const uiCurrentIndex = d?.currentPlayerIndex ?? appState?.currentPlayerIndex ?? 0;
  const uiCurrentName = appState?.players?.[uiCurrentIndex]?.name ?? "-";

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* HOME */}
      {showModesHome && <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />}

      {/* LOBBY */}
      {showLobby && appState?.activeMode === "DOBBELKINGEN" && (
        <DobbelkingenPanel
          appState={appState}
          onClose={onCloseMode}
          onStart={onStartDobbelkingen}
          onChooseContract={onChooseDobbelkingenContract}
        />
      )}

      {/* IN-GAME */}
      {showGameUi && (
        <>
          {appState?.lastError && (
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
                onClick={() => {}}
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

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={onConfirmTurn} disabled={!gameState?.canConfirm || appState?.autoConfirm}>
                Confirm turn (manual)
              </button>

              <button onClick={onUndo}>Undo last play</button>
              <button onClick={onResetPile}>Reset pile</button>

              <button
                onClick={() => {
                  const ok = window.confirm("Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen.");
                  if (ok) onBackFromContract?.();
                }}
              >
                ← Terug
              </button>

              <div style={{ marginLeft: "auto" }}>
                Mode: <b>{appState?.gameMode ?? "-"}</b> • Contract: <b>{uiContract}</b> • TurnZone:{" "}
                <b>{turnZone ?? "-"}</b> • Current Player: <b>{uiCurrentName}</b>
              </div>
            </div>
          </div>

          <ZoneGrid
            zones={zonesForGrid}
            zoneNumbers={DISPLAY_ZONES}
            turnZone={turnZoneForGrid}
            glowZone={glowZoneGridPos}
            cardNames={cardNamesForGrid}
            onZoneClick={handleGridClick}
          />

          <Scoreboard
            players={appState?.players ?? []}
            scores={gameState?.scores ?? []}
            currentPlayerIndex={uiCurrentIndex}
          />

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            <b>Played cards:</b>{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {(d?.usedCardCodes ?? appState?.usedCardCodes ?? []).slice(-20).join(" • ") || "-"}
            </span>
          </div>

          {showDebug && (
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Debug log</h3>
              <DebugLog lines={appState?.log ?? []} />
            </div>
          )}
        </>
      )}
    </div>
  );
}