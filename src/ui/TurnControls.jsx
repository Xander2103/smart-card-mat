// src/ui/TurnControls.jsx
export function TurnControls({
  zonesCount = 4,
  turnZone = null,
  currentPlayerIndex = 0,
  onStartTurn,
  onNextTurn,
  onSetTurnZone,
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={onStartTurn} disabled={!!turnZone}>
        Start turn
      </button>

      <button onClick={() => onNextTurn?.(true)}>Next turn</button>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ opacity: 0.7 }}>Set turn:</span>
        {Array.from({ length: zonesCount }, (_, i) => i + 1).map((z) => (
          <button
            key={z}
            onClick={() => onSetTurnZone?.(z)}
            style={turnZone === z ? { fontWeight: 700 } : undefined}
          >
            Z{z}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", opacity: 0.8 }}>
        TurnZone: {turnZone ?? "-"} • Player: {currentPlayerIndex}
      </div>
    </div>
  );
}