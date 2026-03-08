import { DECK52 } from "../../core/mapping/deck52";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";

export function DeckSetupScreen({ appState, mapping, selectedUid, dispatchAction }) {
  const { isMobile } = useViewport();
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
    if (idx < DECK52.length - 1) next();
  }

  return (
    <div style={panelStyle({ padding: isMobile ? 16 : 22, display: "grid", gap: 16 })}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900 }}>Deck Setup</div>
        <div style={{ color: colors.muted, maxWidth: 720 }}>
          Koppel RFID UID's aan je kaartendeck. Scan een kaart, wijs ze toe en spring meteen naar de volgende kaart.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "minmax(260px, 360px) minmax(0,1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={softCardStyle({
            padding: 18,
            display: "grid",
            gap: 10,
            background: "radial-gradient(circle at top, rgba(251,191,36,0.12), transparent 50%), rgba(255,255,255,0.04)",
          })}
        >
          <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 800 }}>
            Huidige kaart
          </div>
          <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900 }}>{card.label}</div>
          <div style={{ color: colors.muted }}>{card.name}</div>
          <div style={{ fontSize: 13, color: "#fde68a", fontWeight: 800 }}>Code: {card.code}</div>
          <div style={{ marginTop: 6, color: colors.muted, fontSize: 13 }}>
            Kaart {idx + 1} / {DECK52.length}
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0,1fr))", gap: 12 }}>
            <div style={softCardStyle({ padding: 16, display: "grid", gap: 8 })}>
              <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 800 }}>
                Laatst gescand
              </div>
              <div style={{ fontFamily: "ui-monospace, Menlo, monospace", wordBreak: "break-all" }}>{uid ?? "-"}</div>
            </div>

            <div style={softCardStyle({ padding: 16, display: "grid", gap: 8 })}>
              <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 800 }}>
                Mapping status
              </div>
              <div>
                Deze UID is gekoppeld aan: <b>{currentUidMappedTo ?? "UNMAPPED"}</b>
              </div>
              <div style={{ fontSize: 13, color: colors.muted }}>Mapped UIDs: <b>{mappedCount}</b></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={prev} disabled={idx === 0} style={{ ...buttonStyle(), opacity: idx === 0 ? 0.55 : 1 }}>
              Vorige
            </button>
            <button onClick={next} disabled={idx >= DECK52.length - 1} style={{ ...buttonStyle(), opacity: idx >= DECK52.length - 1 ? 0.55 : 1 }}>
              Volgende
            </button>
            <button onClick={assign} disabled={!uid} style={{ ...buttonStyle("primary"), opacity: !uid ? 0.55 : 1 }}>
              Assign UID → {card.code}
            </button>
          </div>

          <div style={softCardStyle({ padding: 16, display: "grid", gap: 8 })}>
            <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 800 }}>
              Snel navigeren
            </div>
            <select
              value={idx}
              onChange={(e) =>
                dispatchAction({
                  type: "set_deck_index",
                  index: Number(e.target.value),
                  maxIndex: DECK52.length - 1,
                })
              }
              style={{
                width: "100%",
                background: "rgba(15,23,42,0.28)",
                color: colors.text,
                border: "1px solid rgba(251,191,36,0.16)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              {DECK52.map((c, i) => (
                <option key={c.code} value={i}>
                  {String(i + 1).padStart(2, "0")} / {DECK52.length} — {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ color: colors.muted, fontSize: 13 }}>
            Leg de juiste kaart op eender welke zone, klik <b>Assign</b> en de setup springt automatisch naar de volgende kaart.
          </div>
        </div>
      </div>
    </div>
  );
}
