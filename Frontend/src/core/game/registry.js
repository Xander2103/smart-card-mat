//registry.js
import { dobbelkingenEngine } from "../games/dobbelkingen";
import { kleurenwiezenEngine } from "../games/kleurenwiezen";

const ENGINES = {
  dobbelkingen: dobbelkingenEngine,
  kleurenwiezen: kleurenwiezenEngine
};

export function getEngine(modeId) {
  return ENGINES[modeId] ?? null;
}