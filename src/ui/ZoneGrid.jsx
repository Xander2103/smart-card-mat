// src/ui/ZoneGrid.jsx
export function ZoneGrid({
  zones = [],
  turnZone = null,      // dit is "grid positie" 1..4 (TL,TR,BL,BR)
  cardNames = [],
  onZoneClick,
  zoneNumbers = [],     // ✅ nieuw: echte zone nummers per grid tile, bv [1,2,4,3]
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
    >
      {zones.map((uid, i) => {
        const gridPos = i + 1;                         // 1..4 (positie in grid)
        const labelZone = zoneNumbers?.[i] ?? gridPos; // wat je toont als "Zone X"
        const isTurn = turnZone === gridPos;

        const isUnmapped = uid && !cardNames?.[i];
        const cardName = uid ? (cardNames?.[i] ?? "⚠️ UNMAPPED") : "(empty)";

        return (
          <div
            key={gridPos}
            onClick={() => onZoneClick?.(gridPos)} // ✅ blijft gridPos (PlayScreen mapped naar echte zone)
            style={{
              border: "2px solid #ddd",
              borderRadius: 12,
              padding: 12,
              background: isTurn ? "#f3f3f3" : isUnmapped ? "#fff3cd" : "white",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Zone {labelZone}</strong>
              {isTurn ? <span>🎯 Turn</span> : null}
            </div>

            <div style={{ marginTop: 8 }}>
              <div>UID: {uid ?? "-"}</div>
              <div>
                <b>Card:</b> {cardName}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}