// src/ui/Scoreboard.jsx
export function Scoreboard({
  players = [],
  scores = [],
  currentPlayerIndex = 0,
}) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Scores</div>

      <div style={{ display: "grid", rowGap: 8 }}>
        {players.map((p, i) => {
          const isCurrent = i === currentPlayerIndex;
          const score = scores?.[i] ?? 0;

          return (
            <div
              key={p.id ?? i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 10,
                background: isCurrent ? "#f6f8ff" : "transparent",
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <div style={{ opacity: 0.7, width: 28 }}>P{i + 1}</div>
                <div style={{ fontWeight: 700 }}>{p.name ?? `Player ${i + 1}`}</div>
                {isCurrent && <div style={{ opacity: 0.6 }}>(current)</div>}
              </div>

              <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>
                {score}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        raw: {JSON.stringify(scores)}
      </div>
    </div>
  );
}