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
import { CARD_BY_CODE } from "../../core/mapping/deck52";
import { GameToolbar } from "../play/GameToolbar";
import { useViewport } from "../play/useViewport";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";

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
      <div style={{ fontSize: 13, color: "#fecdd3" }}>
        Controleer de huidige beurt en zone.
      </div>
    </div>
  );
}

function PlayedCardsPanel({ cardCodes = [] }) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 8 })}>
      <div style={{ fontWeight: 900 }}>Recent gespeelde kaarten</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Laatste 20 gescande kaartcodes uit deze matchflow.
      </div>
      <div
        style={softCardStyle({
          padding: 14,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 13,
          lineHeight: 1.6,
          color: colors.text,
        })}
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

function DevPanel({
  appState,
  d,
  zonesForGrid,
  DISPLAY_ZONES,
  turnZoneForGrid,
  cardNamesForGrid,
  handleGridClick,
  onConfirmTurn,
  onResetPile,
  dispatchAction,
}) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 14 })}>
      <div style={{ fontWeight: 900, fontSize: 20 }}>Dev panel</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Ontwikkeltools, debugacties en speelzones. Dit hoort niet in de normale gameplay UI.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button onClick={onConfirmTurn} style={buttonStyle("primary")}>
          Confirm turn
        </button>

        <button onClick={onResetPile} style={buttonStyle()}>
          Reset pile
        </button>

        {d?.roundPhase !== 2 && (
          <button
            onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
            style={buttonStyle("success")}
          >
            Doorgaan naar fase 2
          </button>
        )}

        {d?.roundPhase === 2 && (
          <button
            onClick={() => dispatchAction?.({ type: "debug_finish_phase2_match" })}
            style={buttonStyle("success")}
          >
            Match direct afronden
          </button>
        )}
      </div>

      <ZoneGrid
        zones={zonesForGrid}
        zoneNumbers={DISPLAY_ZONES}
        turnZone={turnZoneForGrid}
        cardNames={cardNamesForGrid}
        trumpSuit={d?.currentTrumpSuit ?? null}
        onZoneClick={handleGridClick}
      />

      <div style={panelStyle({ padding: 16, display: "grid", gap: 10 })}>
        <div style={{ fontWeight: 900 }}>Debug log</div>
        <DebugLog lines={appState.log} />
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

  const contractId = d?.contract ?? null;
  const trickCount = d?.trickHistory?.length ?? 0;

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
    endedByIndex !== null
      ? players?.[endedByIndex]?.name ?? `Player ${endedByIndex + 1}`
      : null;

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
    appState.phase === "CHOOSING_CONTRACT"
      ? (chooserIndex + 1) % playersCount
      : typeof d?.lastTrickWinnerIndex === "number"
        ? d.lastTrickWinnerIndex
        : typeof d?.currentContractStarterIndex === "number"
          ? d.currentContractStarterIndex
          : typeof d?.leaderIndex === "number"
            ? d.leaderIndex
            : (chooserIndex + 1) % playersCount;

  const tableSeatCards = useMemo(() => {
    return Array.from({ length: playersCount }, (_, index) => {
      const uid = zones?.[index] ?? null;
      const code = uid ? appState.mapping?.[uid] ?? null : null;
      const card = code ? CARD_BY_CODE?.[code] ?? null : null;
      return card?.label ?? null;
    });
  }, [appState.mapping, playersCount, zones]);

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

  const { isMobile } = useViewport();

  const showRecentCards = appState.showRecentCards !== false;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <style>{`
        .table-ornament-wrap {
          position: relative;
        }

        .table-center-ornament {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid rgba(255, 200, 120, 0.18);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0.42;
          box-shadow:
            inset 0 0 24px rgba(255, 180, 60, 0.10),
            0 0 40px rgba(255, 180, 60, 0.05);
          background:
            radial-gradient(circle at center, rgba(255, 180, 60, 0.05) 0%, rgba(255, 180, 60, 0.015) 48%, transparent 72%);
          z-index: 0;
        }

        .table-ornament-core {
          position: absolute;
          width: 74px;
          height: 74px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 18px;
          border: 1px solid rgba(255, 220, 170, 0.12);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: inset 0 0 16px rgba(255, 190, 90, 0.08);
        }
      `}</style>

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
            onUndo={onUndo}
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

          <div className="table-ornament-wrap">
            <div className="table-center-ornament" />
            <div className="table-ornament-core" />

            <TableDirection
              players={players}
              currentPlayerIndex={currentIndex}
              leaderPlayerIndex={leaderPlayerIndex}
              contractLabel={contractId ?? "—"}
              trumpLabel={getTrumpLabel(d?.currentTrumpSuit)}
              trickLabel={`${trickCount} / 13`}
              seatCards={tableSeatCards}
            />
          </div>

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

          {showRecentCards && (
            <PlayedCardsPanel cardCodes={d?.usedCardCodes ?? appState.usedCardCodes ?? []} />
          )}

          {showDebug && (
            <DevPanel
              appState={appState}
              d={d}
              zonesForGrid={zonesForGrid}
              DISPLAY_ZONES={DISPLAY_ZONES}
              turnZoneForGrid={turnZoneForGrid}
              cardNamesForGrid={cardNamesForGrid}
              handleGridClick={handleGridClick}
              onConfirmTurn={onConfirmTurn}
              onResetPile={onResetPile}
              dispatchAction={dispatchAction}
            />
          )}
        </>
      )}
    </div>
  );
}