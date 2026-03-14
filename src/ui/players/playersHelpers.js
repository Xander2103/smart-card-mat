export function normalizeSelection(players) {
  return Array.isArray(players) ? players.slice(0, 4) : [];
}

export function getNextGuestNumber(selectedPlayers) {
  const guestNumbers = selectedPlayers
    .map((player) => {
      const match = String(player?.name ?? "").match(/^Gast\s+(\d+)$/i);
      return match ? Number(match[1]) : null;
    })
    .filter((n) => typeof n === "number" && !Number.isNaN(n));

  if (guestNumbers.length === 0) return 1;
  return Math.max(...guestNumbers) + 1;
}

export function moveItem(array, fromIndex, toIndex) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function isDevProfileName(name) {
  return /^DEV\b/i.test(String(name ?? "").trim());
}
