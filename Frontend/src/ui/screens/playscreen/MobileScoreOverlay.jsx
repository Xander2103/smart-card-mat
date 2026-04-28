import { buttonStyle, colors, softCardStyle } from "../../play/theme";

export function MobileScoreOverlay({
  showMobileScore,
  setShowMobileScore,
  isMobileLandscape,
  players,
  currentIndex,
  contractId,
  scoreboardScores,
  trickWins,
}) {
  if (!showMobileScore) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "rgba(8,6,5,0.96)",
        backdropFilter: "blur(10px)",
        padding: isMobileLandscape ? 8 : 8,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ fontWeight: 900, fontSize: isMobileLandscape ? 18 : 20 }}>Tussenstand</div>
        <button
          onClick={() => setShowMobileScore(false)}
          style={{
            ...buttonStyle(),
            padding: isMobileLandscape ? "7px 10px" : "8px 12px",
            fontSize: isMobileLandscape ? 12 : 13,
          }}
        >
          Sluiten
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: isMobileLandscape ? 8 : 8,
          gridTemplateRows:
            contractId === "TROEF"
              ? "repeat(4, minmax(0, 1fr)) auto"
              : "repeat(4, minmax(0, 1fr))",
          minHeight: 0,
        }}
      >
        {players.map((player, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={player.id ?? index}
              style={softCardStyle({
                padding: isMobileLandscape ? "7px 10px" : "8px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: isCurrent ? "rgba(251,191,36,0.10)" : "rgba(255,255,255,0.04)",
                border: isCurrent ? "1px solid rgba(251,191,36,0.28)" : "1px solid rgba(255,255,255,0.08)",
              })}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: isMobileLandscape ? 17 : 17 }}>
                  {player.name ?? `Player ${index + 1}`}
                </div>
                {isCurrent ? (
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Aan de beurt</div>
                ) : null}
              </div>
              <div style={{ fontWeight: 900, fontSize: isMobileLandscape ? 22 : 22 }}>
                {scoreboardScores[index] ?? 0}
              </div>
            </div>
          );
        })}

        {contractId === "TROEF" ? (
          <div
            style={softCardStyle({
              padding: isMobileLandscape ? "7px 10px" : "8px 10px",
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 6,
            })}
          >
            {players.map((player, index) => (
              <div key={`trick-${player.id ?? index}`} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: colors.muted }}>{player.name ?? `P${index + 1}`}</div>
                <div style={{ marginTop: 2, fontWeight: 900, fontSize: isMobileLandscape ? 16 : 18 }}>
                  {trickWins[index] ?? 0}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
