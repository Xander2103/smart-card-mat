import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";


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
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={onConfirmTurn} disabled={!gameState.canConfirm || appState.autoConfirm}>
            Confirm turn (manual)
          </button>

          <button onClick={onUndo}>Undo last play</button>
          <button onClick={onResetPile}>Reset pile</button>

          <div style={{ marginLeft: "auto" }}>
            TurnZone: <b>{turnZone ?? "-"}</b> • Current Player:{" "}
            <b>{appState.players?.[appState.currentPlayerIndex]?.name ?? "-"}</b>
          </div>
        </div>
      </div>

      <ZoneGrid zones={zones} turnZone={turnZone} cardNames={cardNames} onZoneClick={onZoneClick} />

      <Scoreboard
        players={appState.players}
        scores={gameState.scores}
        currentPlayerIndex={appState.currentPlayerIndex}
      />

      {showDebug && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Debug log</h3>
          <DebugLog lines={appState.log} />
        </div>
      )}
    </div>
  );
}