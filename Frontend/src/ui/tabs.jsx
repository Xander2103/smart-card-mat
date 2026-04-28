import { colors } from "./play/theme";

export function Tabs({ value, onChange, items = [] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            style={{
              padding: "11px 16px",
              borderRadius: 14,
              border: active ? "1px solid rgba(251, 191, 36, 0.34)" : "1px solid rgba(251, 191, 36, 0.10)",
              background: active
                ? "linear-gradient(180deg, rgba(251, 191, 36, 0.18) 0%, rgba(217, 119, 6, 0.14) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
              color: active ? "#fde68a" : colors.text,
              fontWeight: active ? 900 : 700,
              cursor: "pointer",
              minWidth: 110,
              flex: "0 1 auto",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
