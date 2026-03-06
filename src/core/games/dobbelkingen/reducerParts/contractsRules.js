export function hasPlayedContractTwice(d, contract) {
  return (d.contractPlays?.[contract] ?? 0) >= 2;
}

export function canPickContract(d, contract) {
  if (!contract) return false;
  if (d.lastContract === contract) return false;
  if (hasPlayedContractTwice(d, contract)) return false;
  return true;
}

export function anyContractLeft(d) {
  const list = d.contracts ?? [];
  return list.some((c) => canPickContract(d, c));
}
