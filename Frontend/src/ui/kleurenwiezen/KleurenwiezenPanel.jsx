import { useEffect, useMemo, useState } from "react";
import { KLEURENWIEZEN_CONTRACTS, getKleurenwiezenContract } from "../../core/games/kleurenwiezen/contracts";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "../../core/games/kleurenwiezen/helpers";
import { getTrumpLabel } from "../../core/games/kleurenwiezen";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { SetupSummaryCard } from "./SetupSummaryCard";
import { getSeatName } from "./helpers";
import { ConfirmModal } from "../components/ConfirmModal";

const TRUMPS = [
  { suit: "H", label: "Harten", symbol: "♥" },
  { suit: "D", label: "Ruiten", symbol: "♦" },
  { suit: "C", label: "Klaveren", symbol: "♣" },
  { suit: "S", label: "Schoppen", symbol: "♠" },
];

function Section({ title, subtitle, children }) {
  return (
    <div style={softCardStyle({ padding: 18, display: "grid", gap: 16 })}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
        {subtitle ? <div style={{ color: colors.muted, lineHeight: 1.5 }}>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}

function SetupChoiceGrid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
        gap: 10,
        alignItems: "stretch",
      }}
    >
      {children}
    </div>
  );
}

function ScoreAdjustButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 36,
        height: 32,
        borderRadius: 12,
        border: "1px solid rgba(251, 191, 36, 0.28)",
        background: "rgba(251, 191, 36, 0.10)",
        color: "#fef3c7",
        fontWeight: 1000,
        fontSize: 18,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        padding: 0,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function CollapsibleScoreboard({
  players = [],
  scores = [],
  open,
  onToggle,
  isMobile = false,
  onAdjustScore,
}) {
  const shouldShowScores = !isMobile || open;
  const [isEditing, setIsEditing] = useState(false);
  const [draftScores, setDraftScores] = useState(scores);

  function startEditing() {
    setDraftScores([...(scores ?? [])]);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftScores([...(scores ?? [])]);
    setIsEditing(false);
  }

  function updateDraftScore(playerIndex, delta) {
    setDraftScores((prev) => {
      const next = [...(prev ?? [])];
      next[playerIndex] = (next[playerIndex] ?? 0) + delta;
      return next;
    });
  }

  function saveScores() {
    draftScores.forEach((score, index) => {
      const oldScore = scores?.[index] ?? 0;
      const delta = (score ?? 0) - oldScore;

      if (delta !== 0) {
        onAdjustScore?.(index, delta);
      }
    });

    setIsEditing(false);
  }

  return (
    <div
      style={softCardStyle({
        padding: isMobile ? 12 : 14,
        display: "grid",
        gap: shouldShowScores ? 12 : 0,
        border: "1px solid rgba(251, 191, 36, 0.26)",
        background: "linear-gradient(180deg, rgba(120,53,15,0.24), rgba(255,255,255,0.03))",
      })}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={isMobile ? onToggle : undefined}
          style={{
            border: "none",
            background: "transparent",
            color: "#f5efe6",
            padding: 0,
            display: "grid",
            gap: 3,
            cursor: isMobile ? "pointer" : "default",
            textAlign: "left",
            minWidth: 0,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: isMobile ? 16 : 17 }}>
            Scoreboard
          </div>

          {!isMobile ? (
            <div style={{ color: colors.muted, fontSize: 13 }}>
              Huidige totaalscore.
            </div>
          ) : null}
        </button>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {shouldShowScores && !isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                border: "1px solid rgba(251, 191, 36, 0.26)",
                background: "rgba(255,255,255,0.045)",
                color: "#fef3c7",
                fontWeight: 900,
                cursor: "pointer",
              }}
              title="Score aanpassen"
            >
              ✎ Edit
            </button>
          ) : null}

          {shouldShowScores && isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                style={{
                  padding: "7px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.045)",
                  color: "#f5efe6",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Annuleer
              </button>

              <button
                type="button"
                onClick={saveScores}
                style={{
                  padding: "7px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(134, 239, 172, 0.34)",
                  background: "rgba(22, 163, 74, 0.36)",
                  color: "#dcfce7",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Opslaan
              </button>
            </>
          ) : null}

          {isMobile ? (
            <button
              type="button"
              onClick={onToggle}
              style={{
                padding: "7px 11px",
                borderRadius: 999,
                border: "1px solid rgba(251, 191, 36, 0.26)",
                background: "rgba(251, 191, 36, 0.10)",
                color: "#fef3c7",
                fontWeight: 900,
                whiteSpace: "nowrap",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {open ? "Verberg ↑" : "Toon ↓"}
            </button>
          ) : null}
        </div>
      </div>

      {shouldShowScores ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
            gap: isMobile ? 8 : 10,
          }}
        >
          {(players ?? []).map((player, index) => {
            const score = isEditing ? draftScores?.[index] ?? 0 : scores?.[index] ?? 0;

            return (
              <div
                key={player?.id ?? index}
                style={softCardStyle({
                  padding: isMobile ? "10px 11px" : 14,
                  minHeight: isEditing ? 132 : isMobile ? 86 : 92,
                  display: "grid",
                  gridTemplateRows: isEditing ? "auto auto 1fr auto" : "auto auto 1fr",
                  alignItems: "center",
                  gap: isMobile ? 5 : 8,
                  background: "rgba(255,255,255,0.045)",
                  border: isEditing
                    ? "1px solid rgba(251, 191, 36, 0.18)"
                    : "1px solid rgba(255,255,255,0.08)",
                })}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: isMobile ? 10 : 11,
                    textTransform: "uppercase",
                    fontWeight: 900,
                  }}
                >
                  Seat {index + 1}
                </div>

                <div
                  style={{
                    fontWeight: 1000,
                    fontSize: isMobile ? 15 : 17,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {player?.name ?? `Speler ${index + 1}`}
                </div>

                <div
                  style={{
                    fontWeight: 1000,
                    fontSize: isMobile ? 22 : 26,
                    lineHeight: 1,
                    color: score > 0 ? "#86efac" : score < 0 ? "#fca5a5" : "#f5efe6",
                  }}
                >
                  {score > 0 ? `+${score}` : score}
                </div>

                {isEditing ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      marginTop: 2,
                    }}
                  >
                    <ScoreAdjustButton onClick={() => updateDraftScore(index, -1)}>
                      -
                    </ScoreAdjustButton>
                    <ScoreAdjustButton onClick={() => updateDraftScore(index, 1)}>
                      +
                    </ScoreAdjustButton>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CompactContractButton({ item, active, onClick }) {
  const category = item.id.startsWith("SAMEN") || item.id === "TROEL"
    ? "Samen / duo"
    : item.id.includes("MISERIE")
      ? "Miserie"
      : item.id.includes("SOLOSLIM")
        ? "Slam"
        : item.id.includes("ABONDANCE")
          ? "Abondance"
          : "Solo";

  return (
    <button
      onClick={onClick}
      style={softCardStyle({
        padding: 14,
        display: "grid",
        gap: 8,
        textAlign: "left",
        cursor: "pointer",
        minHeight: 146,
        border: active ? "1px solid rgba(251, 191, 36, 0.44)" : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "linear-gradient(180deg, rgba(120,53,15,0.52), rgba(255,255,255,0.05))"
          : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
        boxShadow: active ? "0 14px 32px rgba(217, 119, 6, 0.18)" : undefined,
      })}
    >
      <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>
        {category}
      </div>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{item.label}</div>
      <div style={{ color: colors.muted, lineHeight: 1.45, fontSize: 13 }}>{item.desc}</div>
    </button>
  );
}

function CenteredPlayerCard({
  eyebrow,
  title,
  status,
  active = false,
  disabled = false,
  isDealer = false,
  compactDealerBadge = false,
  onClick,
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={softCardStyle({
        padding: "12px 10px",
        minHeight: 104,
        position: "relative",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        alignItems: "center",
        justifyItems: "center",
        gap: 6,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        border: active
          ? "1px solid rgba(251, 191, 36, 0.7)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "radial-gradient(circle at top, rgba(251,191,36,0.18), transparent 45%), linear-gradient(180deg, rgba(92,45,24,0.82), rgba(45,30,24,0.92))"
          : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
        boxShadow: active ? "0 10px 24px rgba(217, 119, 6, 0.14)" : undefined,
      })}
    >
      {isDealer ? (
        <>
          <style>
            {`
              @keyframes dealerChipPulse {
                0%, 100% {
                  box-shadow: 0 8px 18px rgba(0,0,0,0.22), 0 0 0 rgba(251, 191, 36, 0);
                }

                50% {
                  box-shadow: 0 8px 18px rgba(0,0,0,0.22), 0 0 14px rgba(251, 191, 36, 0.55);
                }
              }
            `}
          </style>

          <div
            title="Dealer"
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: compactDealerBadge ? 20 : undefined,
              height: compactDealerBadge ? 20 : undefined,
              gap: compactDealerBadge ? 0 : 4,
              padding: compactDealerBadge ? 0 : "4px 8px",
              borderRadius: 999,
              fontSize: compactDealerBadge ? 10 : 9,
              lineHeight: 1,
              letterSpacing: compactDealerBadge ? 0 : 0.4,
              textTransform: "uppercase",
              fontWeight: 1000,
              color: "#fef3c7",
              background: "linear-gradient(180deg, rgba(120,53,15,0.95), rgba(69,35,17,0.96))",
              border: "1px solid rgba(251, 191, 36, 0.55)",
              boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
              animation: "dealerChipPulse 1.6s ease-in-out infinite",
            }}
          >
            {compactDealerBadge ? (
              "D"
            ) : (
              <>
                <span style={{ fontSize: 10 }}>●</span>
                Dealer
              </>
            )}
          </div>
        </>
      ) : null}

      <div
        style={{
          color: colors.muted,
          fontSize: 10,
          textTransform: "uppercase",
          fontWeight: 900,
          letterSpacing: 0.4,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontWeight: 1000,
          fontSize: 17,
          lineHeight: 1.05,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: "100%",
          padding: "6px 6px",
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 900,
          color: active ? "#fef3c7" : colors.muted,
          background: active ? "rgba(251, 191, 36, 0.14)" : "rgba(255,255,255,0.045)",
          border: active ? "1px solid rgba(251, 191, 36, 0.26)" : "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </div>
    </button>
  );
}

function TrumpChoiceCard({ item, active, onClick }) {
  const isRed = item.suit === "H" || item.suit === "D";

  return (
    <button
      onClick={onClick}
      style={softCardStyle({
        padding: "12px 10px",
        minHeight: 86,
        display: "grid",
        gridTemplateColumns: "42px 1fr",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        cursor: "pointer",
        border: active
          ? "1px solid rgba(251, 191, 36, 0.7)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "linear-gradient(135deg, rgba(120,53,15,0.65), rgba(70,35,20,0.72))"
          : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
        boxShadow: active ? "0 10px 24px rgba(217, 119, 6, 0.14)" : undefined,
      })}
    >
      <div
        style={{
          width: 38,
          height: 50,
          borderRadius: 9,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #fff7ed, #f5e7d3)",
          color: isRed ? "#dc2626" : "#111827",
          fontSize: 28,
          fontWeight: 950,
          boxShadow: "0 7px 15px rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.45)",
        }}
      >
        {item.symbol}
      </div>

      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 950,
            fontSize: 16,
            color: isRed ? "#fecaca" : "#f8fafc",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </div>

        <div style={{ color: colors.muted, fontSize: 11, fontWeight: 800 }}>
          {active ? "Gekozen" : "Kies"}
        </div>
      </div>
    </button>
  );
}

function MultiPlayerChoiceGrid({
  players,
  activeSeats = [],
  onToggle,
  maxSelected = 3,
  dealerSeat = null,
  isMobile = false,
}) {
  const activeSet = new Set(activeSeats);
  const maxReached = activeSeats.length >= maxSelected;

  return (
    <SetupChoiceGrid>
      {(players ?? []).map((player, index) => {
        const active = activeSet.has(index);
        const disabled = !active && maxReached;

        return (
          <CenteredPlayerCard
            key={player?.id ?? index}
            active={active}
            disabled={disabled}
            isDealer={dealerSeat === index}
            compactDealerBadge={isMobile}
            onClick={() => onToggle?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={active ? "Speelt mee" : disabled ? `Max. ${maxSelected}` : "Kies"}
          />
        );
      })}
    </SetupChoiceGrid>
  );
}

function SinglePlayerChoiceGrid({ players, activeSeat, onPick, dealerSeat = null, isMobile = false }) {
  return (
    <SetupChoiceGrid>
      {(players ?? []).map((player, index) => {
        const active = activeSeat === index;

        return (
          <CenteredPlayerCard
            key={player?.id ?? index}
            active={active}
            isDealer={dealerSeat === index}
            compactDealerBadge={isMobile}
            onClick={() => onPick?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={active ? "Speler" : "Kies"}
          />
        );
      })}
    </SetupChoiceGrid>
  );
}

function TeamPlayerChoiceGrid({
  players,
  declarantSeat,
  partnerSeat,
  onChange,
  partnerLabel = "Partner",
  dealerSeat = null,
  isMobile = false,
}) {
  return (
    <SetupChoiceGrid>
      {(players ?? []).map((player, index) => {
        const isDeclarant = declarantSeat === index;
        const isPartner = partnerSeat === index;

        let status = "Kies vrager";

        if (isDeclarant) {
          status = "Vrager";
        } else if (isPartner) {
          status = partnerLabel;
        } else if (typeof declarantSeat === "number") {
          status = `Kies ${partnerLabel.toLowerCase()}`;
        }

        function handleClick() {
          if (isDeclarant) {
            onChange?.({
              declarantSeat: null,
              partnerSeat: null,
            });
            return;
          }

          if (isPartner) {
            onChange?.({
              declarantSeat,
              partnerSeat: null,
            });
            return;
          }

          if (typeof declarantSeat !== "number") {
            onChange?.({
              declarantSeat: index,
              partnerSeat: null,
            });
            return;
          }

          onChange?.({
            declarantSeat,
            partnerSeat: index,
          });
        }

        return (
          <CenteredPlayerCard
            key={player?.id ?? index}
            active={isDeclarant || isPartner}
            isDealer={dealerSeat === index}
            compactDealerBadge={isMobile}
            onClick={handleClick}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={status}
          />
        );
      })}
    </SetupChoiceGrid>
  );
}

export function KleurenwiezenPanel({ appState, onClose, dispatchAction }) {
  const { isMobile, width } = useViewport();
  const slice = appState?.game?.kleurenwiezen ?? {};
  const players = appState?.players ?? [];
  const playersCount = players.length || 4;
  const contract = getKleurenwiezenContract(slice?.contractId);
  const dealerSeat = typeof slice?.dealerSeat === "number" ? slice.dealerSeat : Math.max(0, playersCount - 1);
  const starterSeat = getCalculatedStarterSeat(slice, playersCount);
  const targetTricks = getEffectiveTargetTricks(slice);
  const lastResult = slice?.lastResult ?? null;
  const scoreboardScores = slice?.totalScores ?? Array(playersCount).fill(0);
  const [showContractPicker, setShowContractPicker] = useState(!slice?.contractId);
  const [showSetupScoreboard, setShowSetupScoreboard] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const scoreboardOpen = isMobile ? showSetupScoreboard : true;

  const declarantSeats = Array.isArray(slice?.declarantSeats)
    ? slice.declarantSeats
    : typeof slice?.declarantSeat === "number"
      ? [slice.declarantSeat]
      : [];

  const isMultiDeclarantContract = !!contract?.allowMultipleDeclarants;

  useEffect(() => {
    if (!slice?.contractId) setShowContractPicker(true);
  }, [slice?.contractId]);

  const canStart = useMemo(() => {
    if (!contract) return false;

    if (contract.allowMultipleDeclarants) {
      if (!Array.isArray(slice?.declarantSeats) || slice.declarantSeats.length === 0) return false;
    } else if (typeof slice?.declarantSeat !== "number") {
      return false;
    }

    if (contract.needsPartner && typeof slice?.partnerSeat !== "number") return false;
    if (contract.needsPartner && slice?.partnerSeat === slice?.declarantSeat) return false;
    if (contract.needsTrump && !slice?.trumpSuit) return false;

    return true;
  }, [
    contract,
    slice?.declarantSeat,
    slice?.declarantSeats,
    slice?.partnerSeat,
    slice?.trumpSuit,
  ]);

  const summaryRows = [
    { label: "Dealer", value: `${getSeatName(players, dealerSeat)} · D` },
    { label: "Eerste uitkomst", value: getSeatName(players, starterSeat) },
    { label: "Troef", value: contract?.needsTrump ? getTrumpLabel(slice?.trumpSuit) : "Geen troef" },
    {
      label: isMultiDeclarantContract ? "Spelers" : contract?.needsPartner ? "Team" : "Declarant",
      value: isMultiDeclarantContract
        ? declarantSeats.length > 0
          ? declarantSeats.map((seat) => getSeatName(players, seat)).join(", ")
          : "Nog kiezen"
        : contract?.needsPartner
          ? typeof slice?.declarantSeat === "number" && typeof slice?.partnerSeat === "number"
            ? `${getSeatName(players, slice.declarantSeat)} + ${getSeatName(players, slice.partnerSeat)}`
            : "Nog kiezen"
          : typeof slice?.declarantSeat === "number"
            ? getSeatName(players, slice.declarantSeat)
            : "Nog kiezen",
    },
    {
      label: "Doel",
      value: contract
        ? `${contract.targetType === "exact" ? "Exact" : "Minstens"} ${targetTricks ?? contract.targetTricks} slagen`
        : "—",
    },
  ];

function handleBack() {
  if (showContractPicker) {
    setConfirmAction({
      title: "Kleurenwiezen verlaten?",
      message: "Ben je zeker dat je Kleurenwiezen wilt verlaten en terugkeren naar Play?",
      confirmLabel: "Verlaten",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        onClose?.();
      },
    });
    return;
  }

  setConfirmAction({
    title: "Terug naar contractkeuze?",
    message: "Ben je zeker dat je terug wilt naar de contractkeuze? De huidige setup gaat verloren.",
    confirmLabel: "Teruggaan",
    cancelLabel: "Annuleren",
    danger: true,
    onConfirm: async () => {
      setShowContractPicker(true);
    },
  });
}

  function closeConfirm() {
  setConfirmAction(null);
}

async function runConfirmAction() {
  if (!confirmAction?.onConfirm) return;

  await confirmAction.onConfirm();
  setConfirmAction(null);
}

  function toggleDeclarantSeat(seat) {
    const currentSeats = Array.isArray(slice?.declarantSeats) ? slice.declarantSeats : [];
    const isAlreadySelected = currentSeats.includes(seat);

    const nextSeats = isAlreadySelected
      ? currentSeats.filter((item) => item !== seat)
      : currentSeats.length >= 3
        ? currentSeats
        : [...currentSeats, seat];

    dispatchAction?.({
      type: "set_kleurenwiezen_setup_field",
      field: "declarantSeats",
      value: nextSeats,
    });
  }

  const contractColumns = isMobile
    ? 2
    : width >= 1500
      ? 5
      : width >= 1180
        ? 4
        : width >= 820
          ? 3
          : 2;

  const contractGridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${contractColumns}, minmax(0, 1fr))`,
    gap: 12,
    alignItems: "stretch",
  };

  return (
    <div style={panelStyle({ padding: isMobile ? 12 : 20, display: "grid", gap: 16 })}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: isMobile ? 22 : 28 }}>
            Kleurenwiezen
          </div>

          {!isMobile ? (
            <div style={{ color: colors.muted, marginTop: 4 }}>
              Officiële contractvolgorde, heldere setup en daarna automatische slagen, winnaars en punten.
            </div>
          ) : null}
        </div>

        <button
          onClick={handleBack}
          style={{
            ...buttonStyle("danger"),
            minHeight: isMobile ? 40 : undefined,
            padding: isMobile ? "9px 14px" : undefined,
          }}
        >
          Terug
        </button>
      </div>

      {lastResult ? (
        <div style={softCardStyle({ padding: 16, display: "grid", gap: 8, border: "1px solid rgba(74, 222, 128, 0.24)" })}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Laatste ronde</div>
          <div style={{ color: lastResult?.result?.success ? colors.green : colors.red, fontWeight: 800 }}>
            {lastResult?.result?.resultLabel ?? "Ronde opgeslagen"}
          </div>
          <div style={{ color: colors.muted }}>
            {lastResult?.contractLabel} · {lastResult?.result?.attackLabel} · {lastResult?.result?.attackTricks} slagen
          </div>
        </div>
      ) : null}

      {showContractPicker ? (
        <>
          <CollapsibleScoreboard
            players={players}
            scores={scoreboardScores}
            open={scoreboardOpen}
            isMobile={isMobile}
            onToggle={() => setShowSetupScoreboard((value) => !value)}
            onAdjustScore={(playerIndex, delta) =>
              dispatchAction?.({ type: "adjust_total_score", playerIndex, delta })
            }
          />

          <Section
            title="1. Contract"
            subtitle="Kies eerst het uiteindelijke contract in de officiële volgorde. Daarna ga je door naar spelers en troef op het setupscherm."
          >
            <div style={contractGridStyle}>
              {KLEURENWIEZEN_CONTRACTS.map((item) => (
                <CompactContractButton
                  key={item.id}
                  item={item}
                  active={slice?.contractId === item.id}
                  onClick={() => {
                    dispatchAction?.({ type: "set_kleurenwiezen_contract", contractId: item.id });
                    setShowContractPicker(false);
                  }}
                />
              ))}
            </div>
          </Section>
        </>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.5fr) minmax(320px, 0.9fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            {isMobile ? (
              <div
                style={softCardStyle({
                  padding: "16px 18px",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  border: "1px solid rgba(251, 191, 36, 0.32)",
                  background:
                    "radial-gradient(circle at top, rgba(251,191,36,0.16), transparent 42%), linear-gradient(180deg, rgba(120,53,15,0.38), rgba(255,255,255,0.035))",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                })}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 900,
                    letterSpacing: 0.6,
                    marginBottom: 5,
                  }}
                >
                  Contract
                </div>

                <div
                  style={{
                    fontWeight: 1000,
                    fontSize: 23,
                    lineHeight: 1.1,
                  }}
                >
                  {contract?.label ?? "—"}
                </div>
              </div>
            ) : (
              <Section
                title="Ronde setup"
                subtitle="Vul hier de spelers en troef in. Dealer en eerste uitkomst lopen automatisch."
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{contract?.label ?? "—"}</div>
                  <div style={{ color: colors.muted }}>{contract?.desc ?? ""}</div>
                </div>
              </Section>
            )}

            <Section
              title="1. Spelers"
              subtitle={
                isMultiDeclarantContract
                  ? "Kies één of meerdere spelers die dit miserie/piccolo-contract spelen."
                  : contract?.needsPartner
                    ? "Kies eerst de vrager/declarant en daarna de partner die meegaat."
                    : "Kies wie dit contract speelt. Eerste uitkomst wordt automatisch berekend."
              }
            >
              {isMultiDeclarantContract ? (
                <MultiPlayerChoiceGrid
                  players={players}
                  activeSeats={declarantSeats}
                  onToggle={toggleDeclarantSeat}
                  maxSelected={3}
                  dealerSeat={dealerSeat}
                  isMobile={isMobile}
                />
              ) : contract?.needsPartner ? (
                <TeamPlayerChoiceGrid
                  players={players}
                  declarantSeat={slice?.declarantSeat}
                  partnerSeat={slice?.partnerSeat}
                  partnerLabel={contract?.id === "TROEL" ? "Partner" : "Meegaan"}
                  dealerSeat={dealerSeat}
                  isMobile={isMobile}
                  onChange={({ declarantSeat, partnerSeat }) => {
                    dispatchAction?.({
                      type: "set_kleurenwiezen_setup_field",
                      field: "declarantSeat",
                      value: declarantSeat,
                    });

                    dispatchAction?.({
                      type: "set_kleurenwiezen_setup_field",
                      field: "partnerSeat",
                      value: partnerSeat,
                    });
                  }}
                />
              ) : (
                <SinglePlayerChoiceGrid
                  players={players}
                  activeSeat={slice?.declarantSeat}
                  dealerSeat={dealerSeat}
                  isMobile={isMobile}
                  onPick={(value) =>
                    dispatchAction?.({
                      type: "set_kleurenwiezen_setup_field",
                      field: "declarantSeat",
                      value,
                    })
                  }
                />
              )}
            </Section>

            {contract?.needsTrump ? (
              <Section
                title="2. Troef"
                subtitle="De tafel kiest troef in het echt. Vul hier alleen het resultaat in zodat de app daarna alles automatisch kan volgen."
              >
                <SetupChoiceGrid>
                  {TRUMPS.map((item) => (
                    <TrumpChoiceCard
                      key={item.suit}
                      item={item}
                      active={slice?.trumpSuit === item.suit}
                      onClick={() =>
                        dispatchAction?.({
                          type: "set_kleurenwiezen_setup_field",
                          field: "trumpSuit",
                          value: item.suit,
                        })
                      }
                    />
                  ))}
                </SetupChoiceGrid>
              </Section>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => dispatchAction?.({ type: "start_kleurenwiezen_round" })}
                style={buttonStyle("primary")}
                disabled={!canStart}
              >
                Start ronde
              </button>
            </div>
          </div>

          {!isMobile ? (
            <SetupSummaryCard slice={{ ...slice, dealerSeat }} players={players} extraRows={summaryRows} />
          ) : null}
        </div>
      )}
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