import { getContract } from "../../core/games/dobbelkingen/contracts";
import { colors, buttonStyle, softCardStyle } from "../play/theme";
import { ContractCard } from "./ContractCard";
import { PlayerProgressBoard } from "./PlayerProgressBoard";
import { getCompactContractDesc } from "./helpers";

export function ContractSelectionSection({
  isMobile,
  isMobileLandscape,
  width,
  mobileScale,
  mobileContractCardMinHeight,
  chooserName,
  contractList,
  plays,
  hoveredContract,
  setHoveredContract,
  canPick,
  getContractDisabledReason,
  onChooseContract,
  players,
  currentIndex,
  totalScores,
  roundDeltas,
  phase1PickCounts,
  currentRoundTrickCounts,
  handleContinueToPhase2,
}) {
  return (
    <div style={{ display: "grid", gap: isMobile ? 10 : 16, minHeight: 0, alignContent: "start" }}>
      <div
        style={softCardStyle({
          padding: isMobile ? "7px 11px" : "12px 14px",
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.16)",
        })}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "auto 1fr" : "auto 1fr auto",
            alignItems: "center",
            gap: isMobile ? 8 : 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: isMobile ? 7 : 12,
              fontSize: isMobile ? 11 : 22,
              fontWeight: 900,
              color: "rgba(255, 220, 170, 0.72)",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ color: "#fb7185" }}>♥</span>
            <span style={{ color: "#fb7185" }}>♦</span>
            <span style={{ color: "#f5efe6" }}>♣</span>
            <span style={{ color: "#f5efe6" }}>♠</span>
          </div>

          <div
            style={{
              display: "grid",
              gap: 2,
              justifyItems: isMobile ? "start" : "center",
              textAlign: isMobile ? "left" : "center",
              minWidth: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 20, lineHeight: 1.1 }}>
              {chooserName} kiest contract
            </div>
            <div style={{ color: colors.muted, fontSize: isMobile ? Math.round(11 * mobileScale) : 14 }}>
              Volgende speler komt uit.
            </div>
          </div>

          {!isMobile ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                fontSize: 22,
                fontWeight: 900,
                color: "rgba(255, 220, 170, 0.72)",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ color: "#fb7185" }}>♥</span>
              <span style={{ color: "#fb7185" }}>♦</span>
              <span style={{ color: "#f5efe6" }}>♣</span>
              <span style={{ color: "#f5efe6" }}>♠</span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? (isMobileLandscape ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))")
            : "repeat(3, minmax(0, 1fr))",
          gridTemplateRows:
            isMobile && !isMobileLandscape
              ? (width >= 700 ? "repeat(3, minmax(172px, 1fr))" : "repeat(3, minmax(136px, 1fr))")
              : undefined,
          gridAutoRows: isMobile ? "1fr" : undefined,
          gap: isMobile ? (width >= 700 ? 12 : 8) : 14,
          alignContent: "stretch",
        }}
      >
        {contractList.map((id) => {
          const c = getContract(id);
          const label = c?.label ?? id;
          const desc = isMobile ? getCompactContractDesc(label, c?.desc ?? "") : (c?.desc ?? "");
          const n = plays?.[id] ?? 0;
          const disabled = !canPick(id);
          const hovered = hoveredContract === id;
          const reason = getContractDisabledReason(id);

          return (
            <ContractCard
              key={id}
              label={label}
              desc={desc}
              count={n}
              disabled={disabled}
              reason={reason}
              hovered={hovered}
              onMouseEnter={() => setHoveredContract(id)}
              onMouseLeave={() => setHoveredContract(null)}
              onClick={() => {
                if (disabled) return;
                onChooseContract?.(id);
              }}
              compact={isMobile}
              minHeight={mobileContractCardMinHeight}
            />
          );
        })}
      </div>

      {!isMobile ? (
        <PlayerProgressBoard
          players={players}
          currentIndex={currentIndex}
          totalScores={totalScores}
          roundDeltas={roundDeltas}
          progressCounts={phase1PickCounts}
          progressLabel="gekozen"
          trickCounts={currentRoundTrickCounts}
        />
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "stretch" : "flex-start" }}>
        <button
          onClick={handleContinueToPhase2}
          style={{ ...buttonStyle("success"), minHeight: 48, width: isMobile ? "100%" : undefined }}
        >
          Doorgaan naar fase 2
        </button>
      </div>
    </div>
  );
}
