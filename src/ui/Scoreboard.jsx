// src/ui/Scoreboard.jsx
import { useMemo, useState } from "react";

function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        border: "1px solid #eee",
        background: "white",
        borderRadius: 10,
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
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
        border: "1px solid #ddd",
        background: "white",
        borderRadius: 10,
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: 900,
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

  const rows = useMemo(() => {
    return players.map((p, i) => ({
      key: p.id ?? i,
      name: p?.name ?? `Player ${i + 1}`,
      score: scores?.[i] ?? 0,
      isCurrent: i === currentPlayerIndex,
      isFlash: typeof flashWinnerIndex === "number" && i === flashWinnerIndex,
    }));
  }, [players, scores, currentPlayerIndex, flashWinnerIndex]);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>Tussenstand</div>

        {allowEdit && (
          <div style={{ position: "absolute", right: 0 }}>
            <IconButton
              title={isEditing ? "Stop aanpassen" : "Scores aanpassen"}
              onClick={() => setIsEditing((v) => !v)}
            >
              {isEditing ? "✅" : "⚙️"}
            </IconButton>
          </div>
        )}
      </div>

      {/* rows */}
      <div style={{ display: "grid", rowGap: 10 }}>
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #eee",
              background: r.isFlash ? "#f6ffed" : r.isCurrent ? "#fafafa" : "white",
            }}
          >
            {/* ✅ NAAM LINKS */}
            <div style={{ fontWeight: 900, textAlign: "left" }}>{r.name}</div>

            {/* score + inline edit buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

              <div style={{ fontWeight: 900, minWidth: 36, textAlign: "right" }}>
                {r.score}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, textAlign: "center" }}>
        Scores zijn totaal (opgeteld over alle gespeelde contracten).
      </div>
    </div>
  );
}