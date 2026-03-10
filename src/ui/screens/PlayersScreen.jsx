import { useEffect, useMemo, useState } from "react";
import { storageService } from "../../core/storage/services/storageService";

const panelStyle = {
  border: "1px solid rgba(251, 191, 36, 0.18)",
  background: "rgba(39, 27, 21, 0.84)",
  backdropFilter: "blur(18px)",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
  color: "#f5efe6",
  padding: 20,
};

const buttonStyle = {
  borderRadius: 12,
  padding: "8px 12px",
  fontWeight: 800,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  color: "#f5efe6",
};

const actionButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(217, 119, 6, 0.28) 0%, rgba(180, 83, 9, 0.18) 100%)",
  border: "1px solid rgba(251, 191, 36, 0.3)",
};

const guestButtonStyle = {
  ...buttonStyle,
  width: "100%",
  textAlign: "left",
  padding: 14,
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(59, 130, 246, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%)",
  border: "1px dashed rgba(96, 165, 250, 0.35)",
};

const seatMoveButtonStyle = {
  borderRadius: 10,
  padding: "6px 10px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5efe6",
};

function normalizeSelection(players) {
  return Array.isArray(players) ? players.slice(0, 4) : [];
}

function getNextGuestNumber(selectedPlayers) {
  const guestNumbers = selectedPlayers
    .map((player) => {
      const match = String(player?.name ?? "").match(/^Gast\s+(\d+)$/i);
      return match ? Number(match[1]) : null;
    })
    .filter((n) => typeof n === "number" && !Number.isNaN(n));

  if (guestNumbers.length === 0) return 1;
  return Math.max(...guestNumbers) + 1;
}

function moveItem(array, fromIndex, toIndex) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function PlayersScreen({ appState, dispatchAction, locked = false }) {
  const [profiles, setProfiles] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [error, setError] = useState("");

  const selectedPlayers = useMemo(
    () => normalizeSelection(appState?.players),
    [appState?.players]
  );

  function refreshProfiles() {
    setProfiles(storageService.getPlayers());
  }

  useEffect(() => {
    refreshProfiles();
  }, []);

  function handleCreatePlayer(event) {
    event.preventDefault();

    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    try {
      setError("");
      storageService.createPlayer(newPlayerName);
      setNewPlayerName("");
      refreshProfiles();
    } catch (err) {
      setError(err?.message ?? "Kon speler niet aanmaken.");
    }
  }

  function handleTogglePlayer(profile) {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    const exists = selectedPlayers.some((player) => player.id === profile.id);

    if (exists) {
      const nextPlayers = selectedPlayers.filter(
        (player) => player.id !== profile.id
      );

      dispatchAction({ type: "set_players", players: nextPlayers });
      return;
    }

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextPlayers = [
      ...selectedPlayers,
      { id: profile.id, name: profile.name },
    ];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleAddGuest() {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextGuestNumber = getNextGuestNumber(selectedPlayers);
    const guestPlayer = {
      id: `guest_${Date.now()}_${nextGuestNumber}`,
      name: `Gast ${nextGuestNumber}`,
      isGuest: true,
    };

    const nextPlayers = [...selectedPlayers, guestPlayer];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleClearSelection() {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    dispatchAction({ type: "set_players", players: [] });
  }

  function handleMovePlayerLeft(index) {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    if (index <= 0) return;

    const nextPlayers = moveItem(selectedPlayers, index, index - 1);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleMovePlayerRight(index) {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    if (index >= selectedPlayers.length - 1) return;

    const nextPlayers = moveItem(selectedPlayers, index, index + 1);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleRemoveGuest(playerId) {
    if (locked) {
      setError("Spelers zijn vergrendeld terwijl een match bezig is.");
      return;
    }

    const nextPlayers = selectedPlayers.filter((p) => p.id !== playerId);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  const profileStats = profiles.map((profile) => ({
    profile,
    stats: storageService.getPlayerStats(profile.id),
  }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <h2 style={{ margin: 0 }}>Players</h2>

          <button
            onClick={handleClearSelection}
            style={{
              ...buttonStyle,
              opacity: locked ? 0.5 : 1,
              cursor: locked ? "not-allowed" : "pointer",
            }}
            disabled={locked}
          >
            Clear selection
          </button>
        </div>

        <div style={{ color: "#c8b6a1", marginBottom: 10 }}>
          Maak lokale spelers aan en kies exact 4 spelers voor de huidige
          match.
        </div>

        <div
          style={{
            marginBottom: 18,
            borderRadius: 14,
            padding: "10px 12px",
            background: "rgba(217, 119, 6, 0.10)",
            border: "1px solid rgba(251, 191, 36, 0.16)",
            color: "#fde68a",
            fontWeight: 700,
          }}
        >
          Seat 1 → Seat 4 is de volgorde waarin de spelers aan tafel zitten en
          spelen. Gebruik de pijltjes om de speelvolgorde te wijzigen.
        </div>

        {locked ? (
          <div
            style={{
              marginBottom: 14,
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(180, 83, 9, 0.18)",
              border: "1px solid rgba(251, 191, 36, 0.22)",
              color: "#fde68a",
              fontWeight: 700,
            }}
          >
            Players zijn vergrendeld terwijl een match bezig is.
          </div>
        ) : null}

        <form
          onSubmit={handleCreatePlayer}
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <input
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nieuwe spelernaam"
            disabled={locked}
            style={{
              flex: "1 1 240px",
              minWidth: 220,
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#f5efe6",
              outline: "none",
              opacity: locked ? 0.6 : 1,
            }}
          />

          <button
            type="submit"
            style={{
              ...actionButtonStyle,
              opacity: locked ? 0.5 : 1,
              cursor: locked ? "not-allowed" : "pointer",
            }}
            disabled={locked}
          >
            Create player
          </button>
        </form>

        {error ? (
          <div
            style={{
              marginBottom: 14,
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(127, 29, 29, 0.55)",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              color: "#fee2e2",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Geselecteerde spelers ({selectedPlayers.length}/4)
          </div>

          {selectedPlayers.length === 0 ? (
            <div style={{ color: "#c8b6a1" }}>Nog geen spelers geselecteerd.</div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {selectedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    borderRadius: 16,
                    padding: "10px 14px",
                    border: "1px solid rgba(251, 191, 36, 0.24)",
                    background: "rgba(217, 119, 6, 0.12)",
                    minWidth: 170,
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (locked) {
                        setError("Spelers zijn vergrendeld terwijl een match bezig is.");
                        return;
                      }

                      const nextPlayers = selectedPlayers.filter((p) => p.id !== player.id);
                      dispatchAction({ type: "set_players", players: nextPlayers });
                    }}
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
                      transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
                    }}
                    title="Verwijder speler uit seat"
                  >
                    <span
                      style={{
                        display: "block",
                        lineHeight: -0.5,
                        transform: "translateY(-1px)",
                      }}
                    >
                      ×
                    </span>
                  </button>

                  <div style={{ fontSize: 12, color: "#d6c4b1" }}>
                    Seat {index + 1}
                  </div>

                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {player.name}
                  </div>

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
                      onClick={() => handleMovePlayerLeft(index)}
                      disabled={locked || index === 0}
                      style={{
                        ...seatMoveButtonStyle,
                        opacity: locked || index === 0 ? 0.4 : 1,
                        cursor: locked || index === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMovePlayerRight(index)}
                      disabled={locked || index === selectedPlayers.length - 1}
                      style={{
                        ...seatMoveButtonStyle,
                        opacity:
                          locked || index === selectedPlayers.length - 1 ? 0.4 : 1,
                        cursor:
                          locked || index === selectedPlayers.length - 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontWeight: 900, marginBottom: 10 }}>
          Beschikbare profielen
        </div>

        {profileStats.length === 0 ? (
          <div style={{ color: "#c8b6a1", marginBottom: 12 }}>
            Nog geen spelers opgeslagen. Maak eerst een speler aan.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
            {profileStats.map(({ profile, stats }) => {
              const isSelected = selectedPlayers.some(
                (player) => player.id === profile.id
              );

              return (
                <button
                  key={profile.id}
                  onClick={() => handleTogglePlayer(profile)}
                  disabled={locked}
                  style={{
                    textAlign: "left",
                    borderRadius: 18,
                    padding: 14,
                    cursor: locked ? "not-allowed" : "pointer",
                    border: isSelected
                      ? "1px solid rgba(251, 191, 36, 0.42)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(217, 119, 6, 0.16)"
                      : "rgba(255,255,255,0.03)",
                    color: "#f5efe6",
                    opacity: locked ? 0.65 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>
                        {profile.name}
                      </div>
                      <div style={{ color: "#c8b6a1", fontSize: 13 }}>
                        {isSelected ? "Geselecteerd" : "Klik om te selecteren"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        color: "#e8d9c9",
                        fontSize: 13,
                      }}
                    >
                      <span>Matches: {stats.matchesPlayed}</span>
                      <span>Wins: {stats.wins}</span>
                      <span>Winrate: {stats.winRate.toFixed(1)}%</span>
                      <span>Score: {stats.totalScore}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Snelle opties</div>

        <button
          onClick={handleAddGuest}
          disabled={locked || selectedPlayers.length >= 4}
          style={{
            ...guestButtonStyle,
            opacity: locked || selectedPlayers.length >= 4 ? 0.55 : 1,
            cursor:
              locked || selectedPlayers.length >= 4 ? "not-allowed" : "pointer",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>+ Gast toevoegen</div>
          <div style={{ color: "#bfdbfe", fontSize: 13, marginTop: 4 }}>
            Tijdelijke speler voor deze match, zonder profiel of opgeslagen
            stats.
          </div>
        </button>
      </div>
    </div>
  );
}