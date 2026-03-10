import { useMemo, useState } from "react";
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

const selectStyle = {
  borderRadius: 12,
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5efe6",
  outline: "none",
};

function getMedalStyle(place) {
  if (place === 1) {
    return {
      background: "linear-gradient(180deg, rgba(251, 191, 36, 0.30) 0%, rgba(217, 119, 6, 0.16) 100%)",
      border: "1px solid rgba(251, 191, 36, 0.45)",
      color: "#fde68a",
    };
  }

  if (place === 2) {
    return {
      background: "linear-gradient(180deg, rgba(226, 232, 240, 0.18) 0%, rgba(148, 163, 184, 0.12) 100%)",
      border: "1px solid rgba(203, 213, 225, 0.32)",
      color: "#e2e8f0",
    };
  }

  if (place === 3) {
    return {
      background: "linear-gradient(180deg, rgba(180, 83, 9, 0.26) 0%, rgba(120, 53, 15, 0.16) 100%)",
      border: "1px solid rgba(217, 119, 6, 0.34)",
      color: "#fdba74",
    };
  }

  return {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f5efe6",
  };
}

function getPlaceLabel(place) {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";
  return `#${place}`;
}

function sortPlayers(rows, sortBy) {
  const copy = [...rows];

  copy.sort((a, b) => {
    const aStats = a.stats;
    const bStats = b.stats;

    if (sortBy === "wins") return bStats.wins - aStats.wins;
    if (sortBy === "winRate") return bStats.winRate - aStats.winRate;
    if (sortBy === "totalScore") return bStats.totalScore - aStats.totalScore;
    if (sortBy === "averageScore") return bStats.averageScore - aStats.averageScore;
    if (sortBy === "podiums") return bStats.podiums - aStats.podiums;
    if (sortBy === "matchesPlayed") return bStats.matchesPlayed - aStats.matchesPlayed;

    return bStats.wins - aStats.wins;
  });

  return copy;
}

export function StatsScreen() {
  const [sortBy, setSortBy] = useState("wins");

  const players = useMemo(() => storageService.getPlayers(), []);
  const matches = useMemo(() => storageService.getMatchHistory(), []);

  const rows = useMemo(() => {
    const mapped = players.map((player) => ({
      player,
      stats: storageService.getPlayerStats(player.id),
    }));

    return sortPlayers(mapped, sortBy);
  }, [players, matches, sortBy]);

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
          <div>
            <h2 style={{ margin: 0 }}>Stats</h2>
            <div style={{ color: "#c8b6a1", marginTop: 4 }}>
              Overzicht van alle spelerprestaties en leaderboard rankings.
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#c8b6a1" }}>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="wins">Wins</option>
              <option value="winRate">Winrate</option>
              <option value="totalScore">Total score</option>
              <option value="averageScore">Average score</option>
              <option value="podiums">Podiums</option>
              <option value="matchesPlayed">Matches played</option>
            </select>
          </div>
        </div>

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Leaderboard</div>

        {rows.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>Nog geen spelers of stats beschikbaar.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map(({ player, stats }, index) => {
              const place = index + 1;
              const medalStyle = getMedalStyle(place);

              return (
                <div
                  key={player.id}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    border:
                      place === 1
                        ? "1px solid rgba(251, 191, 36, 0.34)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      place === 1
                        ? "rgba(217, 119, 6, 0.14)"
                        : "rgba(255,255,255,0.03)",
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
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div
                        style={{
                          minWidth: 42,
                          height: 42,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 900,
                          ...medalStyle,
                        }}
                      >
                        {getPlaceLabel(place)}
                      </div>

                      <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                          {player.name}
                        </div>
                        <div style={{ color: "#c8b6a1", fontSize: 13 }}>
                          {stats.matchesPlayed} matches gespeeld
                        </div>
                      </div>
                    </div>

                    <div style={{ color: "#fde68a", fontWeight: 800 }}>
                      Wins: {stats.wins}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      color: "#e8d9c9",
                      fontSize: 13,
                    }}
                  >
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}