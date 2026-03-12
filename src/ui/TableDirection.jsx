import { useLayoutEffect, useRef, useState } from "react";
import { softCardStyle } from "./play/theme";

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

function CenterPlayedCard({ label, seat, animationSeed = "0" }) {
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
        width: 78,
        height: 104,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 31,
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

function FlyingCard({ label, seat, id, geometry }) {
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
        width: 78,
        height: 104,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.18)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 31,
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

function TableOrnaments({ contractLabel, trumpLabel, compact = false }) {
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

  if (compact) return null;

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
  compactMobile = false,
  mobileLandscape = false,
  mobileTableHeight = null,
  mobileTopInset = 0,
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

  const boardHeight = compactMobile ? (mobileTableHeight ?? (mobileLandscape ? 330 : 560)) : 450;
  const centerBandWidth = compactMobile ? (mobileLandscape ? 660 : 340) : 850;
  const centerBandHeight = compactMobile ? (mobileLandscape ? 112 : 184) : 170;
  const innerBandWidth = compactMobile ? (mobileLandscape ? 630 : 308) : 810;
  const innerBandHeight = compactMobile ? (mobileLandscape ? 90 : 156) : 138;
  const coreWidth = compactMobile ? (mobileLandscape ? 62 : 48) : 100;
  const coreHeight = compactMobile ? (mobileLandscape ? 58 : 48) : 92;

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
          minHeight: compactMobile ? boardHeight : 430,
          padding: compactMobile ? (mobileLandscape ? 8 : 6) : 18,
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

      {!compactMobile && (
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
          minHeight: boardHeight,
          borderRadius: 24,
          border: "1px solid rgba(251, 191, 36, 0.20)",
          background:
            "radial-gradient(circle at center, rgba(109,40,18,0.26) 0%, rgba(64,24,12,0.16) 38%, rgba(20,8,6,0.10) 72%, rgba(0,0,0,0) 100%)",
        }}
      >


        {compactMobile ? (
          <div
            style={{
              position: "absolute",
              left: mobileLandscape ? "auto" : "50%",
              right: mobileLandscape ? 14 : "auto",
              top: mobileLandscape ? "auto" : "72%",
              bottom: mobileLandscape ? 14 : "auto",
              transform: mobileLandscape ? "none" : "translate(-50%, -50%)",
              zIndex: 13,
              width: mobileLandscape ? 176 : 156,
              borderRadius: 20,
              padding: mobileLandscape ? "10px 12px" : "9px 10px",
              background: "rgba(28, 16, 12, 0.76)",
              border: "1px solid rgba(255, 210, 140, 0.16)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
              backdropFilter: "blur(8px)",
              color: "#f6e6cf",
            }}
          >
            <div style={{ fontSize: 10, color: "rgba(255,225,180,0.62)", textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 800 }}>Contract</div>
            <div style={{ marginTop: 4, fontSize: mobileLandscape ? 15 : 14, fontWeight: 900, lineHeight: 1.15, wordBreak: "break-word" }}>
              {String(contractLabel || "—").replaceAll("_", " ")}
            </div>
            {trumpLabel && trumpLabel !== "—" ? <div style={{ marginTop: 6, fontSize: 11, color: "#d7c4af", fontWeight: 700 }}>{trumpLabel}</div> : null}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: centerBandWidth,
            height: centerBandHeight,
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
            width: innerBandWidth,
            height: innerBandHeight,
            borderRadius: 30,
            border: "1px solid rgba(255, 220, 170, 0.10)",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.88,
          }}
        />

        {!compactMobile ? <TableOrnaments contractLabel={contractLabel} trumpLabel={trumpLabel} compact={false} /> : null}

        <div
          style={{
            position: "absolute",
            top: "50.5%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: coreWidth,
            height: coreHeight,
            borderRadius: 20,
            border: "1px solid rgba(255, 220, 170, 0.10)",
            background: "rgba(255,255,255,0.03)",
            boxShadow: "inset 0 0 18px rgba(255, 190, 90, 0.08)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {showCenterTrickLabel && !compactMobile && (
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
                  top: compactMobile ? mobileTopInset + (mobileLandscape ? 8 : 10) : 18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: compactMobile ? (mobileLandscape ? 138 : 136) : 184,
                }
              : position === "right"
                ? {
                    position: "absolute",
                    right: compactMobile ? (mobileLandscape ? 14 : 10) : 18,
                    top: compactMobile ? (mobileLandscape ? "50%" : "50%") : "50%",
                    transform: "translateY(-50%)",
                    width: compactMobile ? (mobileLandscape ? 128 : 112) : 174,
                  }
                : position === "bottom"
                  ? {
                      position: "absolute",
                      bottom: compactMobile ? (mobileLandscape ? 12 : 8) : 18,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: compactMobile ? (mobileLandscape ? 138 : 136) : 184,
                    }
                  : {
                      position: "absolute",
                      left: compactMobile ? (mobileLandscape ? 14 : 10) : 18,
                      top: compactMobile ? (mobileLandscape ? "50%" : "50%") : "50%",
                      transform: "translateY(-50%)",
                      width: compactMobile ? (mobileLandscape ? 124 : 112) : 164,
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
          />
        ))}

        {flyingCards.map((card) => (
          <FlyingCard
            key={card.id}
            id={card.id}
            label={card.label}
            seat={card.seat}
            geometry={flightGeometry?.[card.seat]}
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