import { useLayoutEffect, useRef, useState } from "react";
import { softCardStyle } from "./play/theme";
import { useViewport } from "./play/useViewport";

function getCardTone(label) {
  if (!label) return "#f5efe6";
  return label.includes("♥") || label.includes("♦") ? "#ff9aa8" : "#f5efe6";
}

function getPrettyContractLabel(label) {
  return String(label ?? "—")
    .replaceAll("_", " ")
    .trim();
}

function getTrumpSymbol(label) {
  const value = String(label ?? "").toUpperCase();

  if (value.includes("♥") || value.includes("HARTEN")) return "♥";
  if (value.includes("♦") || value.includes("RUITEN")) return "♦";
  if (value.includes("♣") || value.includes("KLAVEREN")) return "♣";
  if (value.includes("♠") || value.includes("SCHOPPEN")) return "♠";

  return null;
}

function getTrumpTone(symbol) {
  if (symbol === "♥" || symbol === "♦") {
    return {
      color: "rgba(255, 150, 170, 0.28)",
      shadow:
        "0 0 10px rgba(255, 110, 140, 0.10), 0 0 22px rgba(255, 160, 180, 0.06)",
    };
  }

  return {
    color: "rgba(255, 235, 205, 0.24)",
    shadow:
      "0 0 10px rgba(255, 235, 205, 0.08), 0 0 20px rgba(255, 210, 120, 0.05)",
  };
}

function SeatCard({ label, animationName = "seatCardPopIn" }) {
  if (!label) return null;

  return (
    <div
      style={{
        minWidth: 64,
        width: 64,
        height: 86,
        padding: "8px 10px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 26,
        color: getCardTone(label),
        boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
        animation: `${animationName} 260ms ease-out`,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

function getCenterCardPosition(seat) {
  return seat === 0
    ? { top: "42%", left: "50%" }
    : seat === 1
      ? { top: "50%", left: "58%" }
      : seat === 2
        ? { top: "58%", left: "50%" }
        : { top: "50%", left: "42%" };
}

function getFlyingStartPosition(seat) {
  return seat === 0
    ? { top: "102px", left: "56%", rotate: "-10deg" }
    : seat === 1
      ? { top: "50%", left: "90%", rotate: "9deg" }
      : seat === 2
        ? { top: "348px", left: "56%", rotate: "7deg" }
        : { top: "50%", left: "10%", rotate: "-9deg" };
}

function CenterPlayedCard({ label, seat, animationSeed = "0", compact = false }) {
  if (!label) return null;

  const pos = getCenterCardPosition(seat);

  return (
    <div
      key={`${seat}-${label}-${animationSeed}`}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -50%)",
        width: compact ? 60 : 78,
        height: compact ? 82 : 104,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: compact ? 22 : 31,
        color: getCardTone(label),
        boxShadow: "0 16px 42px rgba(0,0,0,0.34)",
        animation: "centerCardSettle 220ms ease-out 420ms both",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
}

function px(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function FlyingCard({ label, seat, id, geometry, compact = false }) {
  if (!label) return null;

  const fallbackStart = getFlyingStartPosition(seat);
  const fallbackEnd = getCenterCardPosition(seat);
  const startTop = geometry?.startTop ?? fallbackStart.top;
  const startLeft = geometry?.startLeft ?? fallbackStart.left;
  const endTop = geometry?.endTop ?? fallbackEnd.top;
  const endLeft = geometry?.endLeft ?? fallbackEnd.left;
  const rotate = geometry?.rotate ?? fallbackStart.rotate;

  return (
    <div
      key={id}
      style={{
        position: "absolute",
        top: px(startTop),
        left: px(startLeft),
        transform: "translate(-50%, -50%)",
        width: compact ? 60 : 78,
        height: compact ? 82 : 104,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.18)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: compact ? 22 : 31,
        color: getCardTone(label),
        boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
        zIndex: 7,
        pointerEvents: "none",
        opacity: 0,
        ["--fly-start-top"]: px(startTop),
        ["--fly-start-left"]: px(startLeft),
        ["--fly-end-top"]: px(endTop),
        ["--fly-end-left"]: px(endLeft),
        ["--fly-rotate"]: rotate,
        animation: "flyingCardMove 760ms cubic-bezier(.18,.9,.22,1) forwards",
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
  cardPlacement = "bottom",
  cardAnchorRef,
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
        position: "relative",
        ...softCardStyle({
          padding: 16,
          minHeight: 104,
          display: "grid",
          alignContent: "start",
          justifyItems: "start",
          background: active
            ? "linear-gradient(180deg, rgba(127, 29, 29, 0.84), rgba(93, 24, 24, 0.76))"
            : accent
              ? "linear-gradient(180deg, rgba(120, 53, 15, 0.64), rgba(88, 33, 11, 0.56))"
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
      <div
        ref={cardAnchorRef}
        style={{
          position: "absolute",
          width: 78,
          height: 104,
          pointerEvents: "none",
          opacity: 0,
          right: cardPlacement === "right" ? 14 : undefined,
          bottom: cardPlacement === "bottom" ? 14 : undefined,
          top: cardPlacement === "right" ? "50%" : undefined,
          transform: cardPlacement === "right" ? "translateY(-50%)" : undefined,
        }}
      />

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

function TableOrnaments({ contractLabel, trumpLabel }) {
  const prettyContract = getPrettyContractLabel(contractLabel);
  const trumpSymbol = getTrumpSymbol(trumpLabel);
  const showTrump = !!trumpSymbol && trumpLabel !== "—";
  const showContract =
    !showTrump &&
    prettyContract &&
    prettyContract !== "—" &&
    prettyContract !== "TROEF";

  const leftBaseStyle = {
    position: "absolute",
    top: "50.5%",
    left: "31.5%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  const rightBaseStyle = {
    position: "absolute",
    top: "50.5%",
    left: "68.5%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  if (showTrump) {
    const tone = getTrumpTone(trumpSymbol);

    return (
      <>
        <div
          style={{
            ...leftBaseStyle,
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: "0.04em",
            color: tone.color,
            textShadow: tone.shadow,
            filter: "drop-shadow(0 0 10px rgba(255, 210, 120, 0.08))",
          }}
        >
          {trumpSymbol}
        </div>

        <div
          style={{
            ...rightBaseStyle,
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: "0.04em",
            color: tone.color,
            textShadow: tone.shadow,
            filter: "drop-shadow(0 0 10px rgba(255, 210, 120, 0.08))",
          }}
        >
          {trumpSymbol}
        </div>
      </>
    );
  }

  if (showContract) {
    return (
      <>
        <div
          style={{
            ...leftBaseStyle,
            maxWidth: 210,
            textAlign: "center",
            fontSize: 21,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            lineHeight: 1.15,
            color: "rgba(255, 225, 180, 0.17)",
            textShadow:
              "0 0 8px rgba(255, 200, 120, 0.07), 0 0 18px rgba(255, 180, 90, 0.03)",
          }}
        >
          {prettyContract}
        </div>

        <div
          style={{
            ...rightBaseStyle,
            maxWidth: 210,
            textAlign: "center",
            fontSize: 21,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            lineHeight: 1.15,
            color: "rgba(255, 225, 180, 0.17)",
            textShadow:
              "0 0 8px rgba(255, 200, 120, 0.07), 0 0 18px rgba(255, 180, 90, 0.03)",
          }}
        >
          {prettyContract}
        </div>
      </>
    );
  }

  return null;
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
  showTopRightTrick = true,
  animationSeed = "0",
  flyingCards = [],
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

  const boardRef = useRef(null);
  const seatAnchorRefs = useRef([]);
  const [flightGeometry, setFlightGeometry] = useState({});
  const { isMobile, isMobileLandscape } = useViewport();

  const boardMinHeight = isMobileLandscape ? 270 : isMobile ? 500 : 450;
  const outerMinHeight = isMobileLandscape ? 320 : isMobile ? 540 : 430;
  const seatTopWidth = isMobileLandscape ? 126 : isMobile ? 150 : 184;
  const seatSideWidth = isMobileLandscape ? 118 : isMobile ? 126 : 174;
  const seatBottomWidth = isMobileLandscape ? 126 : isMobile ? 150 : 184;
  const sideInset = isMobileLandscape ? 10 : 18;
  const topInset = isMobileLandscape ? 10 : 18;
  const cardTextSize = isMobileLandscape ? 22 : 31;
  const centerCardWidth = isMobileLandscape ? 60 : 78;
  const centerCardHeight = isMobileLandscape ? 82 : 104;

  useLayoutEffect(() => {
    function updateGeometry() {
      const boardEl = boardRef.current;
      if (!boardEl) return;

      const boardRect = boardEl.getBoundingClientRect();
      const next = {};

      for (let seat = 0; seat < 4; seat += 1) {
        const anchor = seatAnchorRefs.current[seat];
        if (!anchor) continue;

        const anchorRect = anchor.getBoundingClientRect();
        const startTop = anchorRect.top - boardRect.top + anchorRect.height / 2;
        const startLeft = anchorRect.left - boardRect.left + anchorRect.width / 2;
        const end = getCenterCardPosition(seat);
        const endTop = (parseFloat(String(end.top)) / 100) * boardRect.height;
        const endLeft = (parseFloat(String(end.left)) / 100) * boardRect.width;

        next[seat] = {
          startTop,
          startLeft,
          endTop,
          endLeft,
          rotate: getFlyingStartPosition(seat).rotate,
        };
      }

      setFlightGeometry(next);
    }

    updateGeometry();
    window.addEventListener("resize", updateGeometry);
    return () => window.removeEventListener("resize", updateGeometry);
  }, [flyingCards.length, seatCards, centerCards]);

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
          minHeight: outerMinHeight,
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

        @keyframes centerCardSettle {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.82);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0);
          }
        }

        @keyframes flyingCardMove {
          0% {
            top: var(--fly-start-top);
            left: var(--fly-start-left);
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.76) rotate(var(--fly-rotate));
            filter: blur(7px);
          }
          14% {
            opacity: 1;
            filter: blur(0);
          }
          72% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.03) rotate(0deg);
          }
          100% {
            top: var(--fly-end-top);
            left: var(--fly-end-left);
            opacity: 0;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: blur(0);
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

      {!isMobile && (
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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div
              style={{
                ...pillStyle(),
                border: "1px solid rgba(251, 191, 36, 0.32)",
                background: "rgba(251, 191, 36, 0.10)",
                fontSize: 14,
                fontWeight: 900,
                padding: "10px 16px",
              }}
            >
              Contract&nbsp; <b>{String(contractLabel || "—").replaceAll("_", " ")}</b>
            </div>

            {showTopRightTrick && (
              <div
                style={{
                  ...pillStyle(),
                  fontSize: 14,
                  fontWeight: 900,
                  padding: "10px 16px",
                }}
              >
                Slag&nbsp; <b>{trickLabel}</b>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={boardRef}
        style={{
          position: "relative",
          minHeight: boardMinHeight,
          borderRadius: 24,
          border: "1px solid rgba(251, 191, 36, 0.20)",
          background:
            "radial-gradient(circle at center, rgba(109,40,18,0.26) 0%, rgba(64,24,12,0.16) 38%, rgba(20,8,6,0.10) 72%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobileLandscape ? 250 : isMobile ? 300 : 850,
            height: isMobileLandscape ? 90 : isMobile ? 120 : 170,
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
            width: isMobileLandscape ? 220 : isMobile ? 270 : 810,
            height: isMobileLandscape ? 72 : isMobile ? 100 : 138,
            borderRadius: 30,
            border: "1px solid rgba(255, 220, 170, 0.10)",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.88,
          }}
        />

        <TableOrnaments contractLabel={contractLabel} trumpLabel={trumpLabel} />

        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobileLandscape ? 72 : isMobile ? 84 : 100,
            height: isMobileLandscape ? 64 : isMobile ? 74 : 92,
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
                fontSize: isMobileLandscape ? 10 : 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              SLAG
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: isMobileLandscape ? 16 : isMobile ? 18 : 22,
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
                  top: topInset,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: seatTopWidth,
                }
              : position === "right"
                ? {
                    position: "absolute",
                    right: sideInset,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: seatSideWidth,
                  }
                : position === "bottom"
                  ? {
                      position: "absolute",
                      bottom: topInset,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: seatBottomWidth,
                    }
                  : {
                      position: "absolute",
                      left: sideInset,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: isMobileLandscape ? 108 : isMobile ? 118 : 164,
                    };

          let badge = null;
          if (isCurrent) badge = "🎯 Aan de beurt";
          else if (isLeader) badge = "👑 Komt uit";

          const cardAnimationName =
            seat === 0 || seat === 2 ? "seatCardSlideRight" : "seatCardSlideDown";

          const cardPlacement = seat === 0 || seat === 2 ? "right" : "bottom";

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
              cardAnchorRef={(node) => {
                seatAnchorRefs.current[seat] = node;
              }}
              style={style}
            />
          );
        })}

        {centerCards.map((label, seat) => (
          <CenterPlayedCard
            key={`${seat}-${label ?? "empty"}-${animationSeed}`}
            label={label}
            seat={seat}
            animationSeed={animationSeed}
            compact={isMobile}
          />
        ))}

        {flyingCards.map((card) => (
          <FlyingCard
            key={card.id}
            id={card.id}
            label={card.label}
            seat={card.seat}
            geometry={flightGeometry?.[card.seat]}
            compact={isMobile}
          />
        ))}
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