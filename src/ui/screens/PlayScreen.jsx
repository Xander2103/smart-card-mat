// src/ui/screens/PlayScreen.jsx
import { useEffect, useMemo, useState } from "react";

import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { TableDirection } from "../TableDirection";
import { ContractEndOverlay } from "../ContractEndOverlay";
import { computeScoresFromTrickHistory } from "../../core/games/dobbelkingen/scoring";
import { EndScreen } from "../play/EndScreen";
import { GameToolbar } from "../play/GameToolbar";
import { useViewport } from "../play/useViewport";
import { colors, panelStyle, softCardStyle } from "../play/theme";

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

function getTrickWinsByPlayer(trickHistory, playersCount) {
  const wins = Array(playersCount).fill(0);

  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;
    if (typeof winnerIndex === "number" && winnerIndex >= 0 && winnerIndex < playersCount) {
      wins[winnerIndex] += 1;
    }
  }

  return wins;
}

function buildPhaseLabel(appState, roundPhase) {
  if (appState.phase === "CHOOSING_TROEF") return "Fase 2 · Troefkeuze";
  if (appState.phase === "CHOOSING_CONTRACT") return "Fase 1 · Contractkeuze";
  if (appState.phase === "PLAYING_TRICK") {
    return roundPhase === 2 ? "Fase 2 · Slag spelen" : "Fase 1 · Slag spelen";
  }
  if (appState.phase === "DOBBELKINGEN_READY") return "Klaar om te starten";
  if (appState.phase === "DOBBELKINGEN_DONE") return "Match afgerond";
  return "Dobbelkingen";
}

function buildRoundLabel(roundPhase, contractId, trickCount) {
  if (roundPhase === 2) return `Troefronde · slag ${Math.min((trickCount ?? 0) + 1, 13)} / 13`;
  if (contractId) return `Contract · ${contractId}`;
  return "Contractronde 1";
}

function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        ...panelStyle({
          padding: "14px 16px",
          border: "1px solid rgba(251, 113, 133, 0.34)",
          background: "rgba(127, 29, 29, 0.52)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }),
        color: "#ffe4e6",
      }}
    >
      <div style={{ fontWeight: 800 }}>🚫 {message}</div>
      <div style={{ fontSize: 13, color: "#fecdd3" }}>Controleer de huidige beurt en zone.</div>
    </div>
  );
}

function PlayedCardsPanel({ cardCodes = [] }) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 8 })}>
      <div style={{ fontWeight: 900 }}>Recent gespeelde kaarten</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Laatste 20 gescande codes uit deze matchflow.
      </div>
      <div
        style={{
          ...softCardStyle({
            padding: 14,
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 13,
            lineHeight: 1.6,
            color: colors.text,
          }),
        }}
      >
        {cardCodes.slice(-20).join(" • ") || "—"}
      </div>
    </div>
  );
}

function TrickWinsPanel({ players, trickWins }) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
      <div style={{ fontWeight: 900 }}>Slagen in fase 2</div>
      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player, index) => (
          <div
            key={player.id ?? index}
            style={softCardStyle({
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.04)",
            })}
          >
            <div>{player.name ?? `Player ${index + 1}`}</div>
            <div style={{ fontWeight: 900 }}>{trickWins[index] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayScreen({
  appState,
  gameState,
  zones,
  turnZone,
  cardNames,
  onZoneClick,
  onConfirmTurn,
  onUndo,
  onResetPile,
  showDebug = true,
  onBackFromContract,
  onOpenDobbelkingen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,
  dispatchAction,
}) {
  const d = appState.game?.dobbelkingen ?? null;
  const players = appState.players ?? [];
  const playersCount = players.length || 4;

  const currentIndex =
    typeof d?.currentPlayerIndex === "number"
      ? d.currentPlayerIndex
      : typeof appState.currentPlayerIndex === "number"
        ? appState.currentPlayerIndex
        : 0;

  const currentName = players[currentIndex]?.name ?? `Player ${currentIndex + 1}`;
  const contractId = d?.contract ?? null;
  const trickCount = d?.trickHistory?.length ?? 0;
  const roundPhase = d?.roundPhase ?? 1;

  const scoreboardScores =
    appState.phase === "PLAYING_TRICK"
      ? computeScoresFromTrickHistory(d?.trickHistory ?? [], playersCount)
      : d?.totalScores ?? [];

  const trickWins =
    appState.phase === "PLAYING_TRICK"
      ? getTrickWinsByPlayer(d?.trickHistory ?? [], playersCount)
      : Array(playersCount).fill(0);

  const endedReason = d?.lastResult?.endedEarlyReason ?? null;
  const endedByIndex =
    typeof d?.lastResult?.endedByPlayerIndex === "number"
      ? d.lastResult.endedByPlayerIndex
      : null;

  const endedByName =
    endedByIndex !== null ? players?.[endedByIndex]?.name ?? `Player ${endedByIndex + 1}` : null;

  const isHeartsKingEnded = endedReason === "HEARTS_KING_PLAYED";
  const isAllHeartsEnded = endedReason === "ALL_HEARTS_PLAYED";
  const isAllJkEnded = endedReason === "ALL_JK_PLAYED";
  const isAllQueensEnded = endedReason === "ALL_QUEENS_PLAYED";

  const showContractOverlay =
    (isHeartsKingEnded || isAllHeartsEnded || isAllJkEnded || isAllQueensEnded) &&
    appState.phase === "PLAYING_TRICK" &&
    d?.lastResult?.overlayClosed !== true;

  const overlayTitle = isHeartsKingEnded
    ? "Harten Koning gespeeld 👑♥ — contract beëindigd"
    : isAllHeartsEnded
      ? "Alle harten zijn gespeeld ♥ — contract beëindigd"
      : isAllJkEnded
        ? "Alle boeren & koningen gespeeld 👑🃏 — contract beëindigd"
        : "Alle queens zijn gespeeld 👑 — contract beëindigd";

  const overlayMessage = isHeartsKingEnded
    ? endedByName
      ? `${endedByName} krijgt -5`
      : "Speler krijgt -5"
    : isAllHeartsEnded
      ? "Alle 13 harten zijn gespeeld — terug naar contract keuze"
      : isAllJkEnded
        ? "Alle J & K zijn gevallen — terug naar contract keuze"
        : "Alle 4 queens zijn gevallen — terug naar contract keuze";

  const showChooserBanner =
    (appState.phase === "CHOOSING_CONTRACT" ||
      appState.phase === "CHOOSING_TROEF" ||
      appState.phase === "DOBBELKINGEN_READY") &&
    appState.activeMode === "DOBBELKINGEN" &&
    (isHeartsKingEnded || isAllHeartsEnded || isAllJkEnded || isAllQueensEnded);

  const chooserBannerText = isHeartsKingEnded
    ? `❤️‍🔥 ${overlayTitle} — ${overlayMessage}`
    : isAllHeartsEnded
      ? `♥ ${overlayTitle} — ${overlayMessage}`
      : isAllJkEnded
        ? `🃏 ${overlayTitle} — ${overlayMessage}`
        : `👑 ${overlayTitle} — ${overlayMessage}`;

  const showModesHome = appState.phase === "HOME";
  const showLobby =
    appState.phase === "DOBBELKINGEN_READY" ||
    appState.phase === "CHOOSING_CONTRACT" ||
    appState.phase === "CHOOSING_TROEF";
  const showGameUi = appState.phase === "PLAYING_TRICK";
  const showDoneUi = appState.phase === "DOBBELKINGEN_DONE";

  const DISPLAY_ZONES = useMemo(() => [1, 2, 4, 3], []);
  const zonesForGrid = DISPLAY_ZONES.map((z) => zones?.[z - 1] ?? null);
  const cardNamesForGrid = DISPLAY_ZONES.map((z) => cardNames?.[z - 1] ?? null);

  const turnZoneForGrid = (() => {
    const real = gameState?.expectedZone ?? null;
    const idx = DISPLAY_ZONES.indexOf(real);
    return idx >= 0 ? idx + 1 : null;
  })();

  function handleGridClick(gridPos) {
    const realZone = DISPLAY_ZONES[gridPos - 1];
    if (!realZone) return;
    onZoneClick?.(realZone);
  }

  const chooserIndex =
    appState.phase === "CHOOSING_TROEF"
      ? typeof d?.troefChooserIndex === "number"
        ? d.troefChooserIndex
        : 0
      : typeof d?.chooserIndex === "number"
        ? d.chooserIndex
        : currentIndex;

  const leaderPlayerIndex =
    typeof d?.lastTrickWinnerIndex === "number"
      ? d.lastTrickWinnerIndex
      : typeof d?.currentContractStarterIndex === "number"
        ? d.currentContractStarterIndex
        : typeof d?.leaderIndex === "number"
          ? d.leaderIndex
          : null;

  const chooserName = players?.[chooserIndex]?.name ?? `Player ${chooserIndex + 1}`;
  const leaderName =
    leaderPlayerIndex !== null
      ? players?.[leaderPlayerIndex]?.name ?? `Player ${leaderPlayerIndex + 1}`
      : "—";

  const [trickToast, setTrickToast] = useState(null);
  const [flashWinnerIndex, setFlashWinnerIndex] = useState(null);

  useEffect(() => {
    const winnerIdx = d?.lastTrickWinnerIndex;
    const ts = d?.lastTrick?.timestamp ?? null;
    if (typeof winnerIdx !== "number" || !ts) return undefined;

    const name = players?.[winnerIdx]?.name ?? `Player ${winnerIdx + 1}`;

    setTrickToast({
      key: `trick-${ts}`,
      title: `🏆 ${name} wint de slag`,
    });

    setFlashWinnerIndex(winnerIdx);

    const t1 = window.setTimeout(() => setTrickToast(null), 1200);
    const t2 = window.setTimeout(() => setFlashWinnerIndex(null), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [d?.lastTrick?.timestamp, d?.lastTrickWinnerIndex, players]);


  const { isMobile, isTablet } = useViewport();

  const contentColumns = isMobile
    ? "minmax(0, 1fr)"
    : isTablet
      ? "minmax(0, 1fr)"
      : "minmax(0, 1.6fr) minmax(300px, 0.9fr)";

  const leftColumnOrder = isMobile ? 2 : 1;
  const rightColumnOrder = isMobile ? 1 : 2;

  const toolbarMeta = [
    { label: "Mode", value: appState.gameMode ?? "—", accent: colors.blue },
    { label: "Contract", value: contractId ?? "—", accent: colors.accent },
    { label: "Troef", value: getTrumpLabel(d?.currentTrumpSuit), accent: colors.green },
    { label: "Slag", value: `${trickCount} / 13`, accent: colors.red },
    { label: "TurnZone", value: turnZone ?? "—", accent: colors.blue },
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <ContractEndOverlay
        open={showContractOverlay}
        title={overlayTitle}
        message={overlayMessage}
        onClose={() => dispatchAction?.({ type: "close_contract_overlay" })}
      />

      {showModesHome && <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />}

      {showLobby && appState.activeMode === "DOBBELKINGEN" && (
        <>
          {showChooserBanner && (
            <div
              style={panelStyle({
                padding: "12px 14px",
                border: "1px solid rgba(251, 191, 36, 0.34)",
                background: "rgba(120, 53, 15, 0.48)",
                fontWeight: 900,
              })}
            >
              {chooserBannerText}
            </div>
          )}

          <DobbelkingenPanel
            appState={appState}
            onClose={onCloseMode}
            onStart={onStartDobbelkingen}
            onChooseContract={onChooseDobbelkingenContract}
            dispatchAction={dispatchAction}
          />
        </>
      )}

      {showDoneUi && (
        <EndScreen
          summary={d?.matchSummary}
          onNewGame={onStartDobbelkingen}
          onBackHome={onCloseMode}
        />
      )}

      {showGameUi && (
        <>
          <ErrorBanner message={appState.lastError} />

          <GameToolbar
            canConfirm={gameState?.canConfirm}
            autoConfirm={appState.autoConfirm}
            onConfirmTurn={onConfirmTurn}
            onUndo={onUndo}
            onResetPile={onResetPile}
            onDebugNextPhase={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
            onFinishMatch={() => dispatchAction?.({ type: "debug_finish_phase2_match" })}
            showNextPhaseButton={d?.roundPhase !== 2}
            showFinishMatchButton={d?.roundPhase === 2}
            meta={toolbarMeta}
            onBack={() => {
              const ok = window.confirm(
                "Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen."
              );
              if (ok) onBackFromContract?.();
            }}
          />

          {trickToast && (
            <div
              key={trickToast.key}
              style={panelStyle({
                padding: "10px 12px",
                border: "1px solid rgba(74, 222, 128, 0.34)",
                background: "rgba(20, 83, 45, 0.56)",
                fontWeight: 900,
              })}
            >
              {trickToast.title}
            </div>
          )}

          <TableDirection
            players={players}
            currentPlayerIndex={currentIndex}
            leaderPlayerIndex={leaderPlayerIndex}
            contractLabel={contractId ?? "—"}
            trumpLabel={getTrumpLabel(d?.currentTrumpSuit)}
            trickLabel={`${trickCount} / 13`}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: contentColumns,
              gap: 14,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 14, order: leftColumnOrder }}>

              <ZoneGrid
                zones={zonesForGrid}
                zoneNumbers={DISPLAY_ZONES}
                turnZone={turnZoneForGrid}
                cardNames={cardNamesForGrid}
                trumpSuit={d?.currentTrumpSuit ?? null}
                onZoneClick={handleGridClick}
              />

              <PlayedCardsPanel cardCodes={d?.usedCardCodes ?? appState.usedCardCodes ?? []} />

              {showDebug && (
                <div style={panelStyle({ padding: 16, display: "grid", gap: 10 })}>
                  <div style={{ fontWeight: 900 }}>Debug log</div>
                  <DebugLog lines={appState.log} />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 14, order: rightColumnOrder }}>
              <Scoreboard
                players={players}
                scores={scoreboardScores}
                currentPlayerIndex={currentIndex}
                flashWinnerIndex={flashWinnerIndex}
                allowEdit={false}
                onAdjustScore={(playerIndex, delta) =>
                  dispatchAction?.({ type: "adjust_total_score", playerIndex, delta })
                }
              />

              {contractId === "TROEF" && <TrickWinsPanel players={players} trickWins={trickWins} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
