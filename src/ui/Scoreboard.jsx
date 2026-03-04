// src/ui/Scoreboard.jsx
export function Scoreboard({
  players = [],
  scores = [],
  currentPlayerIndex = 0,
  flashWinnerIndex = null, // ✅ nieuw
}) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Scores</div>

      <div style={{ display: "grid", rowGap: 8 }}>
        {players.map((p, i) => {
          const isCurrent = i === currentPlayerIndex;
          const isFlash = flashWinnerIndex === i;
          const score = scores?.[i] ?? 0;

          return (
            <div
              key={p.id ?? i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                border: "1px solid #f0f0f0",
                borderRadius: 12,
                background: isFlash ? "#e6fffb" : isCurrent ? "#f6faff" : "white",
                transition: "background 200ms ease",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <div style={{ width: 26, opacity: 0.6 }}>P{i + 1}</div>
                <div style={{ fontWeight: 800 }}>{p.name ?? `Player ${i + 1}`}</div>
                {isCurrent ? <div style={{ fontSize: 12, opacity: 0.55 }}>(current)</div> : null}
                {isFlash ? <div style={{ fontSize: 12, fontWeight: 900 }}>🏆</div> : null}
              </div>

              <div style={{ fontWeight: 900 }}>{score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}