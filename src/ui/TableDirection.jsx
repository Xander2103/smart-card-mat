// src/ui/TableDirection.jsx
import { colors, panelStyle, softCardStyle } from "./play/theme";
import { useViewport } from "./play/useViewport";

function getCardTone(cardLabel) {
  if (!cardLabel) return { color: colors.text, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" };

  const isRed = cardLabel.includes("♥") || cardLabel.includes("♦");
  return {
    color: isRed ? "#ffb4c1" : colors.text,
    border: isRed ? "1px solid rgba(251, 113, 133, 0.28)" : "1px solid rgba(255,255,255,0.12)",
    background: isRed ? "rgba(127, 29, 29, 0.34)" : "rgba(15, 23, 42, 0.30)",
  };
}

function Seat({ label, name, active, leader, cardLabel = null, style = {} }) {
  const border = active
    ? "1px solid rgba(251, 113, 133, 0.40)"
    : leader
      ? "1px solid rgba(251, 191, 36, 0.34)"
      : "1px solid rgba(255,255,255,0.08)";

  const background = active
    ? "rgba(127, 29, 29, 0.42)"
    : leader
      ? "rgba(120, 53, 15, 0.34)"
      : "rgba(255,255,255,0.04)";

  const animation = active ? "pulseTurn 1.2s ease-out infinite" : leader ? "pulseLeader 1.4s ease-out infinite" : "none";

  return (
    <div
      style={{
        ...softCardStyle({
          border,
          background,
          padding: 14,
          animation,
          transition: "all 0.18s ease",
          display: "grid",
          gap: 6,
        }),
        ...style,
      }}
    >
      <div style={{ fontWeight: 900, color: colors.muted, fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 20 }}>{name}</div>

      {active ? (
        <div style={{ fontSize: 12, color: "#fecdd3" }}>🎯 Aan de beurt</div>
      ) : leader ? (
        <div style={{ fontSize: 12, color: "#fcd34d" }}>👑 Komt uit</div>
      ) : null}

      {cardLabel && (
        <div
          style={{
            ...getCardTone(cardLabel),
            borderRadius: 16,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 54,
            fontWeight: 900,
            fontSize: 28,
            boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
            animation: "cardPopIn .18s ease-out",
            transformOrigin: "center",
          }}
        >
          {cardLabel}
        </div>
      )}
    </div>
  );
}

export function TableDirection({
  players = [],
  currentPlayerIndex = 0,
  leaderPlayerIndex = null,
  contractLabel = "—",
  trumpLabel = "—",
  trickLabel = "0 / 13",
  seatCards = [],
}) {
  const p = (i) => players?.[i]?.name ?? `P${i + 1}`;
  const { width } = useViewport();
  const isMobile = width <= 900;

  if (isMobile) {
    return (
      <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
        <style>{`
          @keyframes pulseTurn {
            0% { box-shadow: 0 0 0 0 rgba(251,113,133,.28); }
            70% { box-shadow: 0 0 0 12px rgba(251,113,133,0); }
            100% { box-shadow: 0 0 0 0 rgba(251,113,133,0); }
          }

          @keyframes pulseLeader {
            0% { box-shadow: 0 0 0 0 rgba(245,158,11,.24); }
            70% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
            100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
          }

          @keyframes cardPopIn {
            0% { opacity: 0; transform: translateY(8px) scale(.94); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Speeltafel</div>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            Centrale tafelweergave van de beurtvolgorde.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <Seat label="Zone 1" name={p(0)} active={currentPlayerIndex === 0} leader={leaderPlayerIndex === 0} cardLabel={seatCards?.[0] ?? null} />
          <Seat label="Zone 2" name={p(1)} active={currentPlayerIndex === 1} leader={leaderPlayerIndex === 1} cardLabel={seatCards?.[1] ?? null} />
          <Seat label="Zone 4" name={p(3)} active={currentPlayerIndex === 3} leader={leaderPlayerIndex === 3} cardLabel={seatCards?.[3] ?? null} />
          <Seat label="Zone 3" name={p(2)} active={currentPlayerIndex === 2} leader={leaderPlayerIndex === 2} cardLabel={seatCards?.[2] ?? null} />
        </div>

        <div
          style={softCardStyle({
            padding: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.03)",
          })}
        >
          <MiniChip label="Contract" value={contractLabel} />
          <MiniChip label="Troef" value={trumpLabel} />
          <MiniChip label="Slag" value={trickLabel} />
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle({ padding: 18, display: "grid", gap: 12 })}>
      <style>{`
        @keyframes pulseTurn {
          0% { box-shadow: 0 0 0 0 rgba(251,113,133,.28); }
          70% { box-shadow: 0 0 0 12px rgba(251,113,133,0); }
          100% { box-shadow: 0 0 0 0 rgba(251,113,133,0); }
        }

        @keyframes pulseLeader {
          0% { box-shadow: 0 0 0 0 rgba(245,158,11,.24); }
          70% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        }

        @keyframes cardPopIn {
          0% { opacity: 0; transform: translateY(8px) scale(.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 24 }}>Speeltafel</div>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            De tafel is het centrum. Leader komt uit, huidige speler volgt de beurt.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <MiniChip label="Contract" value={contractLabel} />
          <MiniChip label="Troef" value={trumpLabel} />
          <MiniChip label="Slag" value={trickLabel} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: 430,
          borderRadius: 30,
          border: "1px solid rgba(251, 191, 36, 0.14)",
          background:
            "radial-gradient(circle at center, rgba(120,53,15,0.26), rgba(28,16,11,0.92) 58%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 0 60px rgba(245, 158, 11, 0.05)",
        }}
      >
        <Seat label="Zone 1" name={p(0)} active={currentPlayerIndex === 0} leader={leaderPlayerIndex === 0} cardLabel={seatCards?.[0] ?? null} style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", width: 220 }} />
        <Seat label="Zone 2" name={p(1)} active={currentPlayerIndex === 1} leader={leaderPlayerIndex === 1} cardLabel={seatCards?.[1] ?? null} style={{ position: "absolute", top: "50%", right: 20, transform: "translateY(-50%)", width: 220 }} />
        <Seat label="Zone 3" name={p(2)} active={currentPlayerIndex === 2} leader={leaderPlayerIndex === 2} cardLabel={seatCards?.[2] ?? null} style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 220 }} />
        <Seat label="Zone 4" name={p(3)} active={currentPlayerIndex === 3} leader={leaderPlayerIndex === 3} cardLabel={seatCards?.[3] ?? null} style={{ position: "absolute", top: "50%", left: 20, transform: "translateY(-50%)", width: 220 }} />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 220,
            minHeight: 130,
            borderRadius: 24,
            border: "1px solid rgba(251, 191, 36, 0.18)",
            background: "rgba(255,255,255,0.03)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: 18,
            boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ color: colors.muted, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Centrale slag
            </div>
            <div style={{ fontSize: 28 }}>🂠</div>
            <div style={{ color: colors.muted, fontSize: 12 }}>Volgorde: Zone 1 → 2 → 3 → 4</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChip({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: "8px 12px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: colors.muted, fontSize: 12, fontWeight: 800 }}>{label}</span>
      <span style={{ fontWeight: 900 }}>{value}</span>
    </div>
  );
}
