// src/ui/Scoreboard.jsx
import { useMemo, useState } from "react";
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";

function IconButton({ title, onClick, children }) {
  return (
    <button title={title} onClick={onClick} style={{ ...buttonStyle(), padding: "8px 10px", lineHeight: 1 }}>
      {children}
    </button>
  );
}

function SmallBtn({ children, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        ...buttonStyle(),
        padding: "6px 10px",
        fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}

export function Scoreboard({
  players = [],
  scores = [],
  currentPlayerIndex = 0,
  flashWinnerIndex = null,
  onAdjustScore,
  allowEdit = true,
  showPlusMinusFive = false,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const rows = useMemo(
    () =>
      players.map((p, i) => ({
        key: p.id ?? i,
        name: p?.name ?? `Player ${i + 1}`,
        score: scores?.[i] ?? 0,
        isCurrent: i === currentPlayerIndex,
        isFlash: typeof flashWinnerIndex === "number" && i === flashWinnerIndex,
      })),
    [players, scores, currentPlayerIndex, flashWinnerIndex]
  );

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
      <style>{`
        @keyframes winnerFlashRow {
          0%   { transform: scale(1); background: rgba(255, 255, 255, 0.04); }
          20%  { transform: scale(1.01); background: rgba(74, 222, 128, 0.18); }
          100% { transform: scale(1); background: rgba(74, 222, 128, 0.12); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Tussenstand</div>
          <div style={{ fontSize: 13, color: colors.muted }}>Totaal of contractscore afhankelijk van de huidige fase.</div>
        </div>

        {allowEdit && (
          <IconButton
            title={isEditing ? "Stop aanpassen" : "Scores aanpassen"}
            onClick={() => setIsEditing((v) => !v)}
          >
            {isEditing ? "✅" : "⚙️"}
          </IconButton>
        )}
      </div>

      <div style={{ display: "grid", rowGap: 10 }}>
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{
              ...softCardStyle({
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                alignItems: "center",
                padding: "12px 14px",
                background: r.isFlash
                  ? colors.greenSoft
                  : r.isCurrent
                    ? "rgba(251, 191, 36, 0.10)"
                    : "rgba(255,255,255,0.04)",
                border: r.isFlash
                  ? "1px solid rgba(74, 222, 128, 0.42)"
                  : r.isCurrent
                    ? "1px solid rgba(251, 191, 36, 0.34)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                animation: r.isFlash ? "winnerFlashRow 650ms ease-out" : "none",
                boxShadow: r.isFlash ? "0 12px 24px rgba(74, 222, 128, 0.12)" : "none",
              }),
            }}
          >
            <div style={{ display: "grid", gap: 4, textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: colors.muted }}>
                {r.isFlash ? "Wint de laatste slag" : r.isCurrent ? "Aan de beurt" : ""}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {allowEdit && isEditing && (
                <>
                  <SmallBtn title="-1" onClick={() => onAdjustScore?.(i, -1)}>
                    −1
                  </SmallBtn>
                  <SmallBtn title="+1" onClick={() => onAdjustScore?.(i, +1)}>
                    +1
                  </SmallBtn>

                  {showPlusMinusFive && (
                    <>
                      <SmallBtn title="-5" onClick={() => onAdjustScore?.(i, -5)}>
                        −5
                      </SmallBtn>
                      <SmallBtn title="+5" onClick={() => onAdjustScore?.(i, +5)}>
                        +5
                      </SmallBtn>
                    </>
                  )}
                </>
              )}

              <div style={{ fontWeight: 700, minWidth: 42, textAlign: "right", fontSize: 20 }}>
                {r.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
