import { colors, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { formatRoundDelta } from "./helpers";

export function PlayerProgressBoard({
  players,
  currentIndex,
  totalScores,
  roundDeltas,
  progressCounts,
  progressLabel,
  trickCounts,
}) {
  const { isMobile } = useViewport();

  return (
    <div style={softCardStyle({ padding: 16, display: "grid", gap: 7 })}>
      <div style={{ fontWeight: 700, fontSize: 18, textAlign: "center" }}>
        Rondestatus
      </div>
      <div style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
        Per speler: deze ronde, voortgang en totaalscore.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player, index) => {
          const isCurrent = index === currentIndex;

          return (
            <div
              key={player.id ?? index}
              style={softCardStyle({
                padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 16,
                minHeight: 72,
                background: isCurrent
                  ? "rgba(251,191,36,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: isCurrent
                  ? "1px solid rgba(251,191,36,0.22)"
                  : "1px solid rgba(255,255,255,0.08)",
              })}
            >
              <div
                style={{
                  justifySelf: "start",
                  alignSelf: "center",
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {player.name ?? `Player ${index + 1}`}
              </div>

              <div
                style={{
                  justifySelf: "center",
                  alignSelf: "center",
                  fontSize: 14,
                  color: "#e5d7c7",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? 8 : 14,
                  flexWrap: "wrap",
                  textAlign: "center",
                }}
              >
                <span>{formatRoundDelta(roundDeltas[index] ?? 0)} deze ronde</span>
                <span>·</span>
                <span>
                  {progressCounts[index] ?? 0}/2 {progressLabel}
                </span>
                <span>·</span>
                <span>{trickCounts[index] ?? 0} slagen</span>
              </div>

              <div
                style={{
                  justifySelf: "end",
                  alignSelf: "center",
                  fontWeight: 900,
                  fontSize: 22,
                  minWidth: 32,
                  textAlign: "right",
                }}
              >
                {totalScores[index] ?? 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
