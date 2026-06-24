import { useEffect, useMemo, useRef, useState } from "react";

import { Scoreboard } from "../Scoreboard";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { TableDirection } from "../TableDirection";
import { ContractEndOverlay } from "../ContractEndOverlay";
import { computeScoresFromTrickHistory } from "../../core/games/dobbelkingen/scoring";
import {
  getContractLabel as getKleurenContractLabel,
  getTrickWinsByPlayer as getKleurenTrickWins,
  getTrumpLabel as getKleurenTrumpLabel,
} from "../../core/games/kleurenwiezen";
import { EndScreen } from "../play/EndScreen";
import { GameToolbar } from "../play/GameToolbar";
import { useViewport } from "../play/useViewport";
import { buttonStyle, panelStyle } from "../play/theme";
import { AnimatedBanner } from "./playscreen/AnimatedBanner";
import { ErrorBanner } from "./playscreen/ErrorBanner";
import { PlayedCardsPanel } from "./playscreen/PlayedCardsPanel";
import { TrickWinsPanel } from "./playscreen/TrickWinsPanel";
import { DevPanel } from "./playscreen/DevPanel";
import { MobileScoreOverlay } from "./playscreen/MobileScoreOverlay";
import { getTrumpLabel, getTrickWinsByPlayer, toPrettyCard } from "./playscreen/cardFormatters";
import { KleurenwiezenPanel } from "../kleurenwiezen/KleurenwiezenPanel";
import { KleurenwiezenRoundPanel } from "../kleurenwiezen/KleurenwiezenRoundPanel";
import { DevCardSimulator } from "./playscreen/DevCardSimulator";
import { ConfirmModal } from "../components/ConfirmModal";
import { leds } from "../../transport/ledClient";

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
  onOpenKleurenwiezen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,
  mobileHeaderExpanded = true,
  onToggleMobileHeader,
  dispatchAction,
  onSimulateDevCard,
  onSimulateRandomContract,
}) {
  const [confirmAction, setConfirmAction] = useState(null);
  const lastKleurenwiezenAutoConfirmRef = useRef(null);

  const lastLedBaseRef = useRef(null);
  const lastLedScanOkRef = useRef(null);
  const lastLedErrorRef = useRef(null);
  const lastLedTrickWinRef = useRef(null);
  const lastAutoConfirmedPhysicalCardRef = useRef(null);
  const ledFxTimersRef = useRef([]);

  function clearLedFxTimers() {
    for (const timer of ledFxTimersRef.current) {
      window.clearTimeout(timer);
    }

    ledFxTimersRef.current = [];
  }

  function scheduleLedFx(callback, delay) {
    const timer = window.setTimeout(() => {
      ledFxTimersRef.current = ledFxTimersRef.current.filter((item) => item !== timer);
      callback();
    }, delay);

    ledFxTimersRef.current.push(timer);
    return timer;
  }

  const modeId = appState.modeId ?? null;
  const isDobbelkingen = modeId === "dobbelkingen";
  const isKleurenwiezen = modeId === "kleurenwiezen";

  const d = appState.game?.dobbelkingen ?? null;
  const k = appState.game?.kleurenwiezen ?? null;
  const activeSlice = isKleurenwiezen ? k : d;

  const players = appState.players ?? [];
  const playersCount = players.length || 4;

  const currentIndex =
    typeof activeSlice?.currentPlayerIndex === "number"
      ? activeSlice.currentPlayerIndex
      : typeof appState.currentPlayerIndex === "number"
        ? appState.currentPlayerIndex
        : 0;

  const contractLabel = isKleurenwiezen
    ? getKleurenContractLabel(activeSlice?.contractId)
    : activeSlice?.contract ?? null;

  const trickCount = activeSlice?.trickHistory?.length ?? 0;

  const scoreboardScores = isKleurenwiezen
    ? activeSlice?.totalScores ?? Array(playersCount).fill(0)
    : appState.phase === "PLAYING_TRICK"
      ? computeScoresFromTrickHistory(d?.trickHistory ?? [], playersCount)
      : d?.totalScores ?? [];

  const trickWins = isKleurenwiezen
    ? getKleurenTrickWins(activeSlice?.trickHistory ?? [], playersCount)
    : appState.phase === "PLAYING_TRICK"
      ? getTrickWinsByPlayer(d?.trickHistory ?? [], playersCount)
      : Array(playersCount).fill(0);

  const endedReason = isDobbelkingen ? d?.lastResult?.endedEarlyReason ?? null : null;
  const endedByIndex =
    isDobbelkingen && typeof d?.lastResult?.endedByPlayerIndex === "number"
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
    isDobbelkingen &&
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
        : "Alle 4 queens zijn gespeeld — terug naar contract keuze";

  const showChooserBanner =
    isDobbelkingen &&
    (appState.phase === "CHOOSING_CONTRACT" ||
      appState.phase === "CHOOSING_TROEF" ||
      appState.phase === "DOBBELKINGEN_READY") &&
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
    appState.phase === "CHOOSING_TROEF" ||
    appState.phase === "KLEURENWIEZEN_SETUP";
  const showGameUi = appState.phase === "PLAYING_TRICK";
  const showDoneUi = appState.phase === "DOBBELKINGEN_DONE";

  useEffect(() => {
    if (!showGameUi && !showLobby) {
      clearLedFxTimers();

      const key = `off|${appState.phase}`;
      if (lastLedBaseRef.current === key) return;

      lastLedBaseRef.current = key;
      leds.off();
      return;
    }

    if (showLobby) {
      clearLedFxTimers();

      const key = `setup|${modeId ?? "none"}|${appState.phase}`;
      if (lastLedBaseRef.current === key) return;

      lastLedBaseRef.current = key;
      leds.setup();
      return;
    }

    if (!showGameUi) return;

    const seatIndex =
      typeof currentIndex === "number" && currentIndex >= 0 ? currentIndex : 0;

    const key = [
      "turn",
      modeId ?? "none",
      seatIndex,
      activeSlice?.currentTrick?.length ?? 0,
      activeSlice?.trickHistory?.length ?? 0,
      activeSlice?.lastTrickWinnerIndex ?? "none",
      appState.lastError ? "error" : "ok",
    ].join("|");

    if (lastLedBaseRef.current === key) return;

    lastLedBaseRef.current = key;

    clearLedFxTimers();

    leds.turn(seatIndex);

    if (!appState.lastError) {
      scheduleLedFx(() => leds.turn(seatIndex), 300);
      scheduleLedFx(() => leds.turn(seatIndex), 800);
    }
  }, [
    showGameUi,
    showLobby,
    modeId,
    currentIndex,
    appState.phase,
    appState.lastError,
    activeSlice?.currentTrick?.length,
    activeSlice?.trickHistory?.length,
    activeSlice?.lastTrickWinnerIndex,
  ]);

  useEffect(() => {
    if (!showGameUi) return;
    if (!appState.lastError) return;

    clearLedFxTimers();

    const seatIndex =
      typeof currentIndex === "number" && currentIndex >= 0 ? currentIndex : 0;

    const key = [
      "error",
      modeId ?? "none",
      seatIndex,
      appState.lastError,
      zones?.[0] ?? "z0",
      zones?.[1] ?? "z1",
      zones?.[2] ?? "z2",
      zones?.[3] ?? "z3",
    ].join("|");

    if (lastLedErrorRef.current === key) return;

    lastLedErrorRef.current = key;

    leds.error(seatIndex);

    scheduleLedFx(() => leds.turn(seatIndex), 650);
    scheduleLedFx(() => leds.turn(seatIndex), 1100);
    scheduleLedFx(() => leds.turn(seatIndex), 1800);
  }, [
    showGameUi,
    modeId,
    currentIndex,
    appState.lastError,
    zones?.[0],
    zones?.[1],
    zones?.[2],
    zones?.[3],
  ]);

  useEffect(() => {
    if (!showGameUi) return;
    if (appState.lastError) return;

    const pile = activeSlice?.pile ?? [];
    if (!Array.isArray(pile) || pile.length === 0) return;

    const lastPlay = pile[pile.length - 1];
    const playerIndex = lastPlay?.playerIndex;
    const card = lastPlay?.cardCode ?? lastPlay?.card;
    const uid = lastPlay?.uid;

    if (typeof playerIndex !== "number" || playerIndex < 0 || !card) return;

    const key = [
      "scan-ok-played",
      modeId ?? "none",
      playerIndex,
      uid ?? "no-uid",
      card,
      pile.length,
    ].join("|");

    if (lastLedScanOkRef.current === key) return;

    lastLedScanOkRef.current = key;

    leds.scanOk(playerIndex);
  }, [
    showGameUi,
    modeId,
    appState.lastError,
    activeSlice?.pile,
  ]);

  useEffect(() => {
    if (!isKleurenwiezen) return;
    if (!showGameUi) return;
    if (!appState.autoConfirm) return;

    const turnCard = gameState?.turnCard;

    if (!turnCard?.uid || !turnCard?.card) {
      lastAutoConfirmedPhysicalCardRef.current = null;
      return;
    }

    const physicalCardKey = [
      turnCard.zone ?? "no-zone",
      turnCard.uid,
      turnCard.card,
    ].join("|");

    if (lastAutoConfirmedPhysicalCardRef.current === physicalCardKey) {
      return;
    }

    const currentPlayerKey =
      typeof activeSlice?.currentPlayerIndex === "number"
        ? activeSlice.currentPlayerIndex
        : 0;

    const autoConfirmKey = [
      "kleurenwiezen",
      currentPlayerKey,
      turnCard.zone,
      turnCard.uid,
      turnCard.card,
    ].join("|");

    if (lastKleurenwiezenAutoConfirmRef.current === autoConfirmKey) {
      return;
    }

    lastKleurenwiezenAutoConfirmRef.current = autoConfirmKey;
    lastAutoConfirmedPhysicalCardRef.current = physicalCardKey;

    const timer = window.setTimeout(() => {
      if (typeof onConfirmTurn === "function") {
        onConfirmTurn();
        return;
      }

      dispatchAction?.({ type: "confirm_turn" });
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isKleurenwiezen,
    showGameUi,
    appState.autoConfirm,
    gameState?.turnCard,
    activeSlice?.currentPlayerIndex,
    onConfirmTurn,
    dispatchAction,
  ]);

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

  function closeConfirm() {
    setConfirmAction(null);
  }

  async function runConfirmAction() {
    if (!confirmAction?.onConfirm) return;

    await confirmAction.onConfirm();
    setConfirmAction(null);
  }

  function requestBackFromContract() {
    setConfirmAction({
      title: "Contract verlaten?",
      message:
        "Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen.",
      confirmLabel: "Teruggaan",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        onBackFromContract?.();
      },
    });
  }

  const chooserIndex =
    appState.phase === "CHOOSING_TROEF"
      ? typeof d?.troefChooserIndex === "number"
        ? d.troefChooserIndex
        : 0
      : typeof d?.chooserIndex === "number"
        ? d.chooserIndex
        : currentIndex;

  const leaderPlayerIndex = isKleurenwiezen
    ? typeof activeSlice?.lastTrickWinnerIndex === "number"
      ? activeSlice.lastTrickWinnerIndex
      : typeof activeSlice?.leaderIndex === "number"
        ? activeSlice.leaderIndex
        : typeof activeSlice?.starterSeat === "number"
          ? activeSlice.starterSeat
          : 0
    : appState.phase === "CHOOSING_CONTRACT"
      ? (chooserIndex + 1) % playersCount
      : typeof d?.lastTrickWinnerIndex === "number"
        ? d.lastTrickWinnerIndex
        : typeof d?.currentContractStarterIndex === "number"
          ? d.currentContractStarterIndex
          : typeof d?.leaderIndex === "number"
            ? d.leaderIndex
            : (chooserIndex + 1) % playersCount;

  const dealerPlayerIndex = isKleurenwiezen
    ? typeof activeSlice?.dealerSeat === "number"
      ? activeSlice.dealerSeat
      : (leaderPlayerIndex + playersCount - 1) % playersCount
    : typeof d?.dealerSeat === "number"
      ? d.dealerSeat
      : (leaderPlayerIndex + playersCount - 1) % playersCount;

  const seatCards = useMemo(() => {
    return Array.from({ length: playersCount }, (_, index) => {
      const uid = zones?.[index] ?? null;
      const code = uid ? appState.mapping?.[uid] ?? null : null;
      return code ? toPrettyCard(code) : null;
    });
  }, [appState.mapping, playersCount, zones]);

  const centerCards = useMemo(() => {
    const currentTrick = activeSlice?.currentTrick ?? [];
    const result = Array(playersCount).fill(null);

    for (const play of currentTrick) {
      const playerIndex = play?.playerIndex;
      const cardCode = play?.cardCode ?? play?.card;
      if (typeof playerIndex === "number" && cardCode) {
        result[playerIndex] = toPrettyCard(cardCode);
      }
    }

    return result;
  }, [activeSlice?.currentTrick, playersCount]);

  const [flyingCards, setFlyingCards] = useState([]);
  const prevTrickRef = useRef([]);
  const [trickToast, setTrickToast] = useState(null);
  const [flashWinnerIndex, setFlashWinnerIndex] = useState(null);

   useEffect(() => {
    const winnerIdx = activeSlice?.lastTrickWinnerIndex;
    const ts =
      activeSlice?.lastTrick?.timestamp ??
      activeSlice?.trickHistory?.[activeSlice?.trickHistory?.length - 1]?.id ??
      activeSlice?.trickHistory?.length ??
      null;

    if (typeof winnerIdx !== "number" || !ts) return undefined;

    const key = `trick-toast-led|${modeId ?? "none"}|${winnerIdx}|${ts}`;

    if (lastLedTrickWinRef.current === key) return undefined;

    lastLedTrickWinRef.current = key;

    const name = players?.[winnerIdx]?.name ?? `Player ${winnerIdx + 1}`;

    setTrickToast({
      key: `trick-${ts}`,
      title: `${name} wint de slag`,
      message: "Volgende speler is nu aan zet.",
    });

    setFlashWinnerIndex(winnerIdx);

    clearLedFxTimers();

    // Forceer goud lang genoeg zichtbaar, ook als turn-led kort probeert te overschrijven.
    leds.trickWin(winnerIdx);
    scheduleLedFx(() => leds.trickWin(winnerIdx), 150);
    scheduleLedFx(() => leds.trickWin(winnerIdx), 350);
    scheduleLedFx(() => leds.trickWin(winnerIdx), 700);

    // Pas daarna terug naar winnaar, want die start normaal de volgende slag.
    scheduleLedFx(() => leds.turn(winnerIdx), 1600);
    scheduleLedFx(() => leds.turn(winnerIdx), 2200);

    const t1 = window.setTimeout(() => setTrickToast(null), 1200);
    const t2 = window.setTimeout(() => setFlashWinnerIndex(null), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [
    modeId,
    activeSlice?.lastTrick,
    activeSlice?.lastTrickWinnerIndex,
    activeSlice?.trickHistory,
    players,
  ]);

  useEffect(() => {
    const currentTrick = Array.isArray(activeSlice?.currentTrick)
      ? activeSlice.currentTrick
      : [];
    const prevTrick = Array.isArray(prevTrickRef.current)
      ? prevTrickRef.current
      : [];

    if (currentTrick.length < prevTrick.length) {
      prevTrickRef.current = currentTrick;
      return;
    }

    const newPlays = currentTrick.slice(prevTrick.length);

    if (newPlays.length > 0) {
      const created = newPlays
        .map((play, index) => {
          const playerIndex = play?.playerIndex;
          const cardCode = play?.cardCode ?? play?.card;
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
  }, [activeSlice?.currentTrick]);

  const { isMobile, isMobileLandscape, height } = useViewport();
  const [showMobileScore, setShowMobileScore] = useState(false);

  const showRecentCards = appState.showRecentCards !== false;
  const showCenterTrickLabel = appState.showCenterTrickLabel !== false;

  const visibleTrumpLabel = isKleurenwiezen
    ? getKleurenTrumpLabel(activeSlice?.trumpSuit)
    : d?.roundPhase === 2 || contractLabel === "TROEF"
      ? getTrumpLabel(d?.currentTrumpSuit)
      : "—";

  const centerAnimationSeed = `${trickCount}-${JSON.stringify(activeSlice?.currentTrick ?? [])}`;
  const mobileTableHeight = Math.max(
    isMobileLandscape ? 300 : 540,
    height - (isMobileLandscape ? 26 : 32)
  );

  const mobileTopOverlayOffset = 6;
  const mobileControlsHeight = isMobileLandscape ? 40 : 42;
  const mobileLobbyHeight = Math.max(
    appState.phase === "CHOOSING_TROEF" ? 520 : 420,
    height - 112
  );

  const mobileTopButtonStyle = {
    minHeight: mobileControlsHeight,
    padding: isMobileLandscape ? "6px 8px" : "7px 9px",
    fontSize: isMobileLandscape ? 11 : 12,
    pointerEvents: "auto",
    whiteSpace: "nowrap",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
    opacity: 0.92,
  };

  const mobileGameTable = (
    <div
      style={{
        position: "relative",
        minHeight: mobileTableHeight,
        height: mobileTableHeight,
        overflow: "hidden",
      }}
    >
      <TableDirection
        players={players}
        currentPlayerIndex={currentIndex}
        leaderPlayerIndex={leaderPlayerIndex}
        dealerPlayerIndex={dealerPlayerIndex}
        contractLabel={contractLabel ?? "—"}
        trumpLabel={visibleTrumpLabel}
        trickLabel={`${trickCount} / 13`}
        seatCards={seatCards}
        centerCards={centerCards}
        showCenterTrickLabel={false}
        showTopRightTrick={false}
        animationSeed={centerAnimationSeed}
        flyingCards={flyingCards}
        compactMobile
        mobileLandscape={isMobileLandscape}
        mobileTableHeight={mobileTableHeight - (isMobileLandscape ? 2 : 8)}
        mobileTopInset={mobileControlsHeight + 8}
      />

      <div
        style={{
          position: "absolute",
          top: mobileTopOverlayOffset,
          left: 8,
          right: 8,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
          pointerEvents: "none",
          zIndex: 12,
        }}
      >
        <button
          onClick={onToggleMobileHeader}
          style={{ ...buttonStyle(), ...mobileTopButtonStyle }}
        >
          Header
        </button>

        <button
          onClick={onUndo}
          style={{ ...buttonStyle("primary"), ...mobileTopButtonStyle }}
        >
          ↻ Undo
        </button>

        <button
          onClick={() => setShowMobileScore(true)}
          style={{ ...buttonStyle(), ...mobileTopButtonStyle }}
        >
          Score
        </button>

        <button
          onClick={requestBackFromContract}
          style={{ ...buttonStyle("danger"), ...mobileTopButtonStyle }}
        >
          ← Terug
        </button>
      </div>

      <MobileScoreOverlay
        showMobileScore={showMobileScore}
        setShowMobileScore={setShowMobileScore}
        isMobileLandscape={isMobileLandscape}
        players={players}
        currentIndex={currentIndex}
        contractId={contractLabel}
        scoreboardScores={scoreboardScores}
        trickWins={trickWins}
      />
    </div>
  );

  return (
    <div
      style={{
        display: "grid",
        gap: showGameUi && isMobile ? 0 : 14,
        overflow: showGameUi && isMobile ? "hidden" : undefined,
      }}
    >
      <ContractEndOverlay
        open={showContractOverlay}
        title={overlayTitle}
        message={overlayMessage}
        onClose={() => dispatchAction?.({ type: "close_contract_overlay" })}
      />

      {showModesHome && (
        <GameModeCards
          onOpenDobbelkingen={onOpenDobbelkingen}
          onOpenKleurenwiezen={onOpenKleurenwiezen}
        />
      )}

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

          <div
            style={
              isMobile
                ? {
                    minHeight: mobileLobbyHeight,
                    height: mobileLobbyHeight,
                    minWidth: 0,
                    overflowY:
                      appState.phase === "CHOOSING_TROEF" ? "hidden" : "auto",
                    overflowX: "hidden",
                    WebkitOverflowScrolling: "touch",
                  }
                : undefined
            }
          >
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

      {showLobby && appState.activeMode === "KLEURENWIEZEN" && (
        <KleurenwiezenPanel
          appState={appState}
          onClose={onCloseMode}
          dispatchAction={dispatchAction}
        />
      )}

      {showDoneUi && (
        <EndScreen
          summary={d?.matchSummary}
          onNewGame={onStartDobbelkingen}
          onBackHome={onCloseMode}
        />
      )}

      {showGameUi &&
        (isMobile ? (
          <>
            <ErrorBanner message={appState.lastError} />

            {trickToast ? (
              <AnimatedBanner
                key={trickToast.key}
                type="success"
                title={trickToast.title}
                message={trickToast.message}
                compact
              />
            ) : null}

            {mobileGameTable}

            {isKleurenwiezen ? (
              <KleurenwiezenRoundPanel
                appState={appState}
                dispatchAction={dispatchAction}
              />
            ) : null}
          </>
        ) : (
          <>
            <GameToolbar
              onUndo={onUndo}
              onBack={requestBackFromContract}
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
              dealerPlayerIndex={dealerPlayerIndex}
              contractLabel={contractLabel ?? "—"}
              trumpLabel={visibleTrumpLabel}
              trickLabel={`${trickCount} / 13`}
              seatCards={seatCards}
              centerCards={centerCards}
              showCenterTrickLabel={showCenterTrickLabel}
              showTopRightTrick={showCenterTrickLabel}
              animationSeed={centerAnimationSeed}
              flyingCards={flyingCards}
            />

            {showDebug && appState.devMode && (
              <DevCardSimulator
                currentTurnZone={gameState?.expectedZone ?? currentIndex + 1}
                currentTurnPlayerName={
                  players?.[currentIndex]?.name ?? `Player ${currentIndex + 1}`
                }
                onSimulateDevCard={onSimulateDevCard}
                onSimulateRandomContract={onSimulateRandomContract}
              />
            )}

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

            {isDobbelkingen && contractLabel === "TROEF" ? (
              <TrickWinsPanel players={players} trickWins={trickWins} />
            ) : null}

            {isKleurenwiezen ? (
              <KleurenwiezenRoundPanel
                appState={appState}
                dispatchAction={dispatchAction}
              />
            ) : null}

            {showRecentCards && (
              <PlayedCardsPanel
                cardCodes={activeSlice?.usedCardCodes ?? appState.usedCardCodes ?? []}
              />
            )}

            {showDebug && appState.devMode && (
              <DevPanel
                appState={appState}
                d={activeSlice}
                zonesForGrid={zonesForGrid}
                DISPLAY_ZONES={DISPLAY_ZONES}
                turnZoneForGrid={turnZoneForGrid}
                cardNamesForGrid={cardNamesForGrid}
                handleGridClick={handleGridClick}
                onConfirmTurn={onConfirmTurn}
                onResetPile={onResetPile}
                dispatchAction={dispatchAction}
                onSimulateRandomContract={onSimulateRandomContract}
              />
            )}
          </>
        ))}

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
    </div>
  );
}