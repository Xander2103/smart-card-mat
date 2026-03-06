// src/ui/ZoneGrid.jsx
function getSuitColor(card) {
  const c = String(card ?? "").toUpperCase();
  if (c.endsWith("H") || c.endsWith("D")) return "#c62828";
  if (c.endsWith("S") || c.endsWith("C")) return "#111827";
  return "#111827";
}

function zoneCardStyle({ isTurn, isGlow, isTrump }) {
  return {
    border: isTurn
      ? "2px solid #ff4d4f"
      : isTrump
        ? "2px solid #f59e0b"
        : "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    background: isTrump ? "#fffbeb" : "white",
    cursor: "pointer",
    minHeight: 120,
    display: "grid",
    alignContent: "center",
    gap: 6,
    position: "relative",
    transition: "all 0.18s ease",

    animation: isTurn
      ? "scmTurnPulse 900ms ease-in-out infinite"
      : isGlow
        ? "scmGlow 320ms ease-out"
        : "none",

    outline: isGlow ? "3px solid rgba(255, 196, 0, 0.9)" : "none",
    boxShadow: isGlow
      ? "0 0 0 6px rgba(255, 196, 0, 0.22)"
      : isTrump
        ? "0 8px 20px rgba(245, 158, 11, 0.12)"
        : "none",
  };
}

export function ZoneGrid({
  zones = [],
  zoneNumbers = [1, 2, 3, 4],
  turnZone = null, // grid pos 1..4
  glowZone = null, // grid pos 1..4
  cardNames = [],
  trumpSuit = null,
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

        @keyframes scmTrumpPulse {
          0%   { box-shadow: 0 0 0 0 rgba(245, 158, 11, .22); }
          70%  { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {[0, 1, 2, 3].map((i) => {
          const gridPos = i + 1;
          const labelZone = zoneNumbers?.[i] ?? gridPos;

          const uid = zones?.[i] ?? null;
          const card = cardNames?.[i] ?? null;

          const isTurn = turnZone === gridPos;
          const isGlow = glowZone === gridPos;
          const isTrump =
            !!card &&
            !!trumpSuit &&
            String(card).toUpperCase().endsWith(String(trumpSuit).toUpperCase());

          return (
            <div
              key={gridPos}
              onClick={() => onZoneClick?.(gridPos)}
              style={{
                ...zoneCardStyle({ isTurn, isGlow, isTrump }),
                animation:
                  isTurn
                    ? "scmTurnPulse 900ms ease-in-out infinite"
                    : isGlow
                      ? "scmGlow 320ms ease-out"
                      : isTrump
                        ? "scmTrumpPulse 1.2s ease-out infinite"
                        : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 900 }}>Zone {labelZone}</div>

                {isTrump ? (
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#b45309",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: 999,
                      padding: "4px 8px",
                    }}
                  >
                    Troef
                  </div>
                ) : isTurn ? (
                  <div style={{ marginLeft: "auto" }}>🎯 Turn</div>
                ) : null}
              </div>

              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{ opacity: 0.6 }}>UID: {uid ?? "-"}</div>
                <div>
                  <b>Card:</b>{" "}
                  <span style={{ color: getSuitColor(card), fontWeight: 900 }}>
                    {card ?? "(empty)"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}