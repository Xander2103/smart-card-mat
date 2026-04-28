export function parseCardCode(code) {
  if (typeof code !== "string" || code.length < 2) return null;

  const suit = code.slice(-1).toUpperCase(); // C/D/H/S
  const rankStr = code.slice(0, -1).toUpperCase(); // A,K,Q,J,10...

  const rankMap = { A: 14, K: 13, Q: 12, J: 11 };
  const rank = rankMap[rankStr] ?? Number(rankStr);

  if (!["C", "D", "H", "S"].includes(suit)) return null;
  if (!Number.isFinite(rank)) return null;

  return { suit, rank, rankStr };
}

export function countWhere(plays, predicate) {
  let n = 0;
  for (const p of plays ?? []) {
    const meta = parseCardCode(p?.card);
    if (!meta) continue;
    if (predicate(meta)) n++;
  }
  return n;
}

export function hasCard(plays, predicate) {
  for (const p of plays ?? []) {
    const meta = parseCardCode(p?.card);
    if (!meta) continue;
    if (predicate(meta)) return true;
  }
  return false;
}