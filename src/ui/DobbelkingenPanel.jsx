// src/ui/DobbelkingenPanel.jsx
import { useState } from "react";
import { getContract } from "../core/games/dobbelkingen/contracts";
import { DobbelkingenInfo } from "./dobbelkingen/DobbelkingenInfo";
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";
import { useViewport } from "./play/useViewport";

function getTrumpLabel(suit) {
  switch (String(suit ?? "").toUpperCase()) {
    case "H":
      return "♥ Harten";
    case "D":
      return "♦ Ruiten";
    case "C":
      return "♣ Klaveren";
    case "S":
      return "♠ Schoppen";
    default:
      return "—";
  }
}

const TROEF_OPTIONS = [
  { suit: "H", label: "Harten", symbol: "♥", color: "#fb7185" },
  { suit: "D", label: "Ruiten", symbol: "♦", color: "#fb7185" },
  { suit: "C", label: "Klaveren", symbol: "♣", color: "#e5eefb" },
  { suit: "S", label: "Schoppen", symbol: "♠", color: "#e5eefb" },
];


function getCompactContractDesc(label, desc) {
  const value = String(label ?? "").toLowerCase();
  if (value.includes("minste slagen")) return "Neem zo weinig mogelijk slagen. -1 per slag.";
  if (value.includes("minste harten")) return "Pak zo weinig mogelijk harten. -1 per hart.";
  if (value.includes("harten koning")) return "Koning harten gepakt? Meteen einde. -5 punten.";
  if (value.includes("boeren") || value.includes("koningen")) return "Boer of koning = -1 per kaart.";
  if (value.includes("geen slag 7") || value.includes("13")) return "Slag 7 = -2, slag 13 = -3.";
  if (value.includes("queens")) return "Elke vrouw = -2 punten.";
  return desc;
}

function ContractCard({
  label,
  desc,
  count,
  disabled,
  reason,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  compact = false,
  minHeight,
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      style={{
        ...softCardStyle({
          padding: compact ? 10 : 16,
          textAlign: "left",
          display: "grid",
          gap: compact ? 6 : 8,
          minHeight,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transform: hovered && !disabled ? "translateY(-2px)" : "none",
          transition: "all 0.16s ease",
          background: hovered && !disabled
            ? "rgba(251, 191, 36, 0.10)"
            : "rgba(255,255,255,0.04)",
          border: hovered && !disabled
            ? "1px solid rgba(251, 191, 36, 0.30)"
            : "1px solid rgba(255,255,255,0.08)",
        }),
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: compact ? 15 : 17,
            textAlign: "center",
            width: "100%",
            paddingRight: compact ? 34 : 42,
          }}
        >
          {label}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            borderRadius: 999,
            padding: compact ? "3px 7px" : "4px 8px",
            background: count >= 2 ? colors.redSoft : colors.accentSoft,
            color: count >= 2 ? "#fecdd3" : "#fcd34d",
            fontSize: compact ? 11 : 12,
            fontWeight: 700,
          }}
        >
          {count}/2
        </div>
      </div>

      <div
        style={{
          color: colors.muted,
          fontSize: compact ? 11 : 14,
          lineHeight: compact ? 1.32 : 1.5,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: compact ? 4 : "unset",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {desc}
      </div>

      <div
        style={{
          fontSize: compact ? 11 : 12,
          fontWeight: 700,
          color: disabled ? "#fda4af" : colors.muted,
          textAlign: "center",
        }}
      >
        {reason || "Beschikbaar om te kiezen"}
      </div>
    </button>
  );
}

function HistoryItem({ children }) {
  return (
    <div
      style={softCardStyle({
        padding: "10px 12px",
        background: "rgba(255,255,255,0.04)",
      })}
    >
      {children}
    </div>
  );
}

function getCurrentRoundTrickCounts(trickHistory, playersCount) {
  const counts = Array(playersCount).fill(0);

  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;

    if (
      typeof winnerIndex === "number" &&
      winnerIndex >= 0 &&
      winnerIndex < playersCount
    ) {
      counts[winnerIndex] += 1;
    }
  }

  return counts;
}

function formatRoundDelta(value) {
  const n = Number(value ?? 0);

  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return "0";
}

function PlayerProgressBoard({
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

function MobileRoundStatusOverlay({
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

export function DobbelkingenPanel({
  appState,
  onClose,
  onStart,
  onChooseContract,
  dispatchAction,
}) {
  const [hoveredContract, setHoveredContract] = useState(null);
  const [hoveredTroef, setHoveredTroef] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showMobileScore, setShowMobileScore] = useState(false);
  const { isMobile, isMobileLandscape, width } = useViewport();
  const compact = isMobile || isMobileLandscape;
  const mobileScale = isMobile ? Math.min(1.28, Math.max(1, width / 820)) : 1;
  const mobileContractCardMinHeight = isMobile
    ? Math.round((isMobileLandscape ? 150 : 132) * mobileScale)
    : undefined;

  const d = appState?.game?.dobbelkingen ?? null;
  const players = appState?.players ?? [];
  const playersCount = players.length || 4;
  const phase = appState?.phase ?? "-";
  const isReady = phase === "DOBBELKINGEN_READY";
  const isChoosingContract = phase === "CHOOSING_CONTRACT";
  const isChoosingTroef = phase === "CHOOSING_TROEF";
  const isPlaying = phase === "PLAYING_TRICK";

  const chooserIndex =
    phase === "CHOOSING_TROEF"
      ? typeof d?.troefChooserIndex === "number"
        ? d.troefChooserIndex
        : 0
      : typeof d?.chooserIndex === "number"
        ? d.chooserIndex
        : 0;

  const leaderIndex =
    phase === "CHOOSING_TROEF" || phase === "CHOOSING_CONTRACT"
      ? (chooserIndex + 1) % playersCount
      : typeof d?.leaderIndex === "number"
        ? d.leaderIndex
        : (chooserIndex + 1) % playersCount;

  const currentIndex =
    typeof d?.currentPlayerIndex === "number" ? d.currentPlayerIndex : 0;

  const chooserName = players?.[chooserIndex]?.name ?? `Player ${chooserIndex + 1}`;
  const leaderName = players?.[leaderIndex]?.name ?? `Player ${leaderIndex + 1}`;
  const currentName = players?.[currentIndex]?.name ?? `Player ${currentIndex + 1}`;

  const contractList = d?.contracts ?? [];
  const plays = d?.contractPlays ?? {};
  const lastContract = d?.lastContract ?? null;
  const troefPickCounts = d?.troefPickCounts ?? [];
  const history = d?.history ?? [];
  const trickHistory = d?.trickHistory ?? [];
  const totalScores = d?.totalScores ?? Array(playersCount).fill(0);
  const roundDeltas = d?.lastResult?.contractScores ?? Array(playersCount).fill(0);

  const currentRoundTrickCounts = getCurrentRoundTrickCounts(
    trickHistory,
    playersCount
  );

  function getContractDisabledReason(contractId) {
    if (lastContract === contractId) return "Niet 2× na elkaar";
    if ((plays?.[contractId] ?? 0) >= 2) return "Maximaal 2 keer gespeeld";
    return "";
  }

  function canPick(contractId) {
    if (!contractId) return false;
    return !getContractDisabledReason(contractId);
  }

  function handleBackClick() {
    if (isChoosingTroef || (isPlaying && d?.roundPhase === 2)) {
      const ok = window.confirm(
        "Ben je zeker dat je terug naar fase 1 wilt gaan? De huidige fase 2 voortgang gaat verloren."
      );
      if (!ok) return;

      dispatchAction?.({ type: "go_back_to_phase1" });
      return;
    }

    if (isChoosingContract || (isPlaying && d?.roundPhase === 1)) {
      const ok = window.confirm(
        "Ben je zeker dat je Dobbelkingen wilt verlaten? De huidige voortgang gaat verloren."
      );
      if (!ok) return;

      onClose?.();
      return;
    }

    onClose?.();
  }

  function handleFinishMatch() {
    const ok = window.confirm(
      "Ben je zeker dat je deze match direct wilt afronden?"
    );
    if (!ok) return;

    dispatchAction?.({ type: "finish_dobbelkingen_match" });
  }

  const phase1PickCounts = players.map((_, index) =>
    Math.min(
      2,
      history.filter(
        (entry) => entry?.contract !== "TROEF" && entry?.chooserIndex === index
      ).length
    )
  );

  function handleContinueToPhase2() {
    const ok = window.confirm(
      "Ben je zeker dat je wil doorgaan naar fase 2?"
    );
    if (!ok) return;

    dispatchAction?.({ type: "debug_go_to_phase2" });
  }

  return (
    <>
      <DobbelkingenInfo open={showInfo} onClose={() => setShowInfo(false)} />
      <MobileRoundStatusOverlay
        open={showMobileScore}
        title="Score"
        players={players}
        currentIndex={currentIndex}
        totalScores={totalScores}
        roundDeltas={roundDeltas}
        progressCounts={troefPickCounts}
        progressLabel="troef gekozen"
        trickCounts={currentRoundTrickCounts}
        onClose={() => setShowMobileScore(false)}
      />

      <div style={panelStyle({ padding: isMobile ? 12 : 20, display: "grid", gap: isMobile ? 10 : 16, alignContent: "start", minHeight: isMobile ? "100%" : undefined, height: isMobile ? "100%" : undefined, overflowX: "hidden" })}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr auto" : "1fr auto 1fr",
            alignItems: "center",
            gap: 10,
          }}
        >
          {!isMobile ? <div /> : null}

          <div
            style={{
              textAlign: isMobile ? "left" : "center",
              display: "grid",
              justifyItems: isMobile ? "start" : "center",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 28 }}>Dobbelkingen</div>
            <div style={{ color: colors.muted, marginTop: 1, fontSize: isMobile ? 11 : 15 }}>
              {isReady ? "Nieuwe match" : isChoosingContract ? "Contract kiezen" : isChoosingTroef ? "Troef kiezen" : "Dobbelkingen"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: compact ? 6 : 8,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => setShowInfo(true)} style={{ ...buttonStyle(), padding: isMobile ? "8px 12px" : undefined, fontSize: isMobile ? 13 : undefined, minHeight: isMobile ? 40 : undefined }}>
              Info
            </button>

            <button onClick={handleBackClick} style={{ ...buttonStyle("danger"), padding: isMobile ? "8px 12px" : undefined, fontSize: isMobile ? 13 : undefined, minHeight: isMobile ? 40 : undefined }}>
              Terug
            </button>
          </div>
        </div>

        {isReady && (
          <div
            style={softCardStyle({
              padding: isMobile ? "16px 14px" : "22px 22px",
              display: "grid",
              gap: isMobile ? 14 : 16,
              background: "linear-gradient(180deg, rgba(120,53,15,0.24), rgba(255,255,255,0.03))",
              border: "1px solid rgba(251,191,36,0.16)",
            })}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: isMobile ? 24 : 26, lineHeight: 1.08 }}>
                Start een nieuwe match
              </div>
              <div style={{ color: colors.muted, lineHeight: 1.6, maxWidth: 620, fontSize: isMobile ? 16 : 16 }}>
                {isMobile ? "Iedere speler kiest 2 contracten. Daarna volgt troef." : <>Iedere speler kiest 2 contracten.<br />Na fase 1 volgt fase 2 waarin troef gekozen wordt.<br />De speler na de troefkiezer komt uit in de eerste slag.</>}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={onStart}
                style={{
                  ...buttonStyle("primary"),
                  minHeight: isMobile ? 58 : 58,
                  minWidth: isMobile ? 236 : 250,
                  padding: isMobile ? "15px 24px" : "16px 26px",
                  fontSize: isMobile ? 19 : 18,
                  fontWeight: 900,
                  boxShadow: "0 0 28px rgba(251, 191, 36, 0.34), 0 14px 32px rgba(245, 158, 11, 0.24)",
                }}
              >
                Start Dobbelkingen
              </button>

              <button onClick={() => setShowInfo(true)} style={{ ...buttonStyle(), minHeight: 48, padding: "11px 16px" }}>
                Lees regels
              </button>
            </div>
          </div>
        )}

        {isChoosingContract && (
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
                gridTemplateColumns: isMobile ? (isMobileLandscape ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))") : "repeat(3, minmax(0, 1fr))",
                gridTemplateRows: isMobile && !isMobileLandscape ? (width >= 700 ? "repeat(3, minmax(172px, 1fr))" : "repeat(3, minmax(136px, 1fr))") : undefined,
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

            {!isMobile && (
              <PlayerProgressBoard
                players={players}
                currentIndex={currentIndex}
                totalScores={totalScores}
                roundDeltas={roundDeltas}
                progressCounts={phase1PickCounts}
                progressLabel="gekozen"
                trickCounts={currentRoundTrickCounts}
              />
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "stretch" : "flex-start" }}>
              <button
                onClick={handleContinueToPhase2}
                style={{ ...buttonStyle("success"), minHeight: 48, width: isMobile ? "100%" : undefined }}
              >
                Doorgaan naar fase 2
              </button>
            </div>
          </div>
        )}

        {isChoosingTroef && (
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
                gridTemplateColumns: isMobile ? (isMobileLandscape ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))") : "repeat(auto-fit, minmax(220px, 1fr))",
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
                    onClick={() =>
                      dispatchAction?.({ type: "choose_troef_suit", suit: opt.suit })
                    }
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

            {!isMobile && (
              <PlayerProgressBoard
                players={players}
                currentIndex={currentIndex}
                totalScores={totalScores}
                roundDeltas={roundDeltas}
                progressCounts={troefPickCounts}
                progressLabel="troef gekozen"
                trickCounts={currentRoundTrickCounts}
              />
            )}

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
        )}

        {history.length > 0 && !isMobile && (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>History</div>

            <div style={{ display: "grid", gap: 8 }}>
              {[...history]
                .slice()
                .reverse()
                .map((entry, index) => (
                  <HistoryItem key={`${entry.contract}-${entry.timestamp ?? index}-${index}`}>
                    <b>{entry.label ?? entry.contract}</b>{" "}
                    {entry.trumpSuit ? `(${getTrumpLabel(entry.trumpSuit)}) ` : ""}
                    — gespeeld door{" "}
                    <b>
                      {players?.[entry.chooserIndex]?.name ??
                        `Player ${(entry.chooserIndex ?? 0) + 1}`}
                    </b>
                  </HistoryItem>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}