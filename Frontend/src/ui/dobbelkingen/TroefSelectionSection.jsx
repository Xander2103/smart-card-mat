import { buttonStyle, colors, softCardStyle } from "../play/theme";
import { TROEF_OPTIONS } from "./helpers";
import { PlayerProgressBoard } from "./PlayerProgressBoard";

export function TroefSelectionSection({
  isMobile,
  isMobileLandscape,
  width,
  mobileScale,
  compact,
  chooserName,
  dealerIndex,
  leaderName,
  hoveredTroef,
  setHoveredTroef,
  dispatchAction,
  players,
  currentIndex,
  totalScores,
  roundDeltas,
  troefPickCounts,
  currentRoundTrickCounts,
  handleFinishMatch,
  setShowMobileScore,
  onAdjustScore,
}) {
  return (
    <div style={{ display: "grid", gridTemplateRows: isMobile ? "auto 1fr auto" : undefined, gap: isMobile ? 12 : 16, minHeight: 0 }}>
      <div
        style={softCardStyle({
          padding: 14,
          display: "grid",
          gap: 2,
          background: "rgba(74,222,128,0.08)",
        })}
      >
        <div
          style={softCardStyle({
            padding: isMobile ? 12 : 14,
            display: "grid",
            gap: 4,
            background: "rgba(74,222,128,0.08)",
            justifyItems: "center",
            textAlign: "center",
          })}
        >
          <div style={{ fontWeight: 700, fontSize: isMobile ? Math.round(14 * mobileScale) : 20 }}>
            {chooserName} kiest troef
          </div>
          <div style={{ color: colors.muted, fontSize: isMobile ? Math.round(11 * mobileScale) : 14 }}>
            {leaderName} komt uit in de eerste slag.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? (isMobileLandscape ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))")
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gridAutoRows: isMobile ? "1fr" : undefined,
          gap: isMobile ? 10 : 12,
          alignContent: isMobile ? "stretch" : undefined,
          alignItems: "stretch",
          minHeight: 0,
          width: "100%",
          maxWidth: isMobile && width >= 700 ? 920 : undefined,
          margin: isMobile && width >= 700 ? "0 auto" : undefined,
        }}
      >
        {TROEF_OPTIONS.map((opt) => {
          const hovered = hoveredTroef === opt.suit;

          return (
            <button
              key={opt.suit}
              onMouseEnter={() => setHoveredTroef(opt.suit)}
              onMouseLeave={() => setHoveredTroef(null)}
              onClick={() => dispatchAction?.({ type: "choose_troef_suit", suit: opt.suit })}
              style={{
                ...softCardStyle({
                  padding: isMobile ? Math.round(18 * mobileScale) : 18,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  gap: compact ? 4 : 8,
                  minHeight: isMobile ? Math.round((isMobileLandscape ? 112 : width >= 700 ? 182 : 126) * mobileScale) : undefined,
                  transform: hovered ? "translateY(-2px)" : "none",
                  transition: "all 0.16s ease",
                  background: hovered
                    ? "rgba(96, 165, 250, 0.10)"
                    : "rgba(255,255,255,0.04)",
                  border: hovered
                    ? "1px solid rgba(96, 165, 250, 0.28)"
                    : "1px solid rgba(255,255,255,0.08)",
                }),
              }}
            >
              <div style={{ fontWeight: 800, fontSize: isMobile ? Math.round((isMobileLandscape ? 18 : 22) * mobileScale) : 22, color: opt.color, lineHeight: 1.1, textAlign: "center" }}>
                {opt.symbol} {opt.label}
              </div>
            </button>
          );
        })}
      </div>

      {!isMobile ? (
        <PlayerProgressBoard
          players={players}
          currentIndex={currentIndex}
          dealerIndex={dealerIndex}
          totalScores={totalScores}
          roundDeltas={roundDeltas}
          progressCounts={troefPickCounts}
          progressLabel="troef gekozen"
          trickCounts={currentRoundTrickCounts}
          allowEdit
          onAdjustScore={onAdjustScore}
        />
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "auto", gap: 10, width: isMobile ? "100%" : undefined }}>
        <button onClick={handleFinishMatch} style={{ ...buttonStyle("success"), width: "100%", minHeight: isMobile ? 48 : undefined }}>
          Match afronden
        </button>
        {isMobile ? (
          <button onClick={() => setShowMobileScore(true)} style={{ ...buttonStyle(), width: "100%", minHeight: 48 }}>
            Score
          </button>
        ) : null}
      </div>
    </div>
  );
}
