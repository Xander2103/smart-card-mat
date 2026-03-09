// src/ui/DobbelkingenPanel.jsx
import { useState } from "react";
import { getContract } from "../core/games/dobbelkingen/contracts";
import { DobbelkingenInfo } from "./dobbelkingen/DobbelkingenInfo";
import { Scoreboard } from "./Scoreboard";
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

function MiniStat({ label, value, accent = colors.blue }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: "8px 12px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 12, color: colors.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</span>
      <span style={{ fontWeight: 900, color: accent }}>{value}</span>
    </div>
  );
}

function ContractCard({ label, desc, count, disabled, reason, hovered, onMouseEnter, onMouseLeave, onClick }) {
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
          background: hovered && !disabled ? "rgba(251, 191, 36, 0.10)" : "rgba(255,255,255,0.04)",
          border: hovered && !disabled ? "1px solid rgba(251, 191, 36, 0.30)" : "1px solid rgba(255,255,255,0.08)",
        }),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 17 }}>{label}</div>
        <div
          style={{
            borderRadius: 999,
            padding: "4px 8px",
            background: count >= 2 ? colors.redSoft : colors.accentSoft,
            color: count >= 2 ? "#fecdd3" : "#fcd34d",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {count}/2
        </div>
      </div>

      <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: disabled ? "#fda4af" : colors.muted }}>
        {reason || "Beschikbaar om te kiezen"}
      </div>
    </button>
  );
}

function HistoryItem({ children }) {
  return (
    <div style={softCardStyle({ padding: "10px 12px", background: "rgba(255,255,255,0.04)" })}>
      {children}
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
  const { isMobile, isTablet } = useViewport();

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
    phase === "CHOOSING_TROEF" || phase === "CHOOSING_CONTRACT"
      ? (chooserIndex + 1) % playersCount
      : typeof d?.leaderIndex === "number"
        ? d.leaderIndex
        : (chooserIndex + 1) % playersCount;

  const currentIndex = typeof d?.currentPlayerIndex === "number" ? d.currentPlayerIndex : 0;

  const chooserName = players?.[chooserIndex]?.name ?? `Player ${chooserIndex + 1}`;
  const leaderName = players?.[leaderIndex]?.name ?? `Player ${leaderIndex + 1}`;
  const currentName = players?.[currentIndex]?.name ?? `Player ${currentIndex + 1}`;

  const contractList = d?.contracts ?? [];
  const plays = d?.contractPlays ?? {};
  const lastContract = d?.lastContract ?? null;
  const troefPickCounts = d?.troefPickCounts ?? [];
  const history = d?.history ?? [];

  function getContractDisabledReason(contractId) {
    if (lastContract === contractId) return "Niet 2× na elkaar";
    if ((plays?.[contractId] ?? 0) >= 2) return "Maximaal 2 keer gespeeld";
    return "";
  }

  function canPick(contractId) {
    if (!contractId) return false;
    return !getContractDisabledReason(contractId);
  }

  return (
    <>
      <DobbelkingenInfo open={showInfo} onClose={() => setShowInfo(false)} />

      <div style={panelStyle({ padding: 20, display: "grid", gap: 16 })}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 28 }}>Dobbelkingen</div>
            <div style={{ color: colors.muted, marginTop: 4 }}>
              Contractkeuzes, troefrondes en live score-opvolging op je Smart Card Mat.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>



            <button onClick={() => setShowInfo(true)} style={buttonStyle()}>
              Info
            </button>

            {appState.devMode && appState.phase === "CHOOSING_TROEF" && (
              <button onClick={() => dispatchAction?.({ type: "debug_finish_phase2_match" })} style={buttonStyle("success")}>
                Match afronden
              </button>
            )}

            <button onClick={onClose} style={buttonStyle("danger")}>
              Terug
            </button>
          </div>
        </div>

        <div
          style={softCardStyle({
            padding: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            background: "rgba(255,255,255,0.03)",
          })}
        >
          <MiniStat label="Fase" value={phase === "CHOOSING_CONTRACT" ? "Contractkeuze" : phase === "CHOOSING_TROEF" ? "Troefkeuze" : phase} accent={colors.accent} />
          <MiniStat label="Ronde" value={String(d?.roundPhase ?? 1)} accent={colors.green} />
          <MiniStat label="Kiest" value={chooserName} accent={colors.blue} />
          <MiniStat label="Komt uit" value={leaderName} accent={colors.red} />
          <MiniStat label="Troef" value={getTrumpLabel(d?.currentTrumpSuit)} accent={colors.accent} />
        </div>

        {appState.phase === "DOBBELKINGEN_READY" && (
          <div style={softCardStyle({ padding: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" })}>
            <div style={{ fontWeight: 800, color: colors.muted, flex: 1 }}>
              Start een nieuwe match. Iedereen begint in fase 1 met contractkeuzes.
            </div>
            <button onClick={onStart} style={buttonStyle("primary")}>
              Start Dobbelkingen
            </button>
            <button onClick={() => setShowInfo(true)} style={buttonStyle()}>
              Lees regels
            </button>
          </div>
        )}

        {appState.phase === "CHOOSING_CONTRACT" && (
          <>
            <div style={softCardStyle({ padding: 14, display: "grid", gap: 2, background: "rgba(251,191,36,0.08)" })}>
              <div style={{ fontWeight: 900, fontSize: isMobile ? 18 : 20 }}>{chooserName} kiest nu een contract</div>
              <div style={{ color: colors.muted, fontSize: 14 }}>
                Volgende speler komt uit in de eerste slag.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
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

            
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <button onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })} style={buttonStyle("success")}>
                  Doorgaan naar fase 2
                </button>
              </div>
            
          </>
        )}

        {appState.phase === "CHOOSING_TROEF" && (
          <>
            <div style={softCardStyle({ padding: 14, display: "grid", gap: 2, background: "rgba(74,222,128,0.08)" })}>
              <div style={{ fontWeight: 900, fontSize: isMobile ? 18 : 20 }}>{chooserName} kiest troef</div>
              <div style={{ color: colors.muted, fontSize: 14 }}>{leaderName} komt uit in de eerste slag.</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {TROEF_OPTIONS.map((opt) => {
                const hovered = hoveredTroef === opt.suit;
                return (
                  <button
                    key={opt.suit}
                    onMouseEnter={() => setHoveredTroef(opt.suit)}
                    onMouseLeave={() => setHoveredTroef(null)}
                    onClick={() => dispatchAction?.({ type: "choose_troef_suit", suit: opt.suit })}
                    style={{
                      ...softCardStyle({
                        padding: 18,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "grid",
                        gap: 8,
                        transform: hovered ? "translateY(-2px)" : "none",
                        transition: "all 0.16s ease",
                        background: hovered ? "rgba(96, 165, 250, 0.10)" : "rgba(255,255,255,0.04)",
                        border: hovered ? "1px solid rgba(96, 165, 250, 0.28)" : "1px solid rgba(255,255,255,0.08)",
                      }),
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 22, color: opt.color }}>
                      {opt.symbol} {opt.label}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 14 }}>Gekozen door {chooserName}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
              <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Troef-keuzes</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {players.map((p, index) => (
                    <div
                      key={p.id ?? index}
                      style={softCardStyle({
                        padding: "10px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        background: "rgba(255,255,255,0.04)",
                      })}
                    >
                      <div>{p.name ?? `Player ${index + 1}`}</div>
                      <div style={{ fontWeight: 900 }}>{troefPickCounts?.[index] ?? 0}/2 gekozen</div>
                    </div>
                  ))}
                </div>
              </div>

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

            {appState.devMode && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => dispatchAction?.({ type: "debug_finish_phase2_match" })} style={buttonStyle("success")}>
                  Match direct afronden
                </button>
              </div>
            )}
          </>
        )}

        {history.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>History</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[...history].slice().reverse().map((entry, index) => (
                <HistoryItem key={`${entry.contract}-${entry.timestamp ?? index}-${index}`}>
                  <b>{entry.label ?? entry.contract}</b>{" "}
                  {entry.trumpSuit ? `(${getTrumpLabel(entry.trumpSuit)}) ` : ""}
                  — gespeeld door <b>{players?.[entry.chooserIndex]?.name ?? `Player ${(entry.chooserIndex ?? 0) + 1}`}</b>
                </HistoryItem>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
