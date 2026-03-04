// src/ui/TableDirection.jsx
export function TableDirection({
  players = [],
  currentPlayerIndex = 0,
}) {
  const p = (i) => players?.[i]?.name ?? `P${i + 1}`;

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        display: "grid",
        gap: 10,
      }}
    >
      <style>{`
        @keyframes pulseTurn {
          0% { box-shadow: 0 0 0 0 rgba(255,77,79,.35); }
          70% { box-shadow: 0 0 0 10px rgba(255,77,79,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,77,79,0); }
        }
      `}</style>

      <div style={{ fontWeight: 900 }}>Tafel</div>

      {/* Layout match je mat:
          Zone 1 = linksboven
          Zone 2 = rechtsboven
          Zone 4 = linksonder
          Zone 3 = rechtsonder
          We tonen spelers in index volgorde, maar als je later wil,
          kan je mapping maken (zone->player) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <Seat label="Zone 1" name={p(0)} active={currentPlayerIndex === 0} />
        <Seat label="Zone 2" name={p(1)} active={currentPlayerIndex === 1} />
        <Seat label="Zone 4" name={p(3)} active={currentPlayerIndex === 3} />
        <Seat label="Zone 3" name={p(2)} active={currentPlayerIndex === 2} />
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        Volgorde: Zone 1 → Zone 2 → Zone 3 → Zone 4
      </div>
    </div>
  );
}

function Seat({ label, name, active }) {
  return (
    <div
      style={{
        border: active ? "2px solid #ff4d4f" : "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        background: "white",
        animation: active ? "pulseTurn 1.2s ease-out infinite" : "none",
      }}
    >
      <div style={{ fontWeight: 900, opacity: 0.7 }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 900 }}>{name}</div>
      {active ? <div style={{ marginTop: 6, fontSize: 12 }}>🎯 Aan de beurt</div> : null}
    </div>
  );
}