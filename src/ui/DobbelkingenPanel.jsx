// src/ui/DobbelkingenPanel.jsx
import { useState } from "react";
import { Scoreboard } from "./Scoreboard";
import { getContract } from "../core/games/dobbelkingen/contracts";

function pillStyle() {
  return {
    border: "1px solid #eee",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "white",
  };
}

function cardStyle(disabled, hovered = false) {
  return {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    background: disabled ? "#fafafa" : "white",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "grid",
    gap: 6,
    transition: "all 0.15s ease",
    transform: hovered && !disabled ? "translateY(-2px) scale(1.01)" : "none",
    boxShadow: hovered && !disabled ? "0 10px 24px rgba(15, 23, 42, 0.08)" : "none",
  };
}

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

const TROEF_OPTIONS = [
  { suit: "H", label: "Harten", symbol: "♥", color: "#c62828" },
  { suit: "D", label: "Ruiten", symbol: "♦", color: "#c62828" },
  { suit: "C", label: "Klaveren", symbol: "♣", color: "#111827" },
  { suit: "S", label: "Schoppen", symbol: "♠", color: "#111827" },
];

export function DobbelkingenPanel({
  appState,
  onClose,
  onStart,
  onChooseContract,
  dispatchAction,
}) {
  const [hoveredContract, setHoveredContract] = useState(null);
  const [hoveredTroef, setHoveredTroef] = useState(null);

  const d = appState?.game?.dobbelkingen ?? null;
  const players = appState?.players ?? [];
  const playersCount = players.length || 4;

  const phase = appState?.phase ?? "-";

  const chooserIndex =
    phase === "CHOOSING_TROEF"
      ? typeof d?.troefChooserIndex === "number"
        ? d.troefChooserIndex
        : 0
      : typeof d?.chooserIndex === "number"
        ? d.chooserIndex
        : 0;

  const leaderIndex =
    phase === "CHOOSING_TROEF"
      ? (chooserIndex + 1) % playersCount
      : typeof d?.leaderIndex === "number"
        ? d.leaderIndex
        : 0;

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

  function canPick(contractId) {
    if (!contractId) return false;
    if (lastContract === contractId) return false;
    const n = plays?.[contractId] ?? 0;
    if (n >= 2) return false;
    return true;
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#fafafa",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>Dobbelkingen</div>
        <button
          onClick={onClose}
          style={{
            border: "1px solid #eee",
            background: "white",
            borderRadius: 12,
            padding: "8px 12px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Terug
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <div style={pillStyle()}>Phase: <b>{phase}</b></div>
        <div style={pillStyle()}>RoundPhase: <b>{d?.roundPhase ?? 1}</b></div>
        <div style={pillStyle()}>Chooser: <b>{chooserName}</b></div>
        <div style={pillStyle()}>Leader: <b>{leaderName}</b></div>
        <div style={pillStyle()}>Current: <b>{currentName}</b></div>
        <div style={pillStyle()}>Contract: <b>{d?.contract ?? "-"}</b></div>
        <div style={pillStyle()}>Troef: <b>{getTrumpLabel(d?.currentTrumpSuit)}</b></div>
      </div>

      {appState.phase === "DOBBELKINGEN_READY" && (
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onStart}
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Start Dobbelkingen
          </button>

          <button
            onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Debug: ga naar fase 2
          </button>
        </div>
      )}

      {appState.phase === "CHOOSING_CONTRACT" && (
        <>
          <div style={{ marginTop: 14, textAlign: "center", fontWeight: 900 }}>
            {chooserName} kiest een spel:
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {contractList.map((id) => {
              const c = getContract(id);
              const label = c?.label ?? id;
              const desc = c?.desc ?? "";
              const n = plays?.[id] ?? 0;
              const disabled = !canPick(id);
              const hovered = hoveredContract === id;

              return (
                <div
                  key={id}
                  style={cardStyle(disabled, hovered)}
                  onMouseEnter={() => setHoveredContract(id)}
                  onMouseLeave={() => setHoveredContract(null)}
                  onClick={() => {
                    if (disabled) return;
                    onChooseContract?.(id);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{label}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>
                      ({n}/2)
                    </div>
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.8 }}>{desc}</div>

                  {disabled && lastContract === id && (
                    <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>
                      Niet 2× na elkaar
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <Scoreboard
              players={players}
              scores={d?.totalScores ?? Array(playersCount).fill(0)}
              currentPlayerIndex={currentIndex}
              flashWinnerIndex={null}
              allowEdit={true}
              onAdjustScore={(playerIndex, delta) =>
                dispatchAction?.({
                  type: "adjust_total_score",
                  playerIndex,
                  delta,
                })
              }
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Debug: ga naar fase 2
            </button>
          </div>
        </>
      )}

      {appState.phase === "CHOOSING_TROEF" && (
        <>
          <div style={{ marginTop: 14, textAlign: "center", fontWeight: 900 }}>
            {chooserName} kiest troef
          </div>

          <div
            style={{
              marginTop: 6,
              textAlign: "center",
              fontSize: 13,
              opacity: 0.8,
              fontWeight: 700,
            }}
          >
            {leaderName} komt uit
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {TROEF_OPTIONS.map((opt) => {
              const hovered = hoveredTroef === opt.suit;

              return (
                <div
                  key={opt.suit}
                  style={cardStyle(false, hovered)}
                  onMouseEnter={() => setHoveredTroef(opt.suit)}
                  onMouseLeave={() => setHoveredTroef(null)}
                  onClick={() =>
                    dispatchAction?.({
                      type: "choose_troef_suit",
                      suit: opt.suit,
                    })
                  }
                >
                  <div style={{ fontWeight: 900, fontSize: 18, color: opt.color }}>
                    {opt.symbol} {opt.label}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    Gekozen door {chooserName}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Troef-keuzes</div>

            <div style={{ display: "grid", gap: 8 }}>
              {players.map((p, index) => (
                <div
                  key={p.id ?? index}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "white",
                  }}
                >
                  <div>{p.name ?? `Player ${index + 1}`}</div>
                  <div style={{ fontWeight: 900 }}>
                    {troefPickCounts?.[index] ?? 0}/2 gekozen
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Scoreboard
              players={players}
              scores={d?.totalScores ?? Array(playersCount).fill(0)}
              currentPlayerIndex={currentIndex}
              flashWinnerIndex={null}
              allowEdit={true}
              onAdjustScore={(playerIndex, delta) =>
                dispatchAction?.({
                  type: "adjust_total_score",
                  playerIndex,
                  delta,
                })
              }
            />
          </div>
        </>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>History</div>

          <div style={{ display: "grid", gap: 8 }}>
            {[...history].slice().reverse().map((entry, index) => (
              <div
                key={`${entry.contract}-${entry.timestamp ?? index}-${index}`}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 14,
                  background: "white",
                }}
              >
                <b>{entry.label ?? entry.contract}</b>{" "}
                {entry.trumpSuit ? `(${getTrumpLabel(entry.trumpSuit)}) ` : ""}
                — gespeeld door{" "}
                <b>{players?.[entry.chooserIndex]?.name ?? `Player ${(entry.chooserIndex ?? 0) + 1}`}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}