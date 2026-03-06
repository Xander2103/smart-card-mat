// src/ui/TableDirection.jsx
export function TableDirection({
  players = [],
  currentPlayerIndex = 0,
  leaderPlayerIndex = null,
}) {
  const p = (i) => players?.[i]?.name ?? `P${i + 1}`;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#fafafa",
        borderRadius: 16,
        padding: 14,
        display: "grid",
        gap: 10,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
      }}
    >
      <style>{`
        @keyframes pulseTurn {
          0% { box-shadow: 0 0 0 0 rgba(255,77,79,.35); }
          70% { box-shadow: 0 0 0 10px rgba(255,77,79,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,77,79,0); }
        }

        @keyframes pulseLeader {
          0% { box-shadow: 0 0 0 0 rgba(245,158,11,.28); }
          70% { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }
      `}</style>

      <div style={{ fontWeight: 900 }}>Tafel</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <Seat
          label="Zone 1"
          name={p(0)}
          active={currentPlayerIndex === 0}
          leader={leaderPlayerIndex === 0}
        />
        <Seat
          label="Zone 2"
          name={p(1)}
          active={currentPlayerIndex === 1}
          leader={leaderPlayerIndex === 1}
        />
        <Seat
          label="Zone 4"
          name={p(3)}
          active={currentPlayerIndex === 3}
          leader={leaderPlayerIndex === 3}
        />
        <Seat
          label="Zone 3"
          name={p(2)}
          active={currentPlayerIndex === 2}
          leader={leaderPlayerIndex === 2}
        />
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        Volgorde: Zone 1 → Zone 2 → Zone 3 → Zone 4
      </div>
    </div>
  );
}

function Seat({ label, name, active, leader }) {
  const border = active
    ? "2px solid #ff4d4f"
    : leader
      ? "2px solid #f59e0b"
      : "1px solid #eee";

  const background = active ? "#fff7f7" : leader ? "#fffbeb" : "white";

  const animation = active
    ? "pulseTurn 1.2s ease-out infinite"
    : leader
      ? "pulseLeader 1.4s ease-out infinite"
      : "none";

  return (
    <div
      style={{
        border,
        borderRadius: 14,
        padding: 12,
        background,
        animation,
        transition: "all 0.18s ease",
      }}
    >
      <div style={{ fontWeight: 900, opacity: 0.7 }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 900 }}>{name}</div>

      {active ? (
        <div style={{ marginTop: 6, fontSize: 12 }}>🎯 Aan de beurt</div>
      ) : leader ? (
        <div style={{ marginTop: 6, fontSize: 12 }}>👑 Leader</div>
      ) : null}
    </div>
  );
}