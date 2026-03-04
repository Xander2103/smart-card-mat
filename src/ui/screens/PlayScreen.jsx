// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { TableDirection } from "../TableDirection";
import { ContractEndOverlay } from "../ContractEndOverlay"; // ✅ toevoegen

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

  const chooserName = chooserIndex !== null ? players[chooserIndex]?.name ?? "-" : "-";
  const leaderName = leaderIndex !== null ? players[leaderIndex]?.name ?? "-" : "-";
  const currentName = players[currentIndex]?.name ?? "-";

  const contractId = d?.contract ?? null;

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
  const [showContractOverlay, setShowContractOverlay] = useState(false);

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

  // -------------------------
  // ✅ Contract end overlay + banner (HARTEN_KONING)
  // -------------------------
  const endedReason = d?.lastResult?.endedEarlyReason ?? null;
  const showHeartsKingEnded = endedReason === "HEARTS_KING_PLAYED";

  useEffect(() => {
    if (showHeartsKingEnded) {
      setShowContractOverlay(true);

      const t = setTimeout(() => {
        setShowContractOverlay(false);
      }, 2000);

      return () => clearTimeout(t);
    }
  }, [showHeartsKingEnded]);

  const endedByIndex =
    typeof d?.lastResult?.endedByPlayerIndex === "number"
      ? d.lastResult.endedByPlayerIndex
      : null;

  const endedByName =
    endedByIndex !== null ? players?.[endedByIndex]?.name ?? `Player ${endedByIndex + 1}` : null;

  const overlayTitle = "Harten Koning gespeeld 👑♥ — contract beëindigd";
  const overlayMessage = endedByName
    ? `${endedByName} krijgt -5`
    : "Speler krijgt -5";

  // banner enkel in contract chooser screen, en blijft staan tot nieuw contract gekozen wordt
  const showChooserBanner = showLobby && appState.phase === "CHOOSING_CONTRACT" && showHeartsKingEnded;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* ✅ overlay kan overal renderen; het sluit zichzelf na 2.5s */}
      <ContractEndOverlay
        open={showHeartsKingEnded}
        title={overlayTitle}
        message={overlayMessage}
        onClose={() => {setShowContractOverlay(false)
          // overlay sluit automatisch, we doen hier bewust niets.
          // banner blijft staan tot nieuw contract gekozen wordt (choose_contract wist lastResult).
        }}
      />

      {/* A) HOME: alleen game modes */}
      {showModesHome && <GameModeCards onOpenDobbelkingen={onOpenDobbelkingen} />}

      {/* B) LOBBY: dobbelkingen panel */}
      {showLobby && appState.activeMode === "DOBBELKINGEN" && (
        <>
          {/* ✅ banner blijft zichtbaar in chooser tot je nieuw contract kiest */}
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
              ❤️‍🔥 {overlayTitle} — {overlayMessage}
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

          {/* ✅ Slag toast */}
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

          {/* ✅ Grote UX: tafel view (wie zit waar + turn pulse) */}
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