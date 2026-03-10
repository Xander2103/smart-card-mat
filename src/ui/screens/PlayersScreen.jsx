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

function normalizeSelection(players) {
  return Array.isArray(players) ? players.slice(0, 4) : [];
}

export function PlayersScreen({ appState, dispatchAction }) {
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

  function handleClearSelection() {
    dispatchAction({ type: "set_players", players: [] });
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

          <button onClick={handleClearSelection} style={buttonStyle}>
            Clear selection
          </button>
        </div>

        <div style={{ color: "#c8b6a1", marginBottom: 18 }}>
          Maak lokale spelers aan en kies maximaal 4 spelers voor de huidige
          match.
        </div>

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
            style={{
              flex: "1 1 240px",
              minWidth: 220,
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#f5efe6",
              outline: "none",
            }}
          />

          <button type="submit" style={actionButtonStyle}>
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
                    minWidth: 140,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#d6c4b1" }}>
                    Seat {index + 1}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {player.name}
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
          <div style={{ color: "#c8b6a1" }}>
            Nog geen spelers opgeslagen. Maak eerst een speler aan.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {profileStats.map(({ profile, stats }) => {
              const isSelected = selectedPlayers.some(
                (player) => player.id === profile.id
              );

              return (
                <button
                  key={profile.id}
                  onClick={() => handleTogglePlayer(profile)}
                  style={{
                    textAlign: "left",
                    borderRadius: 18,
                    padding: 14,
                    cursor: "pointer",
                    border: isSelected
                      ? "1px solid rgba(251, 191, 36, 0.42)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(217, 119, 6, 0.16)"
                      : "rgba(255,255,255,0.03)",
                    color: "#f5efe6",
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
      </div>
    </div>
  );
}