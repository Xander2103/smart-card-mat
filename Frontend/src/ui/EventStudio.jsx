import { useMemo, useState } from "react";
export function EventStudio({ onLine, onReset, zonesCount = 4 }) {
  const [text, setText] = useState(
    `P|1|UID_A\nP|2|UID_B\nT|2\nR|1|UID_A\n`
  );

  const lines = useMemo(() => {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }, [text]);

  async function play(delayMs = 200) {
    for (const line of lines) {
      onLine(line);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 16 }}>
      <b>Event Studio</b>

      <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
        Gebruik het protocol: <code>P|zone|UID</code>, <code>R|zone|UID</code>, <code>T|zone</code> (zones 1..{zonesCount})
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ width: "100%", marginTop: 8, fontFamily: "ui-monospace, Menlo, monospace" }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={() => play(200)} disabled={lines.length === 0}>
          Play
        </button>
        <button onClick={() => play(0)} disabled={lines.length === 0}>
          Play (instant)
        </button>
        <button onClick={onReset}>
          Reset (zones/log/turn)
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 13 }}>
        Lines: {lines.length}
      </div>
    </div>
  );
}