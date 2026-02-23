//App.jsx - Main application component for the Smart Card Mat vertical slice demo. It manages the state of the zones and the debug log, and provides buttons to simulate events.
import { useState } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { ZoneGrid } from "../ui/ZoneGrid";
import { DebugLog } from "../ui/DebugLog";

export default function App() {
  //hoeveel zones heeft onze mat? (hardcoded voor deze demo)
  const ZONES = 4;

  //state: een array van zone contents (uid of null) en een log van events
  const [zones, setZones] = useState(Array.from({ length: ZONES }, () => null));
  //debug log geheugen 
  const [log, setLog] = useState([]);
  //huidige turn zone ( wie aan de beurt is om te spelen vb : turnzone 3 betekent dat zone 3 aan de beurt is)
  const [turnZone, setTurnZone] = useState(null);


  //Deze functie wordt uitgevoerd als er een event komt.
  function handleLine(line) {
    //converteerd naar juist code
    const ev = parseEvent(line);
    if (!ev) return;

    //voegt nieuwe event bovenaan toe
    setLog((prev) => [ev.raw, ...prev].slice(0, 50));

    if (ev.type === "placed") {
      if (!Number.isInteger(ev.zone) || ev.zone < 1 || ev.zone > ZONES) return;
      setZones((prev) => {
        const next = [...prev];
        next[ev.zone - 1] = ev.uid;
        return next;
      });
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

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Smart Card Mat – Vertical Slice</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => handleLine("P|1|UID_A")}>Place z1</button>
        <button onClick={() => handleLine("P|2|UID_B")}>Place z2</button>
        <button onClick={() => handleLine("P|3|UID_C")}>Place z3</button>
        <button onClick={() => handleLine("P|4|UID_D")}>Place z4</button>
        <button onClick={() => handleLine("R|1|UID_A")}>Remove z1</button>
        <button onClick={() => handleLine("R|2|UID_B")}>Remove z2</button>
        <button onClick={() => handleLine("T|3")}>Turn z3</button>
      </div>

      <ZoneGrid zones={zones} turnZone={turnZone} />

      <h2 style={{ marginTop: 24 }}>Debug log</h2>
      <DebugLog lines={log} />
    </div>
  );
}