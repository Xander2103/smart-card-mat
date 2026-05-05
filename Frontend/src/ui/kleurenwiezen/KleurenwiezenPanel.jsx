import { useEffect, useMemo, useState } from "react";
import { KLEURENWIEZEN_CONTRACTS, getKleurenwiezenContract } from "../../core/games/kleurenwiezen/contracts";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "../../core/games/kleurenwiezen/helpers";
import { getTrumpLabel } from "../../core/games/kleurenwiezen";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { ChoiceGrid } from "./SetupStepCard";
import { SetupSummaryCard } from "./SetupSummaryCard";
import { getSeatName } from "./helpers";

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
  onClick,
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={softCardStyle({
        padding: 14,
        minHeight: 112,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        alignItems: "center",
        justifyItems: "center",
        gap: 8,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        border: active
          ? "1px solid rgba(251, 191, 36, 0.68)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "radial-gradient(circle at top, rgba(251,191,36,0.20), transparent 42%), linear-gradient(180deg, rgba(92,45,24,0.78), rgba(45,30,24,0.92))"
          : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
        boxShadow: active ? "0 14px 30px rgba(217, 119, 6, 0.16)" : undefined,
      })}
    >
      <div
        style={{
          color: colors.muted,
          fontSize: 11,
          textTransform: "uppercase",
          fontWeight: 900,
          letterSpacing: 0.5,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontWeight: 1000,
          fontSize: 20,
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
          padding: "7px 8px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 900,
          color: active ? "#fef3c7" : colors.muted,
          background: active ? "rgba(251, 191, 36, 0.14)" : "rgba(255,255,255,0.045)",
          border: active ? "1px solid rgba(251, 191, 36, 0.26)" : "1px solid rgba(255,255,255,0.06)",
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
        padding: "14px 16px",
        minHeight: 88,
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        cursor: "pointer",
        border: active
          ? "1px solid rgba(251, 191, 36, 0.7)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "linear-gradient(135deg, rgba(120,53,15,0.65), rgba(70,35,20,0.72))"
          : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
        boxShadow: active ? "0 12px 26px rgba(217, 119, 6, 0.16)" : undefined,
      })}
    >
      <div
        style={{
          width: 46,
          height: 58,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #fff7ed, #f5e7d3)",
          color: isRed ? "#dc2626" : "#111827",
          fontSize: 34,
          fontWeight: 950,
          boxShadow: "0 8px 18px rgba(0,0,0,0.24)",
          border: "1px solid rgba(255,255,255,0.45)",
        }}
      >
        {item.symbol}
      </div>

      <div style={{ display: "grid", gap: 3 }}>
        <div
          style={{
            fontWeight: 950,
            fontSize: 18,
            color: isRed ? "#fecaca" : "#f8fafc",
          }}
        >
          {item.label}
        </div>

        <div style={{ color: colors.muted, fontSize: 12, fontWeight: 700 }}>
          {active ? "Troef gekozen" : "Kies als troef"}
        </div>
      </div>
    </button>
  );
}

function MultiPlayerChoiceGrid({ players, activeSeats = [], onToggle, maxSelected = 3 }) {
  const activeSet = new Set(activeSeats);
  const maxReached = activeSeats.length >= maxSelected;

  return (
    <ChoiceGrid min={190}>
      {(players ?? []).map((player, index) => {
        const active = activeSet.has(index);
        const disabled = !active && maxReached;

        return (
          <CenteredPlayerCard
            key={player?.id ?? index}
            active={active}
            disabled={disabled}
            onClick={() => onToggle?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={
              active
                ? "Speelt mee"
                : disabled
                  ? `Maximum ${maxSelected} spelers`
                  : "Klik om mee te spelen"
            }
          />
        );
      })}
    </ChoiceGrid>
  );
}

function SinglePlayerChoiceGrid({ players, activeSeat, onPick }) {
  return (
    <ChoiceGrid min={190}>
      {(players ?? []).map((player, index) => {
        const active = activeSeat === index;

        return (
          <CenteredPlayerCard
            key={player?.id ?? index}
            active={active}
            onClick={() => onPick?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={active ? "Declarant geselecteerd" : "Klik voor declarant"}
          />
        );
      })}
    </ChoiceGrid>
  );
}

function TeamPlayerChoiceGrid({ players, declarantSeat, partnerSeat, onChange, partnerLabel = "Partner" }) {
  return (
    <ChoiceGrid min={190}>
      {(players ?? []).map((player, index) => {
        const isDeclarant = declarantSeat === index;
        const isPartner = partnerSeat === index;

        let status = "Klik voor declarant";

        if (isDeclarant) {
          status = "Declarant geselecteerd";
        } else if (isPartner) {
          status = `${partnerLabel} geselecteerd`;
        } else if (typeof declarantSeat === "number") {
          status = `Klik voor ${partnerLabel.toLowerCase()}`;
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
            onClick={handleClick}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            status={status}
          />
        );
      })}
    </ChoiceGrid>
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
  const [showContractPicker, setShowContractPicker] = useState(!slice?.contractId);

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
      const ok = window.confirm("Kleurenwiezen verlaten en terugkeren naar Play?");
      if (ok) onClose?.();
      return;
    }

    const ok = window.confirm("Terug naar contractkeuze? Huidige setup gaat verloren.");
    if (ok) setShowContractPicker(true);
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: isMobile ? 24 : 28 }}>Kleurenwiezen</div>
          <div style={{ color: colors.muted, marginTop: 4 }}>
            Officiële contractvolgorde, heldere setup en daarna automatische slagen, winnaars en punten.
          </div>
        </div>
        <button onClick={handleBack} style={buttonStyle("danger")}>Terug</button>
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
        <Section title="1. Contract" subtitle="Kies eerst het uiteindelijke contract in de officiële volgorde. Daarna ga je door naar spelers en troef op het setupscherm.">
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
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.5fr) minmax(320px, 0.9fr)", gap: 16, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Section title="Ronde setup" subtitle="Vul hier de spelers en troef in. Dealer en eerste uitkomst lopen automatisch.">
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{contract?.label ?? "—"}</div>
                <div style={{ color: colors.muted }}>{contract?.desc ?? ""}</div>
              </div>
            </Section>

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
                />
              ) : contract?.needsPartner ? (
                <TeamPlayerChoiceGrid
                  players={players}
                  declarantSeat={slice?.declarantSeat}
                  partnerSeat={slice?.partnerSeat}
                  partnerLabel={contract?.id === "TROEL" ? "Partner" : "Meegaan"}
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
                <ChoiceGrid min={180}>
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
                </ChoiceGrid>
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

          <SetupSummaryCard slice={{ ...slice, dealerSeat }} players={players} extraRows={summaryRows} />
        </div>
      )}
    </div>
  );
}