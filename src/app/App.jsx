import { useEffect, useMemo, useState } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { ZoneGrid } from "../ui/ZoneGrid";
import { DebugLog } from "../ui/DebugLog";

import { CARD_OPTIONS } from "../core/mapping/cards";
import { loadMapping, saveMapping, setMappingValue } from "../core/mapping/mappingStore";

export default function App() {
  const ZONES = 4;

  const [zones, setZones] = useState(Array.from({ length: ZONES }, () => null));
  const [log, setLog] = useState([]);
  const [turnZone, setTurnZone] = useState(null);

  // UID -> "Schoppen Aas"
  const [mapping, setMapping] = useState(() => loadMapping());

  // “laatst gescande” UID om te registreren
  const [lastUid, setLastUid] = useState(null);
  const [selectedCard, setSelectedCard] = useState(CARD_OPTIONS[0]);

  // auto-save mapping
  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  const cardNames = useMemo(() => {
    return zones.map((uid) => (uid ? mapping[uid] : null));
  }, [zones, mapping]);

  function handleLine(line) {
    const ev = parseEvent(line);
    if (!ev) return;

    setLog((prev) => [ev.raw, ...prev].slice(0, 50));

    if (ev.type === "placed") {
      if (!Number.isInteger(ev.zone) || ev.zone < 1 || ev.zone > ZONES) return;

      setZones((prev) => {
        const next = [...prev];
        next[ev.zone - 1] = ev.uid;
        return next;
      });

      // onthoud deze UID als kandidaat om te mappen
      setLastUid(ev.uid);
    }

    if (ev.type === "removed") {
      if (!Number.isInteger(ev.zone) || ev.zone < 1 || ev.zone > ZONES) return;
      setZones((prev) => {
        const next = [...prev];
        if (next[ev.zone - 1] === ev.uid) next[ev.zone - 1] = null;
        return next;
      });
    }

    if (ev.type === "turn") {
      if (!Number.isInteger(ev.zone) || ev.zone < 1 || ev.zone > ZONES) return;
      setTurnZone(ev.zone);
    }
  }

  function registerLastUid() {
    if (!lastUid) return;
    setMapping((prev) => setMappingValue(prev, lastUid, selectedCard));
  }

  function clearMapping() {
    setMapping({});
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Smart Card Mat – Vertical Slice</h1>

      {/* Event simulator */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => handleLine("P|1|UID_A")}>Place z1</button>
        <button onClick={() => handleLine("P|2|UID_B")}>Place z2</button>
        <button onClick={() => handleLine("P|3|UID_C")}>Place z3</button>
        <button onClick={() => handleLine("P|4|UID_D")}>Place z4</button>
        <button onClick={() => handleLine("R|1|UID_A")}>Remove z1</button>
        <button onClick={() => handleLine("R|2|UID_B")}>Remove z2</button>
        <button onClick={() => handleLine("T|3")}>Turn z3</button>
      </div>

      {/* Mapping panel */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <b>Mapping (UID → kaart)</b>
        <div style={{ marginTop: 8 }}>
          <div>Last UID: <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{lastUid ?? "-"}</span></div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
            <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}>
              {CARD_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button onClick={registerLastUid} disabled={!lastUid}>
              Register last UID
            </button>

            <button onClick={clearMapping}>
              Clear mapping
            </button>
          </div>
        </div>
      </div>

      <ZoneGrid zones={zones} turnZone={turnZone} cardNames={cardNames} />

      <h2 style={{ marginTop: 24 }}>Debug log</h2>
      <DebugLog lines={log} />
    </div>
  );
}