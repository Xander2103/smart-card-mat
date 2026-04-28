import { colors, softCardStyle } from "./play/theme";

export function DebugLog({ lines = [] }) {
  return (
    <div
      style={softCardStyle({
        padding: 12,
        height: 220,
        overflow: "auto",
        background: "rgba(255,255,255,0.04)",
      })}
    >
      {lines.length === 0 ? (
        <div style={{ color: colors.muted }}>(no events yet)</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          {lines.map((l, idx) => (
            <li key={idx} style={{ fontFamily: "ui-monospace, Menlo, monospace", color: colors.text }}>
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
