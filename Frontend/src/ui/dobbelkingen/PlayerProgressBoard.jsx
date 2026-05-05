import { colors, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { formatRoundDelta } from "./helpers";

function DealerBadge() {
  return (
    <>
      <style>
        {`
          @keyframes dobbelDealerPulse {
            0%, 100% {
              box-shadow: 0 6px 14px rgba(0,0,0,0.22), 0 0 0 rgba(251, 191, 36, 0);
            }

            50% {
              box-shadow: 0 6px 14px rgba(0,0,0,0.22), 0 0 13px rgba(251, 191, 36, 0.55);
            }
          }
        `}
      </style>

      <span
        title="Dealer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          width: "fit-content",
          padding: "5px 9px",
          borderRadius: 999,
          background: "linear-gradient(180deg, rgba(120,53,15,0.95), rgba(69,35,17,0.96))",
          border: "1px solid rgba(251, 191, 36, 0.55)",
          color: "#fef3c7",
          fontSize: 11,
          fontWeight: 1000,
          textTransform: "uppercase",
          letterSpacing: 0.3,
          animation: "dobbelDealerPulse 1.7s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: 10 }}>●</span>
        Dealer
      </span>
    </>
  );
}

export function PlayerProgressBoard({
  players,
  currentIndex,
  dealerIndex = null,
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
          const isDealer = index === dealerIndex;

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
                  : isDealer
                    ? "rgba(120, 53, 15, 0.18)"
                    : "rgba(255,255,255,0.04)",
                border: isCurrent
                  ? "1px solid rgba(251,191,36,0.28)"
                  : isDealer
                    ? "1px solid rgba(251,191,36,0.22)"
                    : "1px solid rgba(255,255,255,0.08)",
              })}
            >
              <div
                style={{
                  justifySelf: "start",
                  alignSelf: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {player.name ?? `Player ${index + 1}`}
                </span>

                {isDealer ? <DealerBadge /> : null}
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