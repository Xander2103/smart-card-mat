import { getKleurenwiezenContract } from "../../core/games/kleurenwiezen/contracts";
import { getTrumpLabel } from "../../core/games/kleurenwiezen";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "../../core/games/kleurenwiezen/helpers";
import { colors, softCardStyle } from "../play/theme";
import { getSeatName } from "./helpers";

function InfoTile({ label, value }) {
  return (
    <div
      style={softCardStyle({
        padding: 12,
        display: "grid",
        gap: 5,
        background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
      })}
    >
      <div style={{ fontSize: 11, color: colors.muted, textTransform: "uppercase", fontWeight: 900 }}>
        {label}
      </div>
      <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function PlayerPill({ name, tone = "default" }) {
  const bg =
    tone === "attack"
      ? "rgba(245, 158, 11, 0.14)"
      : tone === "defense"
        ? "rgba(239, 68, 68, 0.12)"
        : "rgba(255,255,255,0.06)";

  const border =
    tone === "attack"
      ? "1px solid rgba(245, 158, 11, 0.36)"
      : tone === "defense"
        ? "1px solid rgba(239, 68, 68, 0.28)"
        : "1px solid rgba(255,255,255,0.08)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "7px 10px",
        borderRadius: 999,
        border,
        background: bg,
        fontWeight: 900,
        fontSize: 13,
      }}
    >
      {name}
    </span>
  );
}

function getDeclarantSeats(slice) {
  if (Array.isArray(slice?.declarantSeats) && slice.declarantSeats.length > 0) {
    return slice.declarantSeats;
  }

  if (typeof slice?.declarantSeat === "number") {
    return [slice.declarantSeat];
  }

  return [];
}

function getAttackSeats(slice, contract) {
  if (!contract) return [];

  if (contract.allowMultipleDeclarants) {
    return getDeclarantSeats(slice);
  }

  const seats = [];

  if (typeof slice?.declarantSeat === "number") {
    seats.push(slice.declarantSeat);
  }

  if (contract.needsPartner && typeof slice?.partnerSeat === "number") {
    seats.push(slice.partnerSeat);
  }

  return seats;
}

function getDefenseSeats(playersCount, attackSeats) {
  const attackSet = new Set(attackSeats);
  return Array.from({ length: playersCount }, (_, index) => index).filter((index) => !attackSet.has(index));
}

function getTeamLabel(contract) {
  if (!contract) return "Team";

  if (contract.allowMultipleDeclarants) return "Spelers";
  if (contract.needsPartner) return contract.id === "TROEL" ? "Troelspelers" : "Team";
  return "Speler";
}

function getDefenseLabel(contract) {
  if (!contract) return "Tegenpartij";

  if (contract.allowMultipleDeclarants) return "Niet-spelende tegenstanders";
  if (contract.needsPartner) return "Tegenpartij";
  return "Tegenstanders";
}

export function SetupSummaryCard({ slice, players }) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const playersCount = players?.length || 4;

  const dealerSeat = typeof slice?.dealerSeat === "number" ? slice.dealerSeat : Math.max(0, playersCount - 1);
  const starterSeat = getCalculatedStarterSeat(slice, playersCount);
  const targetTricks = getEffectiveTargetTricks(slice);

  const attackSeats = getAttackSeats(slice, contract);
  const defenseSeats = getDefenseSeats(playersCount, attackSeats);

  const hasAttackPlayers = attackSeats.length > 0;
  const hasDefensePlayers = defenseSeats.length > 0;

  const targetLabel = contract
    ? `${contract.targetType === "exact" ? "Exact" : "Minstens"} ${targetTricks ?? contract.targetTricks} slagen`
    : "—";

  const trumpLabel = contract?.needsTrump ? getTrumpLabel(slice?.trumpSuit) : "Geen troef";

  return (
    <div
      style={softCardStyle({
        padding: 18,
        display: "grid",
        gap: 16,
        alignSelf: "start",
        position: "sticky",
        top: 12,
      })}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Ronde-overzicht</div>
        <div style={{ color: colors.muted, lineHeight: 1.45 }}>
          Snelle controle voor je start: contract, spelers, dealer, troef en doel.
        </div>
      </div>

      <div
        style={softCardStyle({
          padding: 14,
          display: "grid",
          gap: 8,
          border: "1px solid rgba(251, 191, 36, 0.28)",
          background: "linear-gradient(180deg, rgba(120, 53, 15, 0.34), rgba(255,255,255,0.035))",
        })}
      >
        <div style={{ fontSize: 11, color: colors.muted, textTransform: "uppercase", fontWeight: 900 }}>
          Contract
        </div>
        <div style={{ fontWeight: 1000, fontSize: 22 }}>{contract?.label ?? "Nog kiezen"}</div>
        <div style={{ color: colors.muted, lineHeight: 1.4, fontSize: 13 }}>
          {contract?.desc ?? "Kies eerst een contract om de ronde op te zetten."}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>{getTeamLabel(contract)}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hasAttackPlayers ? (
            attackSeats.map((seat) => (
              <PlayerPill key={seat} name={getSeatName(players, seat)} tone="attack" />
            ))
          ) : (
            <span style={{ color: colors.muted, fontWeight: 800 }}>Nog kiezen</span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>{getDefenseLabel(contract)}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hasDefensePlayers ? (
            defenseSeats.map((seat) => (
              <PlayerPill key={seat} name={getSeatName(players, seat)} tone="defense" />
            ))
          ) : (
            <span style={{ color: colors.muted, fontWeight: 800 }}>—</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <InfoTile label="Dealer" value={getSeatName(players, dealerSeat)} />
        <InfoTile label="Eerste uitkomst" value={getSeatName(players, starterSeat)} />
        <InfoTile label="Troef" value={trumpLabel} />
        <InfoTile label="Doel" value={targetLabel} />
      </div>

      {contract?.id === "TROEL" ? (
        <div
          style={{
            color: colors.muted,
            fontSize: 13,
            lineHeight: 1.45,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 12,
          }}
        >
          Troel: 9–12 slagen geeft +15 voor de troelspelers. 13 slagen geeft +30. Niet gehaald:
          tegenstanders krijgen +15.
        </div>
      ) : contract?.allowMultipleDeclarants ? (
        <div
          style={{
            color: colors.muted,
            fontSize: 13,
            lineHeight: 1.45,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 12,
          }}
        >
          Miserie/Piccolo gebruikt de aparte IWWA-tabel. Niet-spelende tegenstanders kunnen meerdere keren punten krijgen.
        </div>
      ) : null}
    </div>
  );
}