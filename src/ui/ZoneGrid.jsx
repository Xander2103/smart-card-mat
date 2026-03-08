// src/ui/ZoneGrid.jsx
import { colors, panelStyle, softCardStyle } from "./play/theme";

function getSuitColor(card) {
  const c = String(card ?? "").toUpperCase();
  if (c.endsWith("H") || c.endsWith("D")) return "#fb7185";
  if (c.endsWith("S") || c.endsWith("C")) return "#e5eefb";
  return colors.text;
}

function zoneCardStyle({ isTurn, isGlow, isTrump }) {
  return {
    ...softCardStyle({
      padding: 16,
      minHeight: 136,
      display: "grid",
      alignContent: "center",
      gap: 8,
      position: "relative",
      cursor: "pointer",
      transition: "all 0.18s ease",
      border: isTurn
        ? "1px solid rgba(251, 113, 133, 0.42)"
        : isTrump
          ? "1px solid rgba(251, 191, 36, 0.34)"
          : "1px solid rgba(255, 255, 255, 0.08)",
      background: isTurn
        ? "rgba(127, 29, 29, 0.42)"
        : isTrump
          ? "rgba(120, 53, 15, 0.34)"
          : "rgba(255,255,255,0.04)",
      boxShadow: isGlow
        ? "0 0 0 6px rgba(251, 191, 36, 0.18)"
        : isTrump
          ? "0 14px 28px rgba(245, 158, 11, 0.14)"
          : "0 12px 24px rgba(2, 6, 23, 0.18)",
    }),
    animation: isTurn
      ? "scmTurnPulse 950ms ease-in-out infinite"
      : isGlow
        ? "scmGlow 320ms ease-out"
        : isTrump
          ? "scmTrumpPulse 1.4s ease-out infinite"
          : "none",
  };
}

export function ZoneGrid({
  zones = [],
  zoneNumbers = [1, 2, 3, 4],
  turnZone = null,
  glowZone = null,
  cardNames = [],
  trumpSuit = null,
  onZoneClick,
}) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
      <style>{`
        @keyframes scmGlow {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        @keyframes scmTurnPulse {
          0%   { box-shadow: 0 0 0 0 rgba(251,113,133,.24); }
          70%  { box-shadow: 0 0 0 16px rgba(251,113,133,0); }
          100% { box-shadow: 0 0 0 0 rgba(251,113,133,0); }
        }

        @keyframes scmTrumpPulse {
          0%   { box-shadow: 0 0 0 0 rgba(245, 158, 11, .22); }
          70%  { box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>

      <div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Speelzones</div>
        <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
          Klik op een zone om de gescande UID te selecteren. Troef en beurt worden live gemarkeerd.
        </div>
      </div>

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
            !!card && !!trumpSuit && String(card).toUpperCase().endsWith(String(trumpSuit).toUpperCase());

          return (
            <button
              key={gridPos}
              onClick={() => onZoneClick?.(gridPos)}
              style={zoneCardStyle({ isTurn, isGlow, isTrump })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Zone {labelZone}</div>

                {isTrump ? (
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#fcd34d",
                      background: "rgba(251, 191, 36, 0.12)",
                      border: "1px solid rgba(251, 191, 36, 0.24)",
                      borderRadius: 999,
                      padding: "4px 8px",
                    }}
                  >
                    Troef
                  </div>
                ) : isTurn ? (
                  <div style={{ marginLeft: "auto", color: "#fecdd3", fontWeight: 800 }}>🎯 Turn</div>
                ) : null}
              </div>

              <div style={{ textAlign: "center", marginTop: 8, display: "grid", gap: 6 }}>
                <div style={{ color: colors.muted, fontSize: 12 }}>UID: {uid ?? "-"}</div>
                <div style={{ fontSize: 14 }}>
                  <b>Card:</b>{" "}
                  <span style={{ color: getSuitColor(card), fontWeight: 900 }}>{card ?? "(empty)"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
