import { useEffect, useMemo, useState } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { applyAction, applyEvent } from "../core/state/reducer";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";

import { EventStudio } from "../ui/EventStudio";
import { ZoneGrid } from "../ui/ZoneGrid";
import { DebugLog } from "../ui/DebugLog";

import { connectSerial } from "../transport/serialTransport";
import { CARD_OPTIONS } from "../core/mapping/cards";

import { getCardsOnTable, getTurnCard } from "../core/game/selectors";
import { computeGameState } from "../core/game/engine";

export default function App() {
  const ZONES = 4;

  const [serialStatus, setSerialStatus] = useState("disconnected");
  const [serialConn, setSerialConn] = useState(null);

  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  const { zones, log, turnZone, selectedUid, mapping } = appState;

  // ✅ save mapping naar localStorage wanneer mapping wijzigt
  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  // ✅ selectedCard is gewoon een cardName string
  const [selectedCard, setSelectedCard] = useState(CARD_OPTIONS[0]);

  const cardNames = useMemo(() => {
    return zones.map((uid) => (uid ? mapping[uid] ?? null : null));
  }, [zones, mapping]);

  const gameState = useMemo(() => computeGameState(appState), [appState]);

  async function connectUsb() {
    try {
      setSerialStatus("connecting...");
      const conn = await connectSerial({
        onLine: (line) => handleLine(line),
        baudRate: 115200,
      });
      setSerialConn(conn);
      setSerialStatus("connected");
    } catch (e) {
      console.error(e);
      setSerialStatus("error");
      alert(e?.message ?? "Failed to connect serial");
    }
  }

  async function disconnectUsb() {
    if (!serialConn) return;
    await serialConn.disconnect();
    setSerialConn(null);
    setSerialStatus("disconnected");
  }

  function handleLine(line) {
    const ev = parseEvent(line);
    if (!ev) return;
    setAppState((prev) => applyEvent(prev, ev));
  }

  function registerSelectedUid() {
    if (!selectedUid) return;

    // ✅ reducer verwacht cardName (niet "card")
    setAppState((prev) =>
      applyAction(prev, {
        type: "register_mapping",
        uid: selectedUid,
        cardName: selectedCard,
      })
    );
  }

  function handleZoneClick(zoneNr) {
    const uid = zones[zoneNr - 1];
    if (!uid) return;
    setAppState((prev) => applyAction(prev, { type: "select_uid", uid }));
  }

  // ✅ Als je "clear mapping" wil: ofwel reducer implementeren,
  // ofwel hier rechtstreeks state resetten (simpel).
  function clearMapping() {
    setAppState((prev) => ({ ...prev, mapping: {} }));
    saveMapping({}); // meteen localStorage ook leeg
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Smart Card Mat – Vertical Slice</h1>

      {/* USB Serial */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={connectUsb}
          disabled={serialStatus === "connected" || serialStatus === "connecting..."}
        >
          Connect USB
        </button>

        <button onClick={disconnectUsb} disabled={serialStatus !== "connected"}>
          Disconnect
        </button>

        <span>Status: {serialStatus}</span>
      </div>

      <EventStudio
        zonesCount={ZONES}
        onLine={handleLine}
        onReset={() => setAppState(createInitialState({ zonesCount: ZONES }))}
      />

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
          <div>
            Selected UID:{" "}
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {selectedUid ?? "-"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
            <select
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              {CARD_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button onClick={registerSelectedUid} disabled={!selectedUid}>
              Register selected UID
            </button>

            <button onClick={clearMapping}>Clear mapping</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 14 }}>
        Mapped cards: {Object.keys(mapping).length} / 52
      </div>

      <ZoneGrid
        zones={zones}
        turnZone={turnZone}
        cardNames={cardNames}
        onZoneClick={handleZoneClick}
      />

      <h2 style={{ marginTop: 24 }}>Debug log</h2>
      <DebugLog lines={log} />

      <h2 style={{ marginTop: 24 }}>Game state</h2>
      <div>
        <div>
          Can play: <b>{gameState.canPlay ? "YES" : "NO"}</b>
        </div>

        {gameState.warnings.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <b>Warnings:</b>
            <ul>
              {gameState.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        Cards on table:
        <pre>{JSON.stringify(gameState.cardsOnTable, null, 2)}</pre>

        Turn card:
        <pre>{JSON.stringify(gameState.turnCard, null, 2)}</pre>
      </div>
    </div>
  );
}

