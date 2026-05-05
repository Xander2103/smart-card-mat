import { useState } from "react";
import { colors, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { formatRoundDelta } from "./helpers";

function ScoreAdjustButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        border: "1px solid rgba(251, 191, 36, 0.28)",
        background: "rgba(251, 191, 36, 0.10)",
        color: "#fef3c7",
        fontWeight: 1000,
        fontSize: 18,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

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
  allowEdit = false,
  onAdjustScore,
}) {
  const { isMobile } = useViewport();
  const [isEditing, setIsEditing] = useState(false);
  const [draftScores, setDraftScores] = useState(totalScores ?? []);

  function startEditing() {
    setDraftScores([...(totalScores ?? [])]);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftScores([...(totalScores ?? [])]);
    setIsEditing(false);
  }

  function updateDraftScore(playerIndex, delta) {
    setDraftScores((prev) => {
      const next = [...(prev ?? [])];
      next[playerIndex] = (next[playerIndex] ?? 0) + delta;
      return next;
    });
  }

  function saveScores() {
    draftScores.forEach((score, index) => {
      const oldScore = totalScores?.[index] ?? 0;
      const delta = (score ?? 0) - oldScore;

      if (delta !== 0) {
        onAdjustScore?.(index, delta);
      }
    });

    setIsEditing(false);
  }

  return (
    <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            Rondestatus
          </div>
          <div style={{ color: colors.muted, fontSize: 13 }}>
            Per speler: deze ronde, voortgang en totaalscore.
          </div>
        </div>

        {allowEdit ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {!isEditing ? (
              <button
                type="button"
                onClick={startEditing}
                style={{
                  padding: "7px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(251, 191, 36, 0.26)",
                  background: "rgba(255,255,255,0.045)",
                  color: "#fef3c7",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ✎ Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.045)",
                    color: "#f5efe6",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Annuleer
                </button>

                <button
                  type="button"
                  onClick={saveScores}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(134, 239, 172, 0.34)",
                    background: "rgba(22, 163, 74, 0.36)",
                    color: "#dcfce7",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Opslaan
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player, index) => {
          const isCurrent = index === currentIndex;
          const isDealer = index === dealerIndex;
          const score = isEditing ? draftScores?.[index] ?? 0 : totalScores?.[index] ?? 0;

          return (
            <div
              key={player.id ?? index}
              style={softCardStyle({
                padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: isEditing ? "1fr auto auto" : "1fr auto 1fr",
                alignItems: "center",
                gap: 16,
                minHeight: isEditing ? 82 : 72,
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

              {!isEditing ? (
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
              ) : (
                <div style={{ display: "flex", gap: 8, justifySelf: "center" }}>
                  <ScoreAdjustButton onClick={() => updateDraftScore(index, -1)}>-</ScoreAdjustButton>
                  <ScoreAdjustButton onClick={() => updateDraftScore(index, 1)}>+</ScoreAdjustButton>
                </div>
              )}

              <div
                style={{
                  justifySelf: "end",
                  alignSelf: "center",
                  fontWeight: 900,
                  fontSize: 22,
                  minWidth: 48,
                  textAlign: "right",
                  color: score > 0 ? "#86efac" : score < 0 ? "#fca5a5" : "#f5efe6",
                }}
              >
                {score > 0 ? `+${score}` : score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}