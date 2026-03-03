// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";

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

  // mode flow
  onOpenDobbelkingen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,
}) {
  const showModesHome = appState.phase === "HOME";
  const showLobby =
    appState.phase === "DOBBELKINGEN_READY" ||
    appState.phase === "CHOOSING_CONTRACT";

  const showGameUi = appState.phase === "PLAYING_TRICK";

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* A) HOME: alleen game modes */}
      {showModesHome && (
        <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />
      )}

      {/* B) LOBBY: dobbelkingen panel (start + contract kiezen) */}
      {showLobby && appState.activeMode === "DOBBELKINGEN" && (
        <DobbelkingenPanel
          appState={appState}
          onClose={onCloseMode}
          onStart={onStartDobbelkingen}
          onChooseContract={onChooseDobbelkingenContract}
        />
      )}

      {/* C) IN-GAME UI: pas tonen als spel echt gestart is */}
      {showGameUi && (
        <>
          {/* C) !!ERROR ALS GE KAART AL GEPLAYED HEBT!! */}
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
                onClick={() => onClearError?.()}
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
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
            }}
          >
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
                disabled={!gameState.canConfirm || appState.autoConfirm}
              >
                Confirm turn (manual)
              </button>

              <button onClick={onUndo}>Undo last play</button>
              <button onClick={onResetPile}>Reset pile</button>

              <div style={{ marginLeft: "auto" }}>
                Mode: <b>{appState.gameMode ?? "-"}</b> • Contract:{" "}
                <b>{appState.contract ?? "-"}</b> • TurnZone:{" "}
                <b>{turnZone ?? "-"}</b> • Current Player:{" "}
                <b>
                  {appState.players?.[appState.currentPlayerIndex]?.name ?? "-"}
                </b>
              </div>
            </div>
          </div>

          {/* zones */}
          <ZoneGrid
            zones={zones}
            turnZone={gameState.expectedZone}
            cardNames={cardNames}
            onZoneClick={onZoneClick}
          />

          {/* scores */}
          <Scoreboard
            players={appState.players}
            scores={gameState.scores}
            currentPlayerIndex={appState.currentPlayerIndex}
          />

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            <b>Played cards:</b>{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {(appState.usedCardCodes ?? []).slice(-20).join(" • ") || "-"}
            </span>
          </div>

          {/* debug */}
          {showDebug && (
            <div
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Debug log</h3>
              <DebugLog lines={appState.log} />
            </div>
          )}
        </>
      )}
    </div>
  );
}