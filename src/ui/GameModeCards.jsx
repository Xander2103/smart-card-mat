// src/ui/GameModeCards.jsx
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";

function Card({ title, eyebrow, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...softCardStyle({
          textAlign: "left",
          padding: 18,
          display: "grid",
          gap: 10,
          cursor: "pointer",
          transition: "all 0.18s ease",
          background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "0 18px 36px rgba(2, 6, 23, 0.22)",
        }),
      }}
    >
      <div style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>
        {eyebrow}
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, color: colors.text }}>{title}</div>
      <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.55 }}>{desc}</div>
      <div>
        <span style={{ ...buttonStyle("primary"), display: "inline-flex", padding: "8px 12px" }}>
          Open spelmodus
        </span>
      </div>
    </button>
  );
}



export function GameModeCards({ onOpenDobbelkingen, onOpenKleurenwiezen }) {
  return (
    <div style={panelStyle({ padding: 20, display: "grid", gap: 16 })}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 28 }}>Game Modes</div>
        <div style={{ color: colors.muted, marginTop: 4 }}>
          Kies een spelmodus en start je tafel alsof je in een digitale kaartenkroeg zit.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <Card
          title="Dobbelkingen"
          eyebrow="Kaartspel"
          desc="Een strategisch slagenspel voor vier spelers waarbij je in fase 1 de juiste contracten kiest en in fase 2 twee keer troef probeert uit te buiten voor extra punten."
          onClick={onOpenDobbelkingen}
        />
        <Card
          title="Kleurenwiezen"
          eyebrow="Kaartspel"
          desc="Gebruik jouw bestaande tafel, spelers en animaties, maar vul contract, declarant, partner en troef eerst helder in via een setup wizard."
          onClick={onOpenKleurenwiezen}
        />
      </div>
    </div>
  );
}
