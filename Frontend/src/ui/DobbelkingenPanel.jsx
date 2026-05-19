// src/ui/DobbelkingenPanel.jsx
import { useState } from "react";
import { DobbelkingenInfo } from "./dobbelkingen/DobbelkingenInfo";
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";
import { useViewport } from "./play/useViewport";
import { HistoryItem } from "./dobbelkingen/HistoryItem";
import { MobileRoundStatusOverlay } from "./dobbelkingen/MobileRoundStatusOverlay";
import { ContractSelectionSection } from "./dobbelkingen/ContractSelectionSection";
import { TroefSelectionSection } from "./dobbelkingen/TroefSelectionSection";
import { getCurrentRoundTrickCounts, getTrumpLabel } from "./dobbelkingen/helpers";
import { ConfirmModal } from "./components/ConfirmModal";

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
  const [confirmAction, setConfirmAction] = useState(null);

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
        : typeof appState?.tableDealerSeat === "number"
          ? appState.tableDealerSeat
          : 0
      : typeof d?.chooserIndex === "number"
        ? d.chooserIndex
        : typeof appState?.tableDealerSeat === "number"
          ? appState.tableDealerSeat
          : 0;

  const dealerIndex =
    typeof d?.chooserIndex === "number"
      ? d.chooserIndex
      : typeof appState?.tableDealerSeat === "number"
        ? appState.tableDealerSeat
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

  function openConfirm(config) {
    setConfirmAction(config);
  }

  function closeConfirm() {
    setConfirmAction(null);
  }

  async function runConfirmAction() {
    if (!confirmAction?.onConfirm) return;

    await confirmAction.onConfirm();
    setConfirmAction(null);
  }

  function getContractDisabledReason(contractId) {
    if (lastContract === contractId) return "Niet 2× na elkaar";
    if ((plays?.[contractId] ?? 0) >= 2) return "Maximaal 2 keer gespeeld";
    return "";
  }

  function canPick(contractId) {
    if (!contractId) return false;
    return !getContractDisabledReason(contractId);
  }

  function handleAdjustTotalScore(playerIndex, delta) {
    dispatchAction?.({
      type: "adjust_total_score",
      playerIndex,
      delta,
    });
  }

  function handleBackClick() {
    if (isChoosingTroef || (isPlaying && d?.roundPhase === 2)) {
      openConfirm({
        title: "Terug naar fase 1?",
        message:
          "Ben je zeker dat je terug naar fase 1 wilt gaan? De huidige fase 2 voortgang gaat verloren.",
        confirmLabel: "Terug naar fase 1",
        cancelLabel: "Annuleren",
        danger: true,
        onConfirm: async () => {
          dispatchAction?.({ type: "go_back_to_phase1" });
        },
      });
      return;
    }

    if (isChoosingContract || (isPlaying && d?.roundPhase === 1)) {
      openConfirm({
        title: "Dobbelkingen verlaten?",
        message:
          "Ben je zeker dat je Dobbelkingen wilt verlaten? De huidige voortgang gaat verloren.",
        confirmLabel: "Verlaten",
        cancelLabel: "Annuleren",
        danger: true,
        onConfirm: async () => {
          onClose?.();
        },
      });
      return;
    }

    onClose?.();
  }

  function handleFinishMatch() {
    openConfirm({
      title: "Match direct afronden?",
      message: "Ben je zeker dat je deze match direct wilt afronden?",
      confirmLabel: "Match afronden",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        dispatchAction?.({ type: "finish_dobbelkingen_match" });
      },
    });
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
    openConfirm({
      title: "Doorgaan naar fase 2?",
      message: "Ben je zeker dat je wil doorgaan naar fase 2?",
      confirmLabel: "Doorgaan",
      cancelLabel: "Annuleren",
      danger: false,
      onConfirm: async () => {
        dispatchAction?.({ type: "debug_go_to_phase2" });
      },
    });
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

      <div
        style={panelStyle({
          padding: isMobile ? 12 : 20,
          display: "grid",
          gap: isMobile ? 10 : 16,
          alignContent: "start",
          minHeight: isMobile ? "100%" : undefined,
          height: isMobile ? "100%" : undefined,
          overflowX: "hidden",
        })}
      >
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
            <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 28 }}>
              Dobbelkingen
            </div>
            <div
              style={{
                color: colors.muted,
                marginTop: 1,
                fontSize: isMobile ? 11 : 15,
              }}
            >
              {isReady
                ? "Nieuwe match"
                : isChoosingContract
                  ? "Contract kiezen"
                  : isChoosingTroef
                    ? "Troef kiezen"
                    : "Dobbelkingen"}
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
            <button
              onClick={() => setShowInfo(true)}
              style={{
                ...buttonStyle(),
                padding: isMobile ? "8px 12px" : undefined,
                fontSize: isMobile ? 13 : undefined,
                minHeight: isMobile ? 40 : undefined,
              }}
            >
              Info
            </button>

            <button
              onClick={handleBackClick}
              style={{
                ...buttonStyle("danger"),
                padding: isMobile ? "8px 12px" : undefined,
                fontSize: isMobile ? 13 : undefined,
                minHeight: isMobile ? 40 : undefined,
              }}
            >
              Terug
            </button>
          </div>
        </div>

        {isReady ? (
          <div
            style={softCardStyle({
              padding: isMobile ? "16px 14px" : "22px 22px",
              display: "grid",
              gap: isMobile ? 14 : 16,
              background:
                "linear-gradient(180deg, rgba(120,53,15,0.24), rgba(255,255,255,0.03))",
              border: "1px solid rgba(251,191,36,0.16)",
            })}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: isMobile ? 24 : 26,
                  lineHeight: 1.08,
                }}
              >
                Start een nieuwe match
              </div>
              <div
                style={{
                  color: colors.muted,
                  lineHeight: 1.6,
                  maxWidth: 620,
                  fontSize: isMobile ? 16 : 16,
                }}
              >
                {isMobile ? (
                  "Iedere speler kiest 2 contracten. Daarna volgt troef."
                ) : (
                  <>
                    Iedere speler kiest 2 contracten.
                    <br />
                    Na fase 1 volgt fase 2 waarin troef gekozen wordt.
                    <br />
                    De speler na de troefkiezer komt uit in de eerste slag.
                  </>
                )}
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
                  boxShadow:
                    "0 0 28px rgba(251, 191, 36, 0.34), 0 14px 32px rgba(245, 158, 11, 0.24)",
                }}
              >
                Start Dobbelkingen
              </button>

              <button
                onClick={() => setShowInfo(true)}
                style={{ ...buttonStyle(), minHeight: 48, padding: "11px 16px" }}
              >
                Lees regels
              </button>
            </div>
          </div>
        ) : null}

        {isChoosingContract ? (
          <ContractSelectionSection
            isMobile={isMobile}
            isMobileLandscape={isMobileLandscape}
            width={width}
            mobileScale={mobileScale}
            mobileContractCardMinHeight={mobileContractCardMinHeight}
            chooserName={chooserName}
            dealerIndex={dealerIndex}
            contractList={contractList}
            plays={plays}
            hoveredContract={hoveredContract}
            setHoveredContract={setHoveredContract}
            canPick={canPick}
            getContractDisabledReason={getContractDisabledReason}
            onChooseContract={onChooseContract}
            players={players}
            currentIndex={currentIndex}
            totalScores={totalScores}
            roundDeltas={roundDeltas}
            phase1PickCounts={phase1PickCounts}
            currentRoundTrickCounts={currentRoundTrickCounts}
            handleContinueToPhase2={handleContinueToPhase2}
            onAdjustScore={handleAdjustTotalScore}
          />
        ) : null}

        {isChoosingTroef ? (
          <TroefSelectionSection
            isMobile={isMobile}
            isMobileLandscape={isMobileLandscape}
            width={width}
            mobileScale={mobileScale}
            compact={compact}
            chooserName={chooserName}
            dealerIndex={dealerIndex}
            leaderName={leaderName}
            hoveredTroef={hoveredTroef}
            setHoveredTroef={setHoveredTroef}
            dispatchAction={dispatchAction}
            players={players}
            currentIndex={currentIndex}
            totalScores={totalScores}
            roundDeltas={roundDeltas}
            troefPickCounts={troefPickCounts}
            currentRoundTrickCounts={currentRoundTrickCounts}
            handleFinishMatch={handleFinishMatch}
            setShowMobileScore={setShowMobileScore}
            onAdjustScore={handleAdjustTotalScore}
          />
        ) : null}

        {history.length > 0 && !isMobile ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>History</div>

            <div style={{ display: "grid", gap: 8 }}>
              {[...history]
                .slice()
                .reverse()
                .map((entry, index) => (
                  <HistoryItem
                    key={`${entry.contract}-${entry.timestamp ?? index}-${index}`}
                  >
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
        ) : null}
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        cancelLabel={confirmAction?.cancelLabel}
        danger={confirmAction?.danger}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
    </>
  );
}