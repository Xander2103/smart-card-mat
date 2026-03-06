// src/ui/screens/PlayScreen.jsx
import { ZoneGrid } from "../ZoneGrid";
import { Scoreboard } from "../Scoreboard";
import { DebugLog } from "../DebugLog";
import { GameModeCards } from "../GameModeCards";
import { DobbelkingenPanel } from "../DobbelkingenPanel";
import { TableDirection } from "../TableDirection";
import { ContractEndOverlay } from "../ContractEndOverlay";

import { useEffect, useMemo, useState } from "react";
import { computeScoresFromTrickHistory } from "../../core/games/dobbelkingen/scoring";

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
      return "-";
  }
}

function getTrickWinsByPlayer(trickHistory, playersCount) {
  const wins = Array(playersCount).fill(0);

  for (const trick of trickHistory ?? []) {
    const winnerIndex = trick?.winnerIndex;
    if (
      typeof winnerIndex === "number" &&
      winnerIndex >= 0 &&
      winnerIndex < playersCount
    ) {
      wins[winnerIndex] += 1;
    }
  }

  return wins;
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

  const currentName = players[currentIndex]?.name ?? "-";
  const contractId = d?.contract ?? null;

  const scoreboardScores =
    appState.phase === "PLAYING_TRICK"
      ? computeScoresFromTrickHistory(d?.trickHistory ?? [], playersCount)
      : (d?.totalScores ?? []);

  const trickWins =
    appState.phase === "PLAYING_TRICK"
      ? getTrickWinsByPlayer(d?.trickHistory ?? [], playersCount)
      : Array(playersCount).fill(0);

  const trickCount = d?.trickHistory?.length ?? 0;

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
        : "Alle queens gespeeld 👑👑 — contract beëindigd";

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
    (
      appState.phase === "CHOOSING_CONTRACT" ||
      appState.phase === "CHOOSING_TROEF" ||
      appState.phase === "DOBBELKINGEN_READY"
    ) &&
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

  const leaderPlayerIndex =
    typeof d?.lastTrickWinnerIndex === "number"
      ? d.lastTrickWinnerIndex
      : typeof d?.currentContractStarterIndex === "number"
        ? d.currentContractStarterIndex
        : null;

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
    const t2 = window.setTimeout(() => setFlashWinnerIndex(null), 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [d?.lastTrick?.timestamp, d?.lastTrickWinnerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "grid", gap: 12 }}>
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
            dispatchAction={dispatchAction}
          />
        </>
      )}

      {showGameUi && (
        <>
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
                onClick={() => {}}
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

          <div
            style={{
              border: "1px solid #e5e7eb",
              background: "#fafafa",
              borderRadius: 14,
              padding: 12,
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
            }}
          >
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
                <b>{contractId ?? "-"}</b> • Troef:{" "}
                <b>{getTrumpLabel(d?.currentTrumpSuit)}</b> • Slag: <b>{trickCount} / 13</b> • TurnZone:{" "}
                <b>{turnZone ?? "-"}</b> • Current: <b>{currentName}</b>
              </div>
            </div>
          </div>

          {trickToast && (
            <div
              key={trickToast.key}
              style={{
                border: "1px solid #86efac",
                background: "#f0fdf4",
                borderRadius: 14,
                padding: "10px 12px",
                fontWeight: 900,
                boxShadow: "0 8px 20px rgba(34, 197, 94, 0.12)",
              }}
            >
              {trickToast.title}
            </div>
          )}

          <TableDirection
            players={players}
            currentPlayerIndex={currentIndex}
            leaderPlayerIndex={leaderPlayerIndex}
          />

          <ZoneGrid
            zones={zonesForGrid}
            zoneNumbers={DISPLAY_ZONES}
            turnZone={turnZoneForGrid}
            cardNames={cardNamesForGrid}
            trumpSuit={d?.currentTrumpSuit ?? null}
            onZoneClick={handleGridClick}
          />

          <Scoreboard
            players={players}
            scores={scoreboardScores}
            currentPlayerIndex={currentIndex}
            flashWinnerIndex={flashWinnerIndex}
            allowEdit={appState.phase === "CHOOSING_CONTRACT" || appState.phase === "CHOOSING_TROEF"}
            onAdjustScore={(playerIndex, delta) =>
              dispatchAction?.({ type: "adjust_total_score", playerIndex, delta })
            }
          />

          {contractId === "TROEF" && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                background: "#fafafa",
                borderRadius: 14,
                padding: 12,
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Slagen fase 2</div>

              <div style={{ display: "grid", gap: 8 }}>
                {players.map((player, index) => (
                  <div
                    key={player.id ?? index}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "white",
                    }}
                  >
                    <div>{player.name ?? `Player ${index + 1}`}</div>
                    <div style={{ fontWeight: 900 }}>{trickWins[index] ?? 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            <b>Played cards:</b>{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {(d?.usedCardCodes ?? appState.usedCardCodes ?? [])
                .slice(-20)
                .join(" • ") || "-"}
            </span>
          </div>

          {showDebug && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                background: "#fafafa",
                borderRadius: 14,
                padding: 12,
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Debug log</h3>
              <DebugLog lines={appState.log} />
            </div>
          )}
        </>
      )}
    </div>
  );
}