// src/ui/ZoneGrid.jsx
function zoneCardStyle({ isTurn, isGlow }) {
  return {
    border: isTurn ? "2px solid #ff4d4f" : "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    background: "white",
    cursor: "pointer",
    minHeight: 120,
    display: "grid",
    alignContent: "center",
    gap: 6,
    position: "relative",

    // ✅ subtle pulse on expected turn
    animation: isTurn ? "scmTurnPulse 900ms ease-in-out infinite" : isGlow ? "scmGlow 300ms ease-out" : "none",

    // ✅ 300ms “last scanned” glow
    outline: isGlow ? "3px solid rgba(255, 196, 0, 0.9)" : "none",
    boxShadow: isGlow ? "0 0 0 6px rgba(255, 196, 0, 0.22)" : "none",
  };
}

export function ZoneGrid({
  zones = [],
  zoneNumbers = [1, 2, 3, 4],
  turnZone = null,     // grid pos 1..4
  glowZone = null,     // grid pos 1..4
  cardNames = [],
  onZoneClick,
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <style>{`
        @keyframes scmGlow {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes scmTurnPulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,77,79,.18); }
          70%  { box-shadow: 0 0 0 14px rgba(255,77,79,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,77,79,0); }
        }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => {
          const gridPos = i + 1;
          const labelZone = zoneNumbers?.[i] ?? gridPos;

          const uid = zones?.[i] ?? null;
          const card = cardNames?.[i] ?? null;

          const isTurn = turnZone === gridPos;
          const isGlow = glowZone === gridPos;

          return (
            <div
              key={gridPos}
              onClick={() => onZoneClick?.(gridPos)}
              style={zoneCardStyle({ isTurn, isGlow })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 900 }}>Zone {labelZone}</div>
                {isTurn ? <div style={{ marginLeft: "auto" }}>🎯 Turn</div> : null}
              </div>

              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{ opacity: 0.6 }}>UID: {uid ?? "-"}</div>
                <div>
                  <b>Card:</b> {card ?? "(empty)"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}