import { seatMoveButtonStyle } from "./playersTheme";

function SeatPlayerCard({
  player,
  index,
  compactMobile,
  isLandscape,
  locked,
  selectedPlayersLength,
  onRemoveSeatPlayer,
  onMovePlayerLeft,
  onMovePlayerRight,
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "10px 14px",
        border: "1px solid rgba(251, 191, 36, 0.24)",
        background: "rgba(217, 119, 6, 0.12)",
        minWidth: compactMobile ? 0 : 170,
        position: "relative",
      }}
    >
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

      <div style={{ fontSize: 12, color: "#d6c4b1" }}>Seat {index + 1}</div>

      <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>

      <div style={{ fontSize: 12, color: "#c8b6a1", marginTop: 4 }}>
        {player.isGuest ? "Tijdelijke gastspeler" : "Vaste speler"}
      </div>

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
              isLandscape={isLandscape}
              locked={locked}
              selectedPlayersLength={selectedPlayers.length}
              onRemoveSeatPlayer={onRemoveSeatPlayer}
              onMovePlayerLeft={onMovePlayerLeft}
              onMovePlayerRight={onMovePlayerRight}
            />
          ))}
        </div>
      )}

      {selectedPlayers.length === 4 ? (
        <div style={{ marginBottom: 18, marginTop: 18 }}>
          <button
            type="button"
            onClick={() => onGoPlay?.()}
            style={{
              ...actionButtonStyle,
              width: compactMobile ? "100%" : "auto",
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
