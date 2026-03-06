// src/core/games/dobbelkingen/reducerParts/contractsRules.js

export function hasPlayedContractTwice(d, contract) {
  return (d.contractPlays?.[contract] ?? 0) >= 2;
}

export function canPickContract(d, contract) {
  if (!contract) return false;
  if (d.lastContract === contract) return false;
  if (hasPlayedContractTwice(d, contract)) return false;
  return true;
}

export function anyPhase1ContractLeft(d) {
  const list = d.contracts ?? [];
  return list.some((c) => canPickContract(d, c));
}

export function isHeartCode(code) {
  if (!code) return false;

  const s = String(code).trim().toUpperCase();

  if (s.endsWith("H")) return true;
  if (s.includes("HEART") || s.includes("HART")) return true;
  if (s.includes("♥")) return true;

  return false;
}

export function countHeartsInTrickHistory(trickHistory) {
  let n = 0;

  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      if (isHeartCode(p?.card)) n++;
    }
  }

  return n;
}