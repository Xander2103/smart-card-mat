//Tabledirection.jsx
import { softCardStyle } from "./play/theme";

function getCardTone(label) {
  if (!label) return "#f5efe6";
  return label.includes("♥") || label.includes("♦") ? "#ff9aa8" : "#f5efe6";
}

function SeatCard({ label, animationName = "seatCardPopIn" }) {
  if (!label) return null;

  return (
    <div
      key={`${label}-${animationName}`}
      style={{
        minWidth: 64,
        width: 64,
        height: 86,
        padding: "8px 10px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 26,
        color: getCardTone(label),
        boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
        animation: `${animationName} 180ms ease-out`,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

function CenterPlayedCard({ label, seat }) {
  if (!label) return null;

  // EINDPOSITIES dichter bij het echte midden
  const pos =
    seat === 0
      ? { top: "44%", left: "50%", transform: "translate(-50%, -50%)" } // Player 1
      : seat === 1
        ? { top: "50%", left: "58%", transform: "translate(-50%, -50%)" } // Player 2
        : seat === 2
          ? { top: "56%", left: "50%", transform: "translate(-50%, -50%)" } // Player 3
          : { top: "50%", left: "42%", transform: "translate(-50%, -50%)" }; // Player 4

  // Wat jij vroeg:
  // Player 1 en 3 -> naar rechts
  // Player 2 en 4 -> naar onder
  const animationName =
    seat === 0 || seat === 2
      ? "centerCardSlideRight"
      : "centerCardSlideDown";

  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        width: 76,
        height: 100,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 30,
        color: getCardTone(label),
        boxShadow: "0 14px 34px rgba(0,0,0,0.30)",
        animation: `${animationName} 260ms ease-out`,
        zIndex: 3,
      }}
    >
      {label}
    </div>
  );
}
function Seat({
  zoneLabel,
  playerName,
  badge,
  active = false,
  accent = false,
  cardLabel,
  cardAnimationName = "seatCardPopIn",
  cardPlacement = "bottom", // "right" of "bottom"
  style,
}) {
  const infoBlock = (
    <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
      <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 800 }}>{zoneLabel}</div>
      <div style={{ fontSize: 16, fontWeight: 900 }}>{playerName}</div>

      {badge ? (
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, opacity: 0.95 }}>
          {badge}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        ...softCardStyle({
          padding: 16,
          minHeight: 104,
          display: "grid",
          alignContent: "start",
          justifyItems: "start",
          background: active
            ? "linear-gradient(180deg, rgba(127, 29, 29, 0.82), rgba(93, 24, 24, 0.74))"
            : accent
              ? "linear-gradient(180deg, rgba(120, 53, 15, 0.60), rgba(88, 33, 11, 0.52))"
              : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
          border: active
            ? "1px solid rgba(251, 113, 133, 0.56)"
            : accent
              ? "1px solid rgba(251, 191, 36, 0.40)"
              : "1px solid rgba(255,255,255,0.10)",
          boxShadow: active
            ? "0 0 0 1px rgba(251,113,133,0.18), 0 0 22px rgba(251,113,133,0.22), 0 18px 38px rgba(0,0,0,0.20)"
            : undefined,
          animation: active ? "turnPulse 1.4s infinite ease-in-out" : undefined,
        }),
        ...style,
      }}
    >
      {cardPlacement === "right" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            width: "100%",
          }}
        >
          {infoBlock}
          <SeatCard label={cardLabel} animationName={cardAnimationName} />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, width: "100%" }}>
          {infoBlock}
          <SeatCard label={cardLabel} animationName={cardAnimationName} />
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
  centerCards = [],
  showCenterTrickLabel = true,
}) {
  const safePlayers =
    players.length >= 4
      ? players
      : [
        { name: "Player 1" },
        { name: "Player 2" },
        { name: "Player 3" },
        { name: "Player 4" },
      ];

  const seatOrder = [
    { seat: 0, zoneLabel: "Zone 1", position: "top" },
    { seat: 1, zoneLabel: "Zone 2", position: "right" },
    { seat: 2, zoneLabel: "Zone 3", position: "bottom" },
    { seat: 3, zoneLabel: "Zone 4", position: "left" },
  ];

  return (
    <div
      style={{
        ...softCardStyle({
          position: "relative",
          minHeight: 430,
          padding: 18,
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, rgba(120,45,0,0.18) 0%, rgba(54,22,10,0.08) 38%, rgba(15,8,6,0) 70%)",
          border: "1px solid rgba(251, 191, 36, 0.20)",
        }),
      }}
    >
      <style>{`
  @keyframes seatCardPopIn {
    0% {
      opacity: 0;
      transform: translateY(10px) scale(0.94);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes seatCardSlideRight {
    0% {
      opacity: 0;
      transform: translateX(-34px) scale(0.92);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes seatCardSlideDown {
    0% {
      opacity: 0;
      transform: translateY(-34px) scale(0.92);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes centerCardSlideRight {
    0% {
      opacity: 0;
      transform: translate(calc(-50% - 56px), -50%) scale(0.90);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes centerCardSlideDown {
    0% {
      opacity: 0;
      transform: translate(-50%, calc(-50% - 56px)) scale(0.90);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes turnPulse {
    0% {
      box-shadow: 0 0 0 1px rgba(251,113,133,0.18), 0 0 14px rgba(251,113,133,0.14), 0 18px 38px rgba(0,0,0,0.20);
    }
    50% {
      box-shadow: 0 0 0 1px rgba(251,113,133,0.28), 0 0 28px rgba(251,113,133,0.26), 0 18px 38px rgba(0,0,0,0.20);
    }
    100% {
      box-shadow: 0 0 0 1px rgba(251,113,133,0.18), 0 0 14px rgba(251,113,133,0.14), 0 18px 38px rgba(0,0,0,0.20);
    }
  }
`}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "start",
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Speeltafel</div>
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            De tafel is het centrum. Leader komt uit, huidige speler volgt de beurt.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={pillStyle()}>Contract&nbsp; <b>{String(contractLabel || "—").replaceAll("_", " ")}</b></div>
          <div style={pillStyle()}>Troef&nbsp; <b>{trumpLabel}</b></div>
          <div style={pillStyle()}>Slag&nbsp; <b>{trickLabel}</b></div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: 450,
          borderRadius: 24,
          border: "1px solid rgba(251, 191, 36, 0.20)",
          background:
            "radial-gradient(circle at center, rgba(109,40,18,0.26) 0%, rgba(64,24,12,0.16) 38%, rgba(20,8,6,0.10) 72%, rgba(0,0,0,0) 100%)",
        }}
      >
        {/* GROTE SUBTIELE MIDDENMARKERING */}
        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 850,
            height: 170,
            borderRadius: 36,
            border: "1px solid rgba(255, 200, 120, 0.18)",
            background:
              "radial-gradient(circle at center, rgba(255, 170, 50, 0.12) 0%, rgba(255, 150, 40, 0.05) 38%, rgba(255, 130, 30, 0.015) 72%, transparent 100%)",
            boxShadow:
              "inset 0 0 34px rgba(255, 170, 50, 0.10), 0 0 32px rgba(255, 150, 40, 0.05)",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.72,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 810,
            height: 138,
            borderRadius: 30,
            border: "1px solid rgba(255, 220, 170, 0.10)",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.88,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 92,
            borderRadius: 20,
            border: "1px solid rgba(255, 220, 170, 0.10)",
            background: "rgba(255,255,255,0.03)",
            boxShadow: "inset 0 0 18px rgba(255, 190, 90, 0.08)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {showCenterTrickLabel && (
          <div
            style={{
              position: "absolute",
              top: "50.5%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              textAlign: "center",
              pointerEvents: "none",
              color: "rgba(255, 230, 190, 0.46)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              SLAG
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {trickLabel}
            </div>
          </div>
        )}

        {seatOrder.map(({ seat, zoneLabel, position }) => {
          const player = safePlayers[seat];
          const isCurrent = seat === currentPlayerIndex;
          const isLeader = leaderPlayerIndex === seat;

          const style =
            position === "top"
              ? {
                position: "absolute",
                top: 18,
                left: "50%",
                transform: "translateX(-50%)",
                width: 184,
              }
              : position === "right"
                ? {
                  position: "absolute",
                  right: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 174,
                }
                : position === "bottom"
                  ? {
                    position: "absolute",
                    bottom: 18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 184,
                  }
                  : {
                    position: "absolute",
                    left: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 164,
                  };

          let badge = null;
          if (isCurrent) badge = "🎯 Aan de beurt";
          else if (isLeader) badge = "👑 Komt uit";

          const cardAnimationName =
            seat === 0 || seat === 2
              ? "seatCardSlideRight"
              : "seatCardSlideDown";

          const cardPlacement =
            seat === 0 || seat === 2
              ? "right"
              : "bottom";

          return (
            <Seat
              key={seat}
              zoneLabel={zoneLabel}
              playerName={player?.name ?? `Player ${seat + 1}`}
              badge={badge}
              active={isCurrent}
              accent={!isCurrent && isLeader}
              cardLabel={centerCards?.[seat] ? null : (seatCards?.[seat] ?? null)}
              cardAnimationName={cardAnimationName}
              cardPlacement={cardPlacement}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}

function pillStyle() {
  return {
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
  };
}