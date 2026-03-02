export function Tabs({ value, onChange, items = [] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: value === it.value ? "#f3f3f3" : "white",
            fontWeight: value === it.value ? 700 : 400,
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}