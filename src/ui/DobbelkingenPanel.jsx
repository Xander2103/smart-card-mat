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
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      style={{
        ...softCardStyle({
          padding: 16,
          textAlign: "left",
          display: "grid",
          gap: 8,
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
            fontSize: 17,
            textAlign: "center",
            width: "100%",
            paddingRight: 42,
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
            padding: "4px 8px",
            background: count >= 2 ? colors.redSoft : colors.accentSoft,
            color: count >= 2 ? "#fecdd3" : "#fcd34d",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {count}/2
        </div>
      </div>

      <div
        style={{
          color: colors.muted,
          fontSize: 14,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {desc}
      </div>

      <div
        style={{
          fontSize: 12,
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
                  gap: 14,
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
  const { isMobile, isMobileLandscape } = useViewport();

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

  return (
    <>
      <DobbelkingenInfo open={showInfo} onClose={() => setShowInfo(false)} />

      <div style={panelStyle({ padding: isMobile ? 14 : 20, display: "grid", gap: isMobile ? 12 : 16, minHeight: isMobile ? "100%" : undefined })}>
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
            <div style={{ fontWeight: 800, fontSize: isMobile ? 18 : 28 }}>Dobbelkingen</div>
            <div style={{ color: colors.muted, marginTop: 2, fontSize: isMobile ? 12 : 15 }}>
              {isReady ? "Nieuwe match" : isChoosingContract ? "Contract kiezen" : isChoosingTroef ? "Troef kiezen" : "Dobbelkingen"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => setShowInfo(true)} style={{ ...buttonStyle(), padding: isMobile ? "8px 10px" : undefined, fontSize: isMobile ? 13 : undefined }}>
              Info
            </button>

            <button onClick={handleBackClick} style={{ ...buttonStyle("danger"), padding: isMobile ? "8px 10px" : undefined, fontSize: isMobile ? 13 : undefined }}>
              Terug
            </button>
          </div>
        </div>

        {isReady && (
          <>
            <div
              style={softCardStyle({
                padding: 18,
                display: "grid",
                gap: 10,
                background: "rgba(255,255,255,0.03)",
              })}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                Start een nieuwe match
              </div>

              <div style={{ color: colors.muted, lineHeight: 1.6 }}>
                {isMobile ? "Iedere speler kiest 2 contracten. Daarna volgt troef en start fase 2." : <>Iedere speler kiest 2 contracten.<br />Na fase 1 volgt fase 2 waarin troef gekozen wordt.<br />De speler na de troefkiezer komt uit in de eerste slag.</>}
              </div>
            </div>

            <div
              style={softCardStyle({
                padding: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              })}
            >
              <button onClick={onStart} style={buttonStyle("primary")}>
                Start Dobbelkingen
              </button>

              <button onClick={() => setShowInfo(true)} style={buttonStyle()}>
                Lees regels
              </button>
            </div>
          </>
        )}

        {isChoosingContract && (
          <>
            <div
              style={softCardStyle({
                padding: isMobile ? 10 : 14,
                background: "rgba(251,191,36,0.08)",
              })}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
                  alignItems: "center",
                  gap: isMobile ? 8 : 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 12,
                    fontSize: isMobile ? 14 : 22,
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
                    gap: 4,
                    justifyItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20 }}>
                    {chooserName} kiest nu een contract
                  </div>
                  <div style={{ color: colors.muted, fontSize: 14 }}>
                    Volgende speler komt uit in de eerste slag.
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    fontSize: isMobile ? 14 : 22,
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
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? (isMobileLandscape ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))") : "repeat(3, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {contractList.map((id) => {
                const c = getContract(id);
                const label = c?.label ?? id;
                const desc = c?.desc ?? "";
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
                style={buttonStyle("success")}
              >
                Doorgaan naar fase 2
              </button>
            </div>
          </>
        )}

        {isChoosingTroef && (
          <>
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
                  padding: 14,
                  display: "grid",
                  gap: 4,
                  background: "rgba(74,222,128,0.08)",
                  justifyItems: "center",
                  textAlign: "center",
                })}
              >
                <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20 }}>
                  {chooserName} kiest troef
                </div>
                <div style={{ color: colors.muted, fontSize: 14 }}>
                  {leaderName} komt uit in de eerste slag.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? (isMobileLandscape ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))") : "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
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
                        padding: 18,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "grid",
                        gap: 8,
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
                    <div style={{ fontWeight: 700, fontSize: 22, color: opt.color }}>
                      {opt.symbol} {opt.label}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 14 }}>
                      Gekozen door {chooserName}
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleFinishMatch} style={buttonStyle("success")}>
                Match afronden
              </button>
            </div>
          </>
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