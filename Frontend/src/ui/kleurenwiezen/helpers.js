import { getKleurenwiezenContract, getTrumpLabel, getFriendlyTeamLabel } from "../../core/games/kleurenwiezen";
import { getCalculatedStarterSeat, getEffectiveTargetTricks } from "../../core/games/kleurenwiezen/helpers";

export function getSeatName(players, seat) {
  return typeof seat === "number"
    ? players?.[seat]?.name ?? `Player ${seat + 1}`
    : "—";
}

export function getSetupSummaryRows(slice, players, extraRows = []) {
  const contract = getKleurenwiezenContract(slice?.contractId);
  const starterSeat = getCalculatedStarterSeat(slice, players?.length || 4);
  const targetTricks = getEffectiveTargetTricks(slice);

  const rows = [
    { label: "Contract", value: contract?.label ?? "Nog niet gekozen" },
    { label: "Declarant", value: getSeatName(players, slice?.declarantSeat) },
    { label: "Partner", value: contract?.needsPartner ? getSeatName(players, slice?.partnerSeat) : "Geen" },
    { label: "Team", value: contract ? getFriendlyTeamLabel(slice, players) : "—" },
    { label: "Dealer", value: getSeatName(players, slice?.dealerSeat) },
    { label: "Eerste uitkomst", value: getSeatName(players, starterSeat) },
    { label: "Troef", value: contract?.needsTrump ? getTrumpLabel(slice?.trumpSuit) : "Geen troef" },
    {
      label: "Doel",
      value: contract
        ? `${contract.targetType === "exact" ? "Exact" : "Minstens"} ${targetTricks ?? contract.targetTricks} slagen`
        : "—",
    },
    ...(contract?.id === "TROEL"
      ? [{ label: "Troel", value: slice?.troelTargetMode === "otherTrump" ? "Andere troef gekozen → 9 slagen" : "Eigen troef gekozen → 8 slagen" }]
      : []),
  ];

  const seen = new Set();
  return [...extraRows, ...rows].filter((row) => {
    if (!row?.label) return false;
    const key = String(row.label).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
