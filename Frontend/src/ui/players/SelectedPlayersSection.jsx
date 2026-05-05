import { seatMoveButtonStyle } from "./playersTheme";

function SeatPlayerCard({
  player,
  index,
  compactMobile,
  locked,
  selectedPlayersLength,
  tableDealerSeat,
  onSetDealerSeat,
  onRemoveSeatPlayer,
  onMovePlayerLeft,
  onMovePlayerRight,
}) {
  const isDealer = selectedPlayersLength === 4 && tableDealerSeat === index;

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "10px 14px",
        border: isDealer
          ? "1px solid rgba(251, 191, 36, 0.58)"
          : "1px solid rgba(251, 191, 36, 0.24)",
        background: isDealer
          ? "radial-gradient(circle at top, rgba(251,191,36,0.18), transparent 45%), rgba(217, 119, 6, 0.15)"
          : "rgba(217, 119, 6, 0.12)",
        minWidth: compactMobile ? 0 : 170,
        position: "relative",
        boxShadow: isDealer ? "0 0 22px rgba(251, 191, 36, 0.10)" : undefined,
      }}
    >
      {isDealer ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "4px 8px",
            borderRadius: 999,
            background: "linear-gradient(180deg, #fbbf24, #f59e0b)",
            color: "#241305",
            border: "1px solid rgba(255,255,255,0.28)",
            fontSize: 10,
            fontWeight: 1000,
            textTransform: "uppercase",
            boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
          }}
        >
          Dealer
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onRemoveSeatPlayer(player.id)}
        disabled={locked}
        onMouseEnter={(e) => {
          if (locked) return;
          e.currentTarget.style.background = "rgba(127, 29, 29, 0.55)";
          e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.18)";
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "1px solid rgba(251, 191, 36, 0.18)",
          background: "rgba(255,255,255,0.06)",
          color: "#f5efe6",
          fontWeight: 900,
          fontSize: 16,
          display: "grid",
          placeItems: "center",
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.5 : 1,
          padding: 0,
          lineHeight: 1,
          textAlign: "center",
          transition:
            "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
        }}
        title="Verwijder speler uit seat"
      >
        <span
          style={{
            display: "block",
            lineHeight: 0,
            transform: "translateY(-2px)",
          }}
        >
          ×
        </span>
      </button>

      <div style={{ fontSize: 12, color: "#d6c4b1", marginTop: isDealer ? 28 : 0 }}>
        Seat {index + 1}
      </div>

      <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>

      <div style={{ fontSize: 12, color: "#c8b6a1", marginTop: 4 }}>
        {player.isGuest ? "Tijdelijke gastspeler" : "Vaste speler"}
      </div>

      {selectedPlayersLength === 4 ? (
        <button
          type="button"
          disabled={locked || isDealer}
          onClick={() => onSetDealerSeat?.(index)}
          style={{
            marginTop: 10,
            width: "100%",
            borderRadius: 12,
            border: isDealer
              ? "1px solid rgba(251, 191, 36, 0.35)"
              : "1px solid rgba(255,255,255,0.10)",
            background: isDealer
              ? "rgba(251, 191, 36, 0.14)"
              : "rgba(255,255,255,0.045)",
            color: isDealer ? "#fef3c7" : "#d6c4b1",
            padding: "8px 10px",
            fontWeight: 900,
            cursor: locked || isDealer ? "default" : "pointer",
            opacity: locked ? 0.55 : 1,
          }}
          title="Kies deze speler als eerste dealer"
        >
          {isDealer ? "Eerste dealer" : "Maak dealer"}
        </button>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
        }}
      >
        <button
          type="button"
          onClick={() => onMovePlayerLeft(index)}
          disabled={locked || index === 0}
          onMouseEnter={(e) => {
            if (locked || index === 0) return;
            e.currentTarget.style.background = "rgba(217, 119, 6, 0.18)";
            e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            ...seatMoveButtonStyle,
            opacity: locked || index === 0 ? 0.4 : 1,
            cursor: locked || index === 0 ? "not-allowed" : "pointer",
            transition:
              "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
          }}
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => onMovePlayerRight(index)}
          disabled={locked || index === selectedPlayersLength - 1}
          onMouseEnter={(e) => {
            if (locked || index === selectedPlayersLength - 1) return;
            e.currentTarget.style.background = "rgba(217, 119, 6, 0.18)";
            e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            ...seatMoveButtonStyle,
            opacity: locked || index === selectedPlayersLength - 1 ? 0.4 : 1,
            cursor:
              locked || index === selectedPlayersLength - 1
                ? "not-allowed"
                : "pointer",
            transition:
              "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

export function SelectedPlayersSection({
  selectedPlayers,
  compactMobile,
  isLandscape,
  locked,
  tableDealerSeat,
  onSetDealerSeat,
  onRemoveSeatPlayer,
  onMovePlayerLeft,
  onMovePlayerRight,
  onGoPlay,
  actionButtonStyle,
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>
        Geselecteerde spelers ({selectedPlayers.length}/4)
      </div>

      {selectedPlayers.length === 0 ? (
        <div style={{ color: "#c8b6a1" }}>Nog geen spelers geselecteerd.</div>
      ) : (
        <div
          style={{
            display: compactMobile ? "grid" : "flex",
            gridTemplateColumns: compactMobile
              ? isLandscape
                ? "repeat(4, minmax(0, 1fr))"
                : "repeat(2, minmax(0, 1fr))"
              : undefined,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {selectedPlayers.map((player, index) => (
            <SeatPlayerCard
              key={player.id}
              player={player}
              index={index}
              compactMobile={compactMobile}
              locked={locked}
              selectedPlayersLength={selectedPlayers.length}
              tableDealerSeat={tableDealerSeat}
              onSetDealerSeat={onSetDealerSeat}
              onRemoveSeatPlayer={onRemoveSeatPlayer}
              onMovePlayerLeft={onMovePlayerLeft}
              onMovePlayerRight={onMovePlayerRight}
            />
          ))}
        </div>
      )}

      {selectedPlayers.length === 4 ? (
        <div
          style={{
            marginTop: 14,
            marginBottom: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: "12px 14px",
              border: "1px solid rgba(251, 191, 36, 0.22)",
              background: "rgba(120, 53, 15, 0.26)",
              color: "#fef3c7",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            Kies wie als eerste deelt. Daarna schuift de dealer automatisch door na elke ronde.
          </div>

          <button
            type="button"
            onClick={() => onGoPlay?.()}
            style={{
              ...actionButtonStyle,
              width: compactMobile ? "100%" : "fit-content",
              minHeight: 46,
              padding: "12px 18px",
              background:
                "linear-gradient(180deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 0.92) 100%)",
              border: "1px solid rgba(134, 239, 172, 0.34)",
              boxShadow: "0 14px 28px rgba(22, 163, 74, 0.22)",
            }}
          >
            Naar Play tab
          </button>
        </div>
      ) : null}
    </div>
  );
}