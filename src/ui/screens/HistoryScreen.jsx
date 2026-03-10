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

const dangerButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(127, 29, 29, 0.75) 0%, rgba(80, 20, 20, 0.75) 100%)",
  border: "1px solid rgba(248, 113, 113, 0.35)",
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString ?? "-";
  }
}

export function HistoryScreen({ appState }) {
  const [matches, setMatches] = useState([]);

  function refreshMatches() {
    setMatches(storageService.getMatchHistory());
  }

  useEffect(() => {
    refreshMatches();
  }, []);

  const selectedPlayers = appState?.players ?? [];

  const selectedStats = useMemo(
    () =>
      selectedPlayers.map((player) => ({
        player,
        stats: storageService.getPlayerStats(player.id),
      })),
    [selectedPlayers, matches]
  );

  function handleDeleteMatch(matchId) {
    storageService.deleteMatch(matchId);
    refreshMatches();
  }

  function handleClearAll() {
    const ok = window.confirm("Ben je zeker dat je alle match history wilt wissen?");
    if (!ok) return;

    storageService.clearMatchHistory();
    refreshMatches();
  }

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
          <h2 style={{ margin: 0 }}>Match history</h2>

          <button onClick={handleClearAll} style={dangerButtonStyle}>
            Clear all
          </button>
        </div>

        <div style={{ color: "#c8b6a1", marginBottom: 18 }}>
          Overzicht van gespeelde matches en globale spelerstatistieken.
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Stats van huidige selectie
          </div>

          {selectedStats.length === 0 ? (
            <div style={{ color: "#c8b6a1" }}>
              Kies eerst spelers in de Players tab.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedStats.map(({ player, stats }) => (
                <div
                  key={player.id}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      color: "#e8d9c9",
                      fontSize: 13,
                    }}
                  >
                    <span>Matches: {stats.matchesPlayed}</span>
                    <span>Wins: {stats.wins}</span>
                    <span>Losses: {stats.losses}</span>
                    <span>Winrate: {stats.winRate.toFixed(1)}%</span>
                    <span>Podiums: {stats.podiums}</span>
                    <span>Podiumrate: {stats.podiumRate.toFixed(1)}%</span>
                    <span>Last places: {stats.lastPlaces}</span>
                    <span>Total score: {stats.totalScore}</span>
                    <span>Avg score: {stats.averageScore.toFixed(1)}</span>
                    <span>Best: {stats.bestScore}</span>
                    <span>Worst: {stats.worstScore}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Recente matches</div>

        {matches.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>Nog geen gespeelde matches.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {matches.map((match) => {
              const winnerId = match.winnerIds?.[0] ?? null;
              const winnerPlayer =
                match.players?.find((player) => player.playerId === winnerId) ?? null;

              return (
                <div
                  key={match.id}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    display: "grid",
                    gap: 10,
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
                        {match.gameType}
                      </div>
                      <div style={{ color: "#c8b6a1", fontSize: 13 }}>
                        {formatDate(match.playedAt)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 999,
                          padding: "8px 12px",
                          background: "rgba(217, 119, 6, 0.14)",
                          border: "1px solid rgba(251, 191, 36, 0.24)",
                          fontWeight: 800,
                        }}
                      >
                        Winner: {winnerPlayer?.name ?? "-"}
                      </div>

                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#c8b6a1", marginBottom: 6 }}>Players</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {(match.players ?? []).map((player) => (
                        <div
                          key={player.playerId}
                          style={{
                            borderRadius: 12,
                            padding: "6px 10px",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "#c8b6a1", marginBottom: 6 }}>Scores</div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {(match.scores ?? []).map((row) => {
                        const player =
                          match.players?.find(
                            (entry) => entry.playerId === row.playerId
                          ) ?? null;

                        return (
                          <div
                            key={`${match.id}-${row.playerId}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              flexWrap: "wrap",
                              borderRadius: 12,
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.03)",
                            }}
                          >
                            <span>{player?.name ?? row.playerId}</span>
                            <span>
                              Score: {row.score} · Rank: {row.rank}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}