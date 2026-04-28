import { reduceKleurenwiezen } from "./reducer";
import { computeKleurenwiezen, computeKleurenwiezenState } from "./compute";
import { KLEURENWIEZEN_CONTRACTS } from "./contracts";

export const kleurenwiezenEngine = {
  id: "kleurenwiezen",
  label: "Kleurenwiezen",
  reduce: reduceKleurenwiezen,
  compute: computeKleurenwiezen,
  createInitialGameState: computeKleurenwiezenState,
  getContractList: () => KLEURENWIEZEN_CONTRACTS,
};
