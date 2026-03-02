// src/pages/App.jsx (of waar je App.jsx staat)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../styles/app.css";

import { parseEvent } from "../core/protocol/parseEvent";
import { applyAction, applyEvent } from "../core/state/reducer";
import { createInitialState } from "../core/state/initialState";
import { saveMapping } from "../core/mapping/mappingStore";

import { EventStudio } from "../ui/EventStudio";
import { ZoneGrid } from "../ui/ZoneGrid";
import { DebugLog } from "../ui/DebugLog";
import { Scoreboard } from "../ui/Scoreboard";

import { connectSerial } from "../transport/serialTransport";
import { CARD_OPTIONS } from "../core/mapping/cards";

import { computeGameState } from "../core/game/engine";
import { DECK52 } from "../core/mapping/deck52";

const ZONES = 4;
const AUTO_CONFIRM_MS = 800;

export default function App() {
  // --- Serial ---
  const [serialStatus, setSerialStatus] = useState("disconnected");
  const [serialConn, setSerialConn] = useState(null);

  // --- App state ---
  const [appState, setAppState] = useState(() =>
    createInitialState({ zonesCount: ZONES })
  );

  const { zones, log, turnZone, selectedUid, mapping } = appState;

  // save mapping naar localStorage wanneer mapping wijzigt
  useEffect(() => {
    saveMapping(mapping);
  }, [mapping]);

  // selectedCard is gewoon een cardName string
  const [selectedCard, setSelectedCard] = useState(CARD_OPTIONS[0]);

  const cardNames = useMemo(() => {
    return zones.map((uid) => (uid ? mapping[uid] ?? null : null));
  }, [zones, mapping]);

  const gameState = useMemo(() => computeGameState(appState), [appState]);

  // --- Dispatch helpers ---
  const dispatchEvent = useCallback((ev) => {
    if (!ev) return;
    setAppState((prev) => applyEvent(prev, ev));
  }, []);

  const dispatchLine = useCallback(
    (line) => {
      const ev = parseEvent(line);
      if (!ev) return;
      dispatchEvent(ev);
    },
    [dispatchEvent]
  );

  const dispatchAction = useCallback((action) => {
    setAppState((prev) => applyAction(prev, action));
  }, []);

  // --- USB Serial ---
  const connectUsb = useCallback(async () => {
    try {
      setSerialStatus("connecting...");
      const conn = await connectSerial({
        onLine: (line) => dispatchLine(line),
        onStatus: (s) => {
          if (typeof s === "string") setSerialStatus(s);
        },
        baudRate: 115200,
      });
      setSerialConn(conn);
      setSerialStatus("connected");
    } catch (e) {
      console.error(e);
      setSerialStatus("error");
      alert(e?.message ?? "Failed to connect serial");
    }
  }, [dispatchLine]);

  const disconnectUsb = useCallback(async () => {
    if (!serialConn) return;
    await serialConn.disconnect();
    setSerialConn(null);
    setSerialStatus("disconnected");
  }, [serialConn]);

  // --- UI actions ---
  const registerSelectedUid = useCallback(() => {
    if (!selectedUid) return;

    dispatchAction({
      type: "register_mapping",
      uid: selectedUid,
      cardName: selectedCard,
    });
  }, [dispatchAction, selectedUid, selectedCard]);

  const handleZoneClick = useCallback(
    (zoneNr) => {
      const uid = zones[zoneNr - 1];
      if (!uid) return;
      dispatchAction({ type: "select_uid", uid });
    },
    [zones, dispatchAction]
  );

  const clearMapping = useCallback(() => {
    setAppState((prev) => ({ ...prev, mapping: {} }));
    saveMapping({});
  }, []);

  // ✅ TDZ-safe confirm: function declaration (hoisted) + always-fresh turnCard
  function confirmTurnNow() {
    setAppState((prev) =>
      applyAction(prev, {
        type: "confirm_turn",
        turnCard: computeGameState(prev).turnCard,
      })
    );
  }

  const resetPile = useCallback(() => {
    dispatchAction({ type: "reset_pile" });
  }, [dispatchAction]);

  const resetAll = useCallback(() => {
    setAppState(createInitialState({ zonesCount: ZONES }));
  }, []);

  // --- Auto confirm (no backsies) ---
  const autoConfirmTimerRef = useRef(null);
  const lastAutoConfirmKeyRef = useRef(null);

  useEffect(() => {
    // ✅ GUARD: autoConfirm moet aan staan + confirm moet mogelijk zijn
    if (
      !appState.autoConfirm ||
      !gameState.canConfirm ||
      !gameState.turnCard ||
      !appState.turnZone
    ) {
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
      lastAutoConfirmKeyRef.current = null;
      return;
    }

    // Unieke key voor “deze exacte kaart in deze turnZone”
    const key = `${gameState.turnCard.zone}|${gameState.turnCard.uid}`;

    // Als dezelfde key al gepland is, niks doen
    if (lastAutoConfirmKeyRef.current === key && autoConfirmTimerRef.current) {
      return;
    }

    // Cancel vorige timer en schedule nieuwe
    if (autoConfirmTimerRef.current) {
      clearTimeout(autoConfirmTimerRef.current);
      autoConfirmTimerRef.current = null;
    }

    lastAutoConfirmKeyRef.current = key;

    autoConfirmTimerRef.current = setTimeout(() => {
      confirmTurnNow();
      autoConfirmTimerRef.current = null;
    }, AUTO_CONFIRM_MS);

    // Cleanup bij change/unmount
    return () => {
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
    };
  }, [
    appState.autoConfirm,
    appState.turnZone,
    gameState.canConfirm,
    gameState.turnCard?.zone,
    gameState.turnCard?.uid,
  ]);

  return (
    <div
      style={{
        fontFamily: "system-ui",
        padding: 16,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
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

        <button
          onClick={() => setAppState((prev) => ({ ...prev, autoConfirm: !prev.autoConfirm }))}
          style={{ marginLeft: 12 }}
        >
          Auto confirm: {appState.autoConfirm ? "ON" : "OFF"}
        </button>
      </div>

      <EventStudio zonesCount={ZONES} onLine={dispatchLine} onReset={resetAll} />

      {/* Event simulator */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => dispatchLine("P|1|UID_A")}>Place z1</button>
        <button onClick={() => dispatchLine("P|2|UID_B")}>Place z2</button>
        <button onClick={() => dispatchLine("P|3|UID_C")}>Place z3</button>
        <button onClick={() => dispatchLine("P|4|UID_D")}>Place z4</button>
        <button onClick={() => dispatchLine("R|1|UID_A")}>Remove z1</button>
        <button onClick={() => dispatchLine("R|2|UID_B")}>Remove z2</button>
        <button onClick={() => dispatchLine("T|1")}>Turn z1</button>
        <button onClick={() => dispatchLine("T|2")}>Turn z2</button>
        <button onClick={() => dispatchLine("T|3")}>Turn z3</button>
        <button onClick={() => dispatchLine("T|4")}>Turn z4</button>
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

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}>
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

      <ZoneGrid zones={zones} turnZone={turnZone} cardNames={cardNames} onZoneClick={handleZoneClick} />

      <h2 style={{ marginTop: 24 }}>Debug log</h2>
      <DebugLog lines={log} />

      <h2 style={{ marginTop: 24 }}>Game state</h2>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
        {/* Controls */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Manual confirm blijft als fallback (maar auto-confirm doet het meestal) */}
          <button onClick={confirmTurnNow} disabled={!gameState.canConfirm}>
            Confirm turn (manual)
          </button>

          <button onClick={() => dispatchAction({ type: "undo_last_play" })}>
            Undo last play
          </button>

          <button onClick={resetPile}>Reset pile</button>

          <div>
            Can play: <b>{gameState.canPlay ? "YES" : "NO"}</b>
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <div>
            Game mode: <b>{appState.gameMode}</b>
          </div>

          <div>
            Players: <b>{appState.players?.length ?? 0}</b>
          </div>

          <div>
            Current player index: <b>{appState.currentPlayerIndex}</b>
          </div>

          <div>
            Current player:{" "}
            <b>
              {appState.players?.[appState.currentPlayerIndex]?.name ??
                `P${appState.currentPlayerIndex}`}
            </b>
          </div>

          <div>
            Turn zone: <b>{appState.turnZone ?? "-"}</b>
          </div>
        </div>

        <Scoreboard
          players={appState.players}
          scores={gameState.scores}
          currentPlayerIndex={appState.currentPlayerIndex}
        />

        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          raw: {JSON.stringify(gameState.scores ?? [])}
        </div>
      </div>

      {/* Warnings */}
      {gameState.warnings?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <b>Warnings:</b>
          <ul style={{ marginTop: 6 }}>
            {gameState.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Trick */}
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>
          Current trick: <b>{appState.currentTrick?.length ?? 0}</b> /{" "}
          <b>{appState.players?.length ?? 0}</b>
        </div>
        <pre style={{ margin: 0 }}>{JSON.stringify(appState.currentTrick ?? [], null, 2)}</pre>
      </div>

      {/* Cards */}
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>Cards on table:</div>
        <pre style={{ margin: 0 }}>{JSON.stringify(gameState.cardsOnTable ?? [], null, 2)}</pre>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>Turn card:</div>
        <pre style={{ margin: 0 }}>{JSON.stringify(gameState.turnCard ?? null, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>Confirmed turn card:</div>
        <pre style={{ margin: 0 }}>
          {JSON.stringify(appState.confirmedTurnCard ?? null, null, 2)}
        </pre>
      </div>

      {/* Scores */}
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>Scores (derived):</div>
        <pre style={{ margin: 0 }}>{JSON.stringify(gameState.scores ?? [], null, 2)}</pre>
      </div>

      {/* Pile */}
      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 6 }}>
          Pile count: <b>{gameState.pileCount ?? 0}</b>
        </div>
        <pre style={{ margin: 0 }}>{JSON.stringify(appState.pile ?? [], null, 2)}</pre>

        <div style={{ marginTop: 10, marginBottom: 6 }}>Top card:</div>
        <pre style={{ margin: 0 }}>{JSON.stringify(gameState.topCard ?? null, null, 2)}</pre>

        <div style={{ marginTop: 12 }}>
          Trick history count: <b>{appState.trickHistory?.length ?? 0}</b>
          <pre style={{ margin: 0 }}>{JSON.stringify(appState.lastTrick ?? null, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}