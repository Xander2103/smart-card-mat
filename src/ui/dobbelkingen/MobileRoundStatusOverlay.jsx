import { buttonStyle, colors, softCardStyle } from "../play/theme";
import { formatRoundDelta } from "./helpers";

export function MobileRoundStatusOverlay({
  open,
  title = "Score",
  players,
  currentIndex,
  totalScores,
  roundDeltas,
  progressCounts,
  progressLabel,
  trickCounts,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(8, 6, 5, 0.92)",
        backdropFilter: "blur(10px)",
        padding: 12,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{title}</div>
          <div style={{ color: colors.muted, fontSize: 12 }}>
            Per speler: deze ronde, voortgang en totaalscore.
          </div>
        </div>
        <button onClick={onClose} style={{ ...buttonStyle(), minHeight: 40, padding: "8px 12px" }}>
          Sluiten
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateRows: "repeat(4, minmax(0, 1fr))", gap: 8, minHeight: 0 }}>
        {players.map((player, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={player.id ?? index}
              style={softCardStyle({
                padding: "10px 12px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.5fr) auto",
                alignItems: "center",
                gap: 10,
                minHeight: 0,
                background: isCurrent ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.04)",
                border: isCurrent ? "1px solid rgba(251,191,36,0.22)" : "1px solid rgba(255,255,255,0.08)",
              })}
            >
              <div style={{ fontWeight: 900, fontSize: 16, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                {player.name ?? `Player ${index + 1}`}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#e5d7c7",
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                <span>{formatRoundDelta(roundDeltas[index] ?? 0)} deze ronde</span>
                <span>·</span>
                <span>{progressCounts[index] ?? 0}/2 {progressLabel}</span>
                <span>·</span>
                <span>{trickCounts[index] ?? 0} slagen</span>
              </div>

              <div style={{ fontWeight: 900, fontSize: 22, minWidth: 22, textAlign: "right" }}>
                {totalScores[index] ?? 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
