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

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            dbg: phase={appState.phase} • CPI={appState.currentPlayerIndex} • expected={gameState.expectedZone} •
            uid={String(appState.zones?.[gameState.expectedZone - 1] ?? "-")} •
            code={String((appState.mapping?.[appState.zones?.[gameState.expectedZone - 1] ?? ""] ?? "-"))} •
            trickLen={(appState.currentTrick ?? []).length} •
            alreadyPlayed={String((appState.currentTrick ?? []).some(p => p.playerIndex === appState.currentPlayerIndex))}
            autoConfirm={String(appState.autoConfirm)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            trick={JSON.stringify(appState.currentTrick)}
          </div>

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