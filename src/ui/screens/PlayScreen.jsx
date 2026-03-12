import { useEffect, useMemo, useRef, useState } from "react";

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

function toPrettyCard(code) {
  if (!code) return "—";

  const suit = code.slice(-1).toUpperCase();
  const rank = code.slice(0, -1).toUpperCase();

  const suitMap = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${rank}${suitMap[suit] ?? suit}`;
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

function AnimatedBanner({ type = "info", title, message, compact = false }) {
  if (!title && !message) return null;

  const tones =
    type === "error"
      ? {
          border: "1px solid rgba(251, 113, 133, 0.34)",
          background: "linear-gradient(180deg, rgba(127, 29, 29, 0.82), rgba(69, 10, 10, 0.82))",
          glow: "0 16px 34px rgba(127, 29, 29, 0.22)",
          icon: "🚫",
          titleColor: "#ffe4e6",
          bodyColor: "#fecdd3",
        }
      : {
          border: "1px solid rgba(74, 222, 128, 0.34)",
          background: "linear-gradient(180deg, rgba(20, 83, 45, 0.84), rgba(22, 101, 52, 0.80))",
          glow: "0 16px 34px rgba(20, 83, 45, 0.22)",
          icon: "🏆",
          titleColor: "#ecfdf5",
          bodyColor: "#bbf7d0",
        };

  return (
    <div
      style={{
        ...panelStyle({
          padding: compact ? "10px 14px" : "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          overflow: "hidden",
          position: "relative",
          border: tones.border,
          background: tones.background,
          boxShadow: tones.glow,
          animation: "bannerIn 240ms cubic-bezier(.19,1,.22,1)",
        }),
      }}
    >
      <style>{`
        @keyframes bannerIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes bannerShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }

        @keyframes bannerTimer {
          0% { transform: scaleX(1); opacity: 0.95; }
          100% { transform: scaleX(0); opacity: 0.45; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.08) 48%, transparent 78%)",
          animation: "bannerShine 2.6s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: compact ? 34 : 42,
            height: compact ? 34 : 42,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            fontSize: compact ? 16 : 18,
            fontWeight: 900,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {tones.icon}
        </div>

        <div style={{ display: "grid", gap: 2 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: compact ? 3 : 4,
              background:
                type === "error"
                  ? "linear-gradient(90deg, rgba(251,113,133,0.95), rgba(254,205,211,0.65))"
                  : "linear-gradient(90deg, rgba(74,222,128,0.95), rgba(187,247,208,0.65))",
              transformOrigin: "left center",
              animation: compact ? "bannerTimer 1.2s linear forwards" : "bannerTimer 3.2s linear forwards",
            }}
          />

          <div style={{ fontWeight: 900, color: tones.titleColor }}>{title}</div>
          {message ? <div style={{ fontSize: 13, color: tones.bodyColor }}>{message}</div> : null}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <AnimatedBanner
      type="error"
      title={message}
      message="Controleer de huidige beurt, zone en contractregel."
    />
  );
}

function PlayedCardsPanel({ cardCodes = [] }) {
  const pretty = cardCodes.slice(-20).map((code) => toPrettyCard(code));

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 8 })}>
      <div style={{ fontWeight: 900 }}>Recent gespeelde kaarten</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Laatste 20 gescande kaartcodes uit deze matchflow.
      </div>

      <div
        style={softCardStyle({
          padding: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          minHeight: 56,
          alignItems: "center",
        })}
      >
        {pretty.length === 0 ? (
          <div style={{ color: colors.muted }}>—</div>
        ) : (
          pretty.map((label, index) => {
            const isRed = label.includes("♥") || label.includes("♦");

            return (
              <div
                key={`${label}-${index}`}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  fontWeight: 900,
                  color: isRed ? "#ff9aa8" : colors.text,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                }}
              >
                {label}
              </div>
            );
          })
        )}
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
        Ontwikkeltools, debugacties en speelzones.
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

  const seatCards = useMemo(() => {
    return Array.from({ length: playersCount }, (_, index) => {
      const uid = zones?.[index] ?? null;
      const code = uid ? appState.mapping?.[uid] ?? null : null;
      return code ? toPrettyCard(code) : null;
    });
  }, [appState.mapping, playersCount, zones]);

  const centerCards = useMemo(() => {
    const currentTrick = d?.currentTrick ?? [];
    const result = Array(playersCount).fill(null);

    for (const play of currentTrick) {
      const playerIndex = play?.playerIndex;
      const cardCode = play?.cardCode;
      if (typeof playerIndex === "number" && cardCode) {
        result[playerIndex] = toPrettyCard(cardCode);
      }
    }

    return result;
  }, [d?.currentTrick, playersCount]);

  const [flyingCards, setFlyingCards] = useState([]);
  const prevTrickRef = useRef([]);
  const [trickToast, setTrickToast] = useState(null);
  const [flashWinnerIndex, setFlashWinnerIndex] = useState(null);

  useEffect(() => {
    const winnerIdx = d?.lastTrickWinnerIndex;
    const ts = d?.lastTrick?.timestamp ?? null;
    if (typeof winnerIdx !== "number" || !ts) return undefined;

    const name = players?.[winnerIdx]?.name ?? `Player ${winnerIdx + 1}`;

    setTrickToast({
      key: `trick-${ts}`,
      title: `${name} wint de slag`,
      message: "Volgende speler is nu aan zet.",
    });

    setFlashWinnerIndex(winnerIdx);

    const t1 = window.setTimeout(() => setTrickToast(null), 1200);
    const t2 = window.setTimeout(() => setFlashWinnerIndex(null), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [d?.lastTrick?.timestamp, d?.lastTrickWinnerIndex, players]);


  useEffect(() => {
    const currentTrick = Array.isArray(d?.currentTrick) ? d.currentTrick : [];
    const prevTrick = Array.isArray(prevTrickRef.current) ? prevTrickRef.current : [];

    if (currentTrick.length < prevTrick.length) {
      prevTrickRef.current = currentTrick;
      return;
    }

    const newPlays = currentTrick.slice(prevTrick.length);

    if (newPlays.length > 0) {
      const created = newPlays
        .map((play, index) => {
          const playerIndex = play?.playerIndex;
          const cardCode = play?.cardCode;
          if (typeof playerIndex !== "number" || !cardCode) return null;

          return {
            id: `fly-${Date.now()}-${prevTrick.length + index}-${playerIndex}-${cardCode}`,
            seat: playerIndex,
            label: toPrettyCard(cardCode),
          };
        })
        .filter(Boolean);

      if (created.length > 0) {
        setFlyingCards((prev) => [...prev, ...created]);

        created.forEach((card) => {
          window.setTimeout(() => {
            setFlyingCards((prev) => prev.filter((entry) => entry.id !== card.id));
          }, 820);
        });
      }
    }

    prevTrickRef.current = currentTrick;
  }, [d?.currentTrick]);

  const { isMobile, isMobileLandscape, height } = useViewport();
  const [showMobileScore, setShowMobileScore] = useState(false);

  const showRecentCards = appState.showRecentCards !== false;
  const showCenterTrickLabel = appState.showCenterTrickLabel !== false;

  const showTrumpInHeader =
    d?.roundPhase === 2 || contractId === "TROEF";

  const visibleTrumpLabel =
    showTrumpInHeader ? getTrumpLabel(d?.currentTrumpSuit) : "—";

  const centerAnimationSeed = `${trickCount}-${JSON.stringify(d?.currentTrick ?? [])}`;
  const mobileTableHeight = Math.max(320, height - (isMobileLandscape ? 150 : 220));

  const mobileGameTable = (
    <div style={{ position: "relative", minHeight: mobileTableHeight, height: mobileTableHeight }}>
      <TableDirection
        players={players}
        currentPlayerIndex={currentIndex}
        leaderPlayerIndex={leaderPlayerIndex}
        contractLabel={contractId ?? "—"}
        trumpLabel={visibleTrumpLabel}
        trickLabel={`${trickCount} / 13`}
        seatCards={seatCards}
        centerCards={centerCards}
        showCenterTrickLabel={false}
        showTopRightTrick={false}
        animationSeed={centerAnimationSeed}
        flyingCards={flyingCards}
        compactMobile
      />

      <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", gap: 8, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button onClick={onUndo} style={{ ...buttonStyle("primary"), padding: "8px 10px", fontSize: 13 }}>↻ Undo</button>
        </div>
        <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
          <button onClick={() => setShowMobileScore(true)} style={{ ...buttonStyle(), padding: "8px 12px", fontSize: 13 }}>Score</button>
          <button
            onClick={() => {
              const ok = window.confirm("Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen.");
              if (ok) onBackFromContract?.();
            }}
            style={{ ...buttonStyle("danger"), padding: "8px 10px", fontSize: 13 }}
          >← Terug</button>
        </div>
      </div>

      {showMobileScore ? (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(8,6,5,0.92)", backdropFilter: "blur(10px)", padding: 14, display: "grid", alignContent: "start", gap: 12, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 22 }}>Tussenstand</div>
            <button onClick={() => setShowMobileScore(false)} style={{ ...buttonStyle(), padding: "8px 12px" }}>Sluiten</button>
          </div>
          <Scoreboard
            players={players}
            scores={scoreboardScores}
            currentPlayerIndex={currentIndex}
            flashWinnerIndex={flashWinnerIndex}
            allowEdit={false}
            onAdjustScore={(playerIndex, delta) => dispatchAction?.({ type: "adjust_total_score", playerIndex, delta })}
          />
          {contractId === "TROEF" ? <TrickWinsPanel players={players} trickWins={trickWins} /> : null}
        </div>
      ) : null}
    </div>
  );

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
                padding: isMobile ? "10px 12px" : "12px 14px",
                border: "1px solid rgba(251, 191, 36, 0.34)",
                background: "rgba(120, 53, 15, 0.48)",
                fontWeight: 900,
                fontSize: isMobile ? 13 : 15,
              })}
            >
              {chooserBannerText}
            </div>
          )}

          <div style={isMobile ? { minHeight: Math.max(420, height - 150), overflow: "hidden" } : undefined}>
            <DobbelkingenPanel
              appState={appState}
              onClose={onCloseMode}
              onStart={onStartDobbelkingen}
              onChooseContract={onChooseDobbelkingenContract}
              dispatchAction={dispatchAction}
            />
          </div>
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
        isMobile ? (
          <>
            <ErrorBanner message={appState.lastError} />
            {trickToast ? (
              <AnimatedBanner key={trickToast.key} type="success" title={trickToast.title} message={trickToast.message} compact />
            ) : null}
            {mobileGameTable}
          </>
        ) : (
        <>
          <GameToolbar
            onUndo={onUndo}
            onBack={() => {
              const ok = window.confirm(
                "Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen."
              );
              if (ok) onBackFromContract?.();
            }}
          />

          <ErrorBanner message={appState.lastError} />

          {trickToast && (
            <AnimatedBanner
              key={trickToast.key}
              type="success"
              title={trickToast.title}
              message={trickToast.message}
              compact
            />
          )}

          <TableDirection
            players={players}
            currentPlayerIndex={currentIndex}
            leaderPlayerIndex={leaderPlayerIndex}
            contractLabel={contractId ?? "—"}
            trumpLabel={visibleTrumpLabel}
            trickLabel={`${trickCount} / 13`}
            seatCards={seatCards}
            centerCards={centerCards}
            showCenterTrickLabel={showCenterTrickLabel}
            showTopRightTrick={showCenterTrickLabel}
            animationSeed={centerAnimationSeed}
            flyingCards={flyingCards}
          />

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

          {contractId === "TROEF" && (
            <TrickWinsPanel players={players} trickWins={trickWins} />
          )}

          {showRecentCards && (
            <PlayedCardsPanel
              cardCodes={d?.usedCardCodes ?? appState.usedCardCodes ?? []}
            />
          )}

          {showDebug && appState.devMode && (
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
        )
      )}
    </div>
  );
}