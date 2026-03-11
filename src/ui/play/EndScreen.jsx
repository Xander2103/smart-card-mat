import { buttonStyle, colors, panelStyle, softCardStyle } from "./theme";

function getPlayerName(summary, playerIndex) {
  return (
    summary?.players?.find((player) => player.playerIndex === playerIndex)?.name ??
    summary?.ranking?.find((row) => row.playerIndex === playerIndex)?.name ??
    `Player ${playerIndex + 1}`
  );
}

export function EndScreen({ summary, onNewGame, onBackHome }) {
  const ranking = summary?.ranking ?? [];
  const finalScores = summary?.finalScores ?? [];
  const winnerName = summary?.winnerName ?? "Onbekend";

  return (
    <div
      style={panelStyle({
        padding: 22,
        display: "grid",
        gap: 18,
      })}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900 }}>Dobbelkingen klaar</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 18,
            fontWeight: 800,
            color: colors.accent,
          }}
        >
          🏆 Winnaar: {winnerName}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Eindranking</div>

          {ranking.map((row) => (
            <div
              key={row.playerIndex}
              style={softCardStyle({
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background:
                  row.place === 1 ? colors.accentSoft : "rgba(255,255,255,0.04)",
              })}
            >
              <div>
                <b>#{row.place}</b> {row.name}
              </div>
              <div style={{ fontWeight: 900 }}>{row.score}</div>
            </div>
          ))}
        </div>

        <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Totaalscores</div>

          {finalScores.map((score, index) => (
            <div
              key={index}
              style={softCardStyle({
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.04)",
              })}
            >
              <div>{getPlayerName(summary, index)}</div>
              <div style={{ fontWeight: 900 }}>{score}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={onNewGame} style={buttonStyle("primary")}>
          Nieuw spel
        </button>
        <button onClick={onBackHome} style={buttonStyle()}>
          Terug naar home
        </button>
      </div>
    </div>
  );
}