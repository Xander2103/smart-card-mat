// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { TableDirection } from "../TableDirection";
import { ContractEndOverlay } from "../ContractEndOverlay";

import { useEffect, useMemo, useState } from "react";

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

  // mode flow
  onOpenDobbelkingen,
  onCloseMode,
  onStartDobbelkingen,
  onChooseDobbelkingenContract,

  // action dispatcher voor overlay close
  dispatchAction,
}) {
  // -------------------------
  // Dobbelkingen slice (1 bron)
  // -------------------------
  const d = appState.game?.dobbelkingen ?? null;
  const players = appState.players ?? [];

  const chooserIndex = typeof d?.chooserIndex === "number" ? d.chooserIndex : null;
  const leaderIndex = typeof d?.leaderIndex === "number" ? d.leaderIndex : null;
  const currentIndex =
    typeof d?.currentPlayerIndex === "number"
      ? d.currentPlayerIndex
      : typeof appState.currentPlayerIndex === "number"
      ? appState.currentPlayerIndex
      : 0;

  const currentName = players[currentIndex]?.name ?? "-";
  const contractId = d?.contract ?? null;

  // -------------------------
  // Contract end overlay + chooser banner
  // -------------------------
  const endedReason = d?.lastResult?.endedEarlyReason ?? null;

  // who got the penalty (used by HEARTS_KING overlay)
  const endedByIndex =
    typeof d?.lastResult?.endedByPlayerIndex === "number"
      ? d.lastResult.endedByPlayerIndex
      : null;

  const endedByName =
    endedByIndex !== null ? players?.[endedByIndex]?.name ?? `Player ${endedByIndex + 1}` : null;

  // reasons
  const isHeartsKingEnded = endedReason === "HEARTS_KING_PLAYED";
  const isAllJkEnded = endedReason === "ALL_JK_PLAYED";
  const isAllQueensEnded = endedReason === "ALL_QUEENS_PLAYED";

  // overlay visible only in PLAYING_TRICK and can be closed with OK
  const showContractOverlay =
    (isHeartsKingEnded || isAllJkEnded || isAllQueensEnded) &&
    appState.phase === "PLAYING_TRICK" &&
    d?.lastResult?.overlayClosed !== true;

  // overlay text
  const overlayTitle = isHeartsKingEnded
    ? "Harten Koning gespeeld 👑♥ — contract beëindigd"
    : isAllJkEnded
    ? "Alle boeren & koningen gespeeld 👑🃏 — contract beëindigd"
    : "Alle queens gespeeld 👑👑 — contract beëindigd";

  const overlayMessage = isHeartsKingEnded
    ? endedByName
      ? `${endedByName} krijgt -5`
      : "Speler krijgt -5"
    : isAllJkEnded
    ? "Alle J & K zijn gevallen — terug naar contract keuze"
    : "Alle 4 queens zijn gevallen — terug naar contract keuze";

  // banner in chooser stays until a new contract is chosen (because lastResult stays)
  const showChooserBanner =
    (appState.phase === "CHOOSING_CONTRACT" || appState.phase === "DOBBELKINGEN_READY") &&
    appState.activeMode === "DOBBELKINGEN" &&
    (isHeartsKingEnded || isAllJkEnded || isAllQueensEnded);

  const chooserBannerText = isHeartsKingEnded
    ? `❤️‍🔥 ${overlayTitle} — ${overlayMessage}`
    : isAllJkEnded
    ? `🃏 ${overlayTitle} — ${overlayMessage}`
    : `👑 ${overlayTitle} — ${overlayMessage}`;

  // -------------------------
  // Screens
  // -------------------------
  const showModesHome = appState.phase === "HOME";
  const showLobby =
    appState.phase === "DOBBELKINGEN_READY" || appState.phase === "CHOOSING_CONTRACT";
  const showGameUi = appState.phase === "PLAYING_TRICK";

  // -------------------------
  // Mat layout (zone mapping)
  // -------------------------
  // Mat layout:
  // Zone 1 = linksboven, Zone 2 = rechtsboven, Zone 4 = linksonder, Zone 3 = rechtsonder
  const DISPLAY_ZONES = useMemo(() => [1, 2, 4, 3], []);

  const zonesForGrid = DISPLAY_ZONES.map((z) => zones?.[z - 1] ?? null);
  const cardNamesForGrid = DISPLAY_ZONES.map((z) => cardNames?.[z - 1] ?? null);

  // ZoneGrid verwacht turnZone als gridPos (1..4)
  // gameState.expectedZone is echte zone (1..4)
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

  // -------------------------
  // Slag indicator (toast + scoreboard flash)
  // -------------------------
  const [trickToast, setTrickToast] = useState(null);
  const [flashWinnerIndex, setFlashWinnerIndex] = useState(null);

  useEffect(() => {
    const winnerIdx = d?.lastTrickWinnerIndex;
    const ts = d?.lastTrick?.timestamp ?? null;
    if (typeof winnerIdx !== "number" || !ts) return;

    const name = players?.[winnerIdx]?.name ?? `Player ${winnerIdx + 1}`;

    setTrickToast({
      key: `trick-${ts}`,
      title: `🏆 ${name} wint de slag`,
    });

    setFlashWinnerIndex(winnerIdx);

    const t1 = window.setTimeout(() => setTrickToast(null), 1200);
    const t2 = window.setTimeout(() => setFlashWinnerIndex(null), 800);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [d?.lastTrick?.timestamp, d?.lastTrickWinnerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Overlay: OK sluit hem */}
      <ContractEndOverlay
        open={showContractOverlay}
        title={overlayTitle}
        message={overlayMessage}
        onClose={() => dispatchAction?.({ type: "close_contract_overlay" })}
      />

      {/* A) HOME: alleen game modes */}
      {showModesHome && <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />}

      {/* B) LOBBY: dobbelkingen panel */}
      {showLobby && appState.activeMode === "DOBBELKINGEN" && (
        <>
          {/* banner in chooser blijft staan tot nieuw contract gekozen */}
          {showChooserBanner && (
            <div
              style={{
                border: "1px solid #ffe58f",
                background: "#fffbe6",
                borderRadius: 14,
                padding: "12px 14px",
                fontWeight: 900,
              }}
            >
              {chooserBannerText}
            </div>
          )}

          <DobbelkingenPanel
            appState={appState}
            onClose={onCloseMode}
            onStart={onStartDobbelkingen}
            onChooseContract={onChooseDobbelkingenContract}
          />
        </>
      )}

      {/* C) IN-GAME UI */}
      {showGameUi && (
        <>
          {/* ERROR */}
          {appState.lastError && (
            <div
              style={{
                border: "2px solid #ff4d4f",
                background: "#fff1f0",
                color: "#a8071a",
                borderRadius: 14,
                padding: "14px 16px",
                fontWeight: 800,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>🚫 {appState.lastError}</div>
              <button
                onClick={() => {
                  // optioneel later: dispatchAction({type:"clear_error"})
                }}
                style={{
                  border: "1px solid #ff4d4f",
                  background: "white",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          )}

          {/* controls bar */}
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={onConfirmTurn}
                disabled={!gameState?.canConfirm || appState.autoConfirm}
              >
                Confirm turn (manual)
              </button>

              <button onClick={onUndo}>Undo last play</button>
              <button onClick={onResetPile}>Reset pile</button>

              <button
                onClick={() => {
                  const ok = window.confirm(
                    "Zeker dat je terug wil? Dit stopt het huidige contract en reset de huidige slagen."
                  );
                  if (ok) onBackFromContract?.();
                }}
              >
                ← Terug
              </button>

              <div style={{ marginLeft: "auto" }}>
                Mode: <b>{appState.gameMode ?? "-"}</b> • Contract:{" "}
                <b>{contractId ?? "-"}</b> • TurnZone: <b>{turnZone ?? "-"}</b> • Current:{" "}
                <b>{currentName}</b>
              </div>
            </div>
          </div>

          {/* Slag toast */}
          {trickToast && (
            <div
              key={trickToast.key}
              style={{
                border: "1px solid #d9f7be",
                background: "#f6ffed",
                borderRadius: 14,
                padding: "10px 12px",
                fontWeight: 900,
              }}
            >
              {trickToast.title}
            </div>
          )}

          {/* Tafel view */}
          <TableDirection players={players} currentPlayerIndex={currentIndex} />

          {/* zones */}
          <ZoneGrid
            zones={zonesForGrid}
            zoneNumbers={DISPLAY_ZONES}
            turnZone={turnZoneForGrid}
            cardNames={cardNamesForGrid}
            onZoneClick={handleGridClick}
          />

          {/* scores + highlight winner */}
          <Scoreboard
            players={players}
            scores={gameState?.scores ?? []}
            currentPlayerIndex={currentIndex}
            flashWinnerIndex={flashWinnerIndex}
          />

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            <b>Played cards:</b>{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {(d?.usedCardCodes ?? appState.usedCardCodes ?? [])
                .slice(-20)
                .join(" • ") || "-"}
            </span>
          </div>

          {/* debug */}
          {showDebug && (
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Debug log</h3>
              <DebugLog lines={appState.log} />
            </div>
          )}
        </>
      )}
    </div>
  );
}