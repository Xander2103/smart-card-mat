// src/ui/TableDirection.jsx
import { colors, panelStyle, softCardStyle } from "./play/theme";

export function TableDirection({
  players = [],
  currentPlayerIndex = 0,
  leaderPlayerIndex = null,
}) {
  const p = (i) => players?.[i]?.name ?? `P${i + 1}`;

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
      <style>{`
        @keyframes pulseTurn {
          0% { box-shadow: 0 0 0 0 rgba(251,113,133,.28); }
          70% { box-shadow: 0 0 0 12px rgba(251,113,133,0); }
          100% { box-shadow: 0 0 0 0 rgba(251,113,133,0); }
        }

        @keyframes pulseLeader {
          0% { box-shadow: 0 0 0 0 rgba(245,158,11,.24); }
          70% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }
      `}</style>

      <div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Tafelrichting</div>
        <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
          Zone 1 → Zone 2 → Zone 3 → Zone 4. De leader komt uit, de huidige speler volgt de beurt.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <Seat label="Zone 1" name={p(0)} active={currentPlayerIndex === 0} leader={leaderPlayerIndex === 0} />
        <Seat label="Zone 2" name={p(1)} active={currentPlayerIndex === 1} leader={leaderPlayerIndex === 1} />
        <Seat label="Zone 4" name={p(3)} active={currentPlayerIndex === 3} leader={leaderPlayerIndex === 3} />
        <Seat label="Zone 3" name={p(2)} active={currentPlayerIndex === 2} leader={leaderPlayerIndex === 2} />
      </div>
    </div>
  );
}

function Seat({ label, name, active, leader }) {
  const border = active
    ? "1px solid rgba(251, 113, 133, 0.40)"
    : leader
      ? "1px solid rgba(251, 191, 36, 0.34)"
      : "1px solid rgba(255,255,255,0.08)";

  const background = active
    ? "rgba(127, 29, 29, 0.42)"
    : leader
      ? "rgba(120, 53, 15, 0.34)"
      : "rgba(255,255,255,0.04)";

  const animation = active ? "pulseTurn 1.2s ease-out infinite" : leader ? "pulseLeader 1.4s ease-out infinite" : "none";

  return (
    <div style={{ ...softCardStyle({ border, background, padding: 14, animation, transition: "all 0.18s ease" }) }}>
      <div style={{ fontWeight: 900, color: colors.muted }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 900, fontSize: 18 }}>{name}</div>

      {active ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#fecdd3" }}>🎯 Aan de beurt</div>
      ) : leader ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#fcd34d" }}>👑 Komt uit</div>
      ) : null}
    </div>
  );
}
