//registry.js
import { dobbelkingenEngine } from "../games/dobbelkingen";

const ENGINES = {
  dobbelkingen: dobbelkingenEngine,
  // wiezen: wiezenEngine (later)
};

export function getEngine(modeId) {
  return ENGINES[modeId] ?? null;
}