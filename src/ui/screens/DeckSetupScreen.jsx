import { DECK52 } from "../../core/mapping/deck52";

export function DeckSetupScreen({ appState, mapping, selectedUid, dispatchAction }) {
  const idx = appState.deckIndex ?? 0;
  const card = DECK52[idx];
  const uid = selectedUid ?? null;

  const mappedCount = Object.keys(mapping ?? {}).length;
  const currentUidMappedTo = uid ? mapping[uid] ?? null : null;

  function prev() {
    dispatchAction({
      type: "set_deck_index",
      index: idx - 1,
      maxIndex: DECK52.length - 1,
    });
  }

  function next() {
    dispatchAction({
      type: "set_deck_index",
      index: idx + 1,
      maxIndex: DECK52.length - 1,
    });
  }

  function assign() {
    if (!uid) return;
    dispatchAction({ type: "assign_uid_to_card", uid, cardName: card.code });
    // auto-next (maar niet voorbij het einde)
    if (idx < DECK52.length - 1) next();
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>Deck Setup</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 18 }}>
          <b>
            {card.label} — {card.name}
          </b>
          <div style={{ fontSize: 12, opacity: 0.7 }}>code: {card.code}</div>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 14 }}>
          Card: <b>{idx + 1}</b> / <b>{DECK52.length}</b> • mapped UIDs: <b>{mappedCount}</b>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <div>
          Last scanned UID:{" "}
          <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
            {uid ?? "-"}
          </span>
        </div>

        <div>
          This UID is mapped to: <b>{currentUidMappedTo ?? "UNMAPPED"}</b>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <button onClick={prev} disabled={idx === 0}>
            Prev
          </button>

          <button onClick={next} disabled={idx >= DECK52.length - 1}>
            Next
          </button>

          <button onClick={assign} disabled={!uid}>
            Assign UID → {card.code}
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Leg de juiste kaart op eender welke zone → klik Assign → hij springt automatisch naar de volgende kaart.
        </div>

        {/* ✅ helemaal onderaan: dropdown om direct te springen */}
        <div style={{ marginTop: 8, borderTop: "1px solid #eee", paddingTop: 10 }}>
          <label style={{ display: "grid", gap: 6, maxWidth: 520 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Jump to card</div>
            <select
              value={idx}
              onChange={(e) =>
                dispatchAction({
                  type: "set_deck_index",
                  index: Number(e.target.value),
                  maxIndex: DECK52.length - 1,
                })
              }
            >
              {DECK52.map((c, i) => (
                <option key={c.code} value={i}>
                  {String(i + 1).padStart(2, "0")} / {DECK52.length} — {c.label} ({c.code})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}