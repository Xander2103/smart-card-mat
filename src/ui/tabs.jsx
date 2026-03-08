import { colors } from "./play/theme";

export function Tabs({ value, onChange, items = [] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: active ? "1px solid rgba(251, 191, 36, 0.36)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(251, 191, 36, 0.14)" : "rgba(255,255,255,0.04)",
              color: active ? "#fde68a" : colors.text,
              fontWeight: active ? 800 : 600,
              cursor: "pointer",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
