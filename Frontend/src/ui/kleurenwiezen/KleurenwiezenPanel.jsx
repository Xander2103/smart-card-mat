import { useEffect, useMemo, useState } from "react";
import { KLEURENWIEZEN_CONTRACTS, getKleurenwiezenContract } from "../../core/games/kleurenwiezen/contracts";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "../../core/games/kleurenwiezen/helpers";
import { getTrumpLabel } from "../../core/games/kleurenwiezen";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { ChoiceGrid, SelectButton } from "./SetupStepCard";
import { SetupSummaryCard } from "./SetupSummaryCard";
import { getSeatName } from "./helpers";

const TRUMPS = [
  { suit: "H", label: "♥ Harten" },
  { suit: "D", label: "♦ Ruiten" },
  { suit: "C", label: "♣ Klaveren" },
  { suit: "S", label: "♠ Schoppen" },
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

function PlayerChoiceGrid({ players, activeSeat, excludeSeat = null, onPick, bodySelected = "Geselecteerd" }) {
  return (
    <ChoiceGrid min={190}>
      {(players ?? []).map((player, index) => {
        const disabled = typeof excludeSeat === "number" && index === excludeSeat;
        const active = activeSeat === index;

        return (
          <SelectButton
            key={player?.id ?? index}
            active={active}
            onClick={disabled ? undefined : () => onPick?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            body={disabled ? "Niet beschikbaar voor deze keuze" : active ? bodySelected : "Selecteer deze speler"}
          />
        );
      })}
    </ChoiceGrid>
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
          <SelectButton
            key={player?.id ?? index}
            active={active}
            onClick={disabled ? undefined : () => onToggle?.(index)}
            eyebrow={`Seat ${index + 1}`}
            title={player?.name ?? `Speler ${index + 1}`}
            body={
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
    if (contract.id === "TROEL" && !["ownTrump", "otherTrump"].includes(slice?.troelTargetMode)) return false;

    return true;
  }, [
    contract,
    slice?.declarantSeat,
    slice?.declarantSeats,
    slice?.partnerSeat,
    slice?.trumpSuit,
    slice?.troelTargetMode,
  ]);

  const summaryRows = [
    { label: "Dealer", value: `${getSeatName(players, dealerSeat)} · D` },
    { label: "Eerste uitkomst", value: getSeatName(players, starterSeat) },
    { label: "Troef", value: contract?.needsTrump ? getTrumpLabel(slice?.trumpSuit) : "Geen troef" },
    {
      label: isMultiDeclarantContract ? "Spelers" : "Declarant",
      value: isMultiDeclarantContract
        ? declarantSeats.length > 0
          ? declarantSeats.map((seat) => getSeatName(players, seat)).join(", ")
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
        <Section title="1. Contract" subtitle="Kies eerst het uiteindelijke contract in de officiële volgorde. Daarna ga je door naar declarant, partner en troef op het setupscherm.">
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
            <Section title="Ronde setup" subtitle="Vul hier de declarant, partner en troef in op één scherm. Dealer en eerste uitkomst lopen automatisch.">
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{contract?.label ?? "—"}</div>
                <div style={{ color: colors.muted }}>{contract?.desc ?? ""}</div>
              </div>
            </Section>

            <Section
              title={isMultiDeclarantContract ? "1. Spelers" : "1. Declarant"}
              subtitle={
                isMultiDeclarantContract
                  ? "Kies één of meerdere spelers die dit miserie/piccolo-contract spelen."
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
              ) : (
                <PlayerChoiceGrid
                  players={players}
                  activeSeat={slice?.declarantSeat}
                  onPick={(value) =>
                    dispatchAction?.({
                      type: "set_kleurenwiezen_setup_field",
                      field: "declarantSeat",
                      value,
                    })
                  }
                  bodySelected="Declarant geselecteerd"
                />
              )}
            </Section>

            {contract?.needsPartner ? (
              <Section
                title={contract?.id === "TROEL" ? "2. Partner" : "2. Partner / meegaan"}
                subtitle={contract?.id === "TROEL" ? "Bij troel kies je de partner handmatig. Die speler komt ook automatisch uit." : "Voor samen-contracten kies je hier wie meegaat met de declarant."}
              >
                <PlayerChoiceGrid
                  players={players}
                  activeSeat={slice?.partnerSeat}
                  excludeSeat={slice?.declarantSeat}
                  onPick={(value) =>
                    dispatchAction?.({
                      type: "set_kleurenwiezen_setup_field",
                      field: "partnerSeat",
                      value,
                    })
                  }
                  bodySelected="Partner geselecteerd"
                />
              </Section>
            ) : null}

            {contract?.needsTrump ? (
              <Section title={contract?.id === "TROEL" ? "3. Troef en troel-modus" : contract?.needsPartner ? "3. Troef" : "2. Troef"} subtitle="De tafel kiest troef in het echt. Vul hier alleen het resultaat in zodat de app daarna alles automatisch kan volgen.">
                <ChoiceGrid min={180}>
                  {TRUMPS.map((item) => (
                    <SelectButton
                      key={item.suit}
                      active={slice?.trumpSuit === item.suit}
                      onClick={() =>
                        dispatchAction?.({
                          type: "set_kleurenwiezen_setup_field",
                          field: "trumpSuit",
                          value: item.suit,
                        })
                      }
                      title={item.label}
                      body="Gebruik deze kleur als troef voor de ronde."
                    />
                  ))}
                </ChoiceGrid>

                {contract?.id === "TROEL" ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 800 }}>Troel-doel</div>
                    <ChoiceGrid min={220}>
                      <SelectButton
                        active={slice?.troelTargetMode !== "otherTrump"}
                        onClick={() =>
                          dispatchAction?.({
                            type: "set_kleurenwiezen_setup_field",
                            field: "troelTargetMode",
                            value: "ownTrump",
                          })
                        }
                        title="Partner kiest eigen troef"
                        body="Doel: 8 slagen halen."
                      />
                      <SelectButton
                        active={slice?.troelTargetMode === "otherTrump"}
                        onClick={() =>
                          dispatchAction?.({
                            type: "set_kleurenwiezen_setup_field",
                            field: "troelTargetMode",
                            value: "otherTrump",
                          })
                        }
                        title="Partner kiest andere troef"
                        body="Doel: 9 slagen halen."
                      />
                    </ChoiceGrid>
                  </div>
                ) : null}
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