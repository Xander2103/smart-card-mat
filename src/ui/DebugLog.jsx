export function DebugLog({ lines }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        height: 180,
        overflow: "auto",
        background: "#fafafa",
      }}
    >
      {lines.length === 0 ? (
        <div>(no events yet)</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {lines.map((l, idx) => (
            <li key={idx} style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}