import { buildDobbelkingenMatchRecord } from "./dobbelkingenMatchBuilder";
import { buildKleurenwiezenMatchRecord } from "./kleurenwiezenMatchBuilder";

export const matchRecordBuilders = {
  dobbelkingen: buildDobbelkingenMatchRecord,
  kleurenwiezen: buildKleurenwiezenMatchRecord,
};
