// src/core/games/dobbelkingen/contracts/index.js

import { minsteSlagen } from "./minsteSlagen";
import { minsteHarten } from "./minsteHarten";
import { minsteBoerenKoningen } from "./minsteBoerenKoningen";
import { geenSlag713 } from "./geenSlag713";
import { minsteQueens } from "./minsteQueens";
import { hartenKoning } from "./HartenKoning";
import { troef } from "./troef";

export const DOBBELKINGEN_CONTRACTS = [
  minsteSlagen,
  minsteHarten,
  hartenKoning,
  minsteBoerenKoningen,
  geenSlag713,
  minsteQueens,
];

const ALL_CONTRACTS = [...DOBBELKINGEN_CONTRACTS, troef];

export const CONTRACT_BY_ID = Object.fromEntries(
  ALL_CONTRACTS.map((c) => [c.id, c])
);

export function getContract(contractId) {
  return CONTRACT_BY_ID[contractId] ?? null;
}

export function getContractList() {
  return DOBBELKINGEN_CONTRACTS.map(({ id, label, desc }) => ({
    id,
    label,
    desc,
  }));
}