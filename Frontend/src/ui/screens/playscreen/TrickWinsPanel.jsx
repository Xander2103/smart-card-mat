import { panelStyle, softCardStyle } from "../../play/theme";

export function TrickWinsPanel({ players, trickWins }) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
      <div style={{ fontWeight: 900 }}>Slagen in fase 2</div>
      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player, index) => (
          <div
            key={player.id ?? index}
            style={softCardStyle({
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.04)",
            })}
          >
            <div>{player.name ?? `Player ${index + 1}`}</div>
            <div style={{ fontWeight: 900 }}>{trickWins[index] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
