// src/ui/GameModeCards.jsx
function Card({ title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 14,
        background: "white",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>{desc}</div>
    </button>
  );
}

export function GameModeCards({ onOpenDobbelkingen }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 800 }}>Game Modes</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <Card
          title="Dobbelkingen"
          desc="Contractspel: minste slagen, minste harten, geen harten koning, …"
          onClick={onOpenDobbelkingen}
        />
      </div>
    </div>
  );
}