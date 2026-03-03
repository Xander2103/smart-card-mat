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
          desc="Dobbelkingen is een strategisch kaartspel voor vier spelers
           waarbij je in verschillende rondes soms zo weinig mogelijk strafpunten probeert te verzamelen
            en in troefrondes net zoveel mogelijk slagen wil halen, waarna op het einde de positieve 
            en negatieve punten worden verrekend om de winnaar te bepalen."
          onClick={onOpenDobbelkingen}
        />
      </div>
    </div>
  );
}