import { useEffect, useMemo, useState } from "react";
import { storageService } from "../../core/storage/services/storageService";
import { useViewport } from "../play/useViewport";
import {
  getPlayerStats,
  getPlayerStatsByGameMode,
  getPlayerGeneralInsights,
  getDobbelkingenContractInsights,
} from "../../core/stats/statsService";

const panelStyle = {
  border: "1px solid rgba(251, 191, 36, 0.18)",
  background: "rgba(39, 27, 21, 0.84)",
  backdropFilter: "blur(18px)",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
  color: "#f5efe6",
  padding: 20,
};

const sortButtonBaseStyle = {
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5efe6",
};

const subTabButtonBaseStyle = {
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5efe6",
};

const inputStyle = {
  borderRadius: 12,
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5efe6",
  outline: "none",
  minWidth: 260,
};

function getEmptyStats() {
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    podiums: 0,
    lastPlaces: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
  };
}

function getMedalStyle(place) {
  if (place === 1) {
    return {
      background:
        "linear-gradient(180deg, rgba(251, 191, 36, 0.30) 0%, rgba(217, 119, 6, 0.16) 100%)",
      border: "1px solid rgba(251, 191, 36, 0.45)",
      color: "#fde68a",
    };
  }

  if (place === 2) {
    return {
      background:
        "linear-gradient(180deg, rgba(226, 232, 240, 0.18) 0%, rgba(148, 163, 184, 0.12) 100%)",
      border: "1px solid rgba(203, 213, 225, 0.32)",
      color: "#e2e8f0",
    };
  }

  if (place === 3) {
    return {
      background:
        "linear-gradient(180deg, rgba(180, 83, 9, 0.26) 0%, rgba(120, 53, 15, 0.16) 100%)",
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

function sortPlayers(rows, sortBy, activeSection) {
  const copy = [...rows];

  copy.sort((a, b) => {
    const aStats =
      activeSection === "dobbelkingen"
        ? a.gameModeStats?.dobbelkingen ?? getEmptyStats()
        : activeSection === "wiezen"
          ? a.gameModeStats?.wiezen ?? getEmptyStats()
          : a.generalStats;

    const bStats =
      activeSection === "dobbelkingen"
        ? b.gameModeStats?.dobbelkingen ?? getEmptyStats()
        : activeSection === "wiezen"
          ? b.gameModeStats?.wiezen ?? getEmptyStats()
          : b.generalStats;

    if (sortBy === "matchesPlayed") return bStats.matchesPlayed - aStats.matchesPlayed;
    if (sortBy === "wins") return bStats.wins - aStats.wins;
    if (sortBy === "winRate") return bStats.winRate - aStats.winRate;
    if (sortBy === "totalScore") return bStats.totalScore - aStats.totalScore;
    if (sortBy === "averageScore") return bStats.averageScore - aStats.averageScore;
    if (sortBy === "podiums") return bStats.podiums - aStats.podiums;
    if (sortBy === "bestScore") return bStats.bestScore - aStats.bestScore;
    if (sortBy === "worstScore") return aStats.worstScore - bStats.worstScore;

    return bStats.wins - aStats.wins;
  });

  return copy;
}

function StatPill({ label, value, highlight = false }) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "8px 10px",
        background: highlight ? "rgba(217, 119, 6, 0.14)" : "rgba(255,255,255,0.04)",
        border: highlight
          ? "1px solid rgba(251, 191, 36, 0.18)"
          : "1px solid rgba(255,255,255,0.06)",
        display: "grid",
        gap: 2,
        minWidth: 110,
      }}
    >
      <div style={{ fontSize: 11, color: "#c8b6a1" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#f5efe6" }}>{value}</div>
    </div>
  );
}

function StatsGrid({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 8,
      }}
    >
      {items.map((item) => (
        <StatPill
          key={item.label}
          label={item.label}
          value={item.value}
          highlight={!!item.highlight}
        />
      ))}
    </div>
  );
}

function GeneralSection({ generalStats, insights }) {
  const statItems = [
    { label: "Matches played", value: generalStats.matchesPlayed, highlight: true },
    { label: "Wins", value: generalStats.wins },
    { label: "Win%", value: `${generalStats.winRate.toFixed(1)}%` },
    { label: "Most played game", value: insights.mostPlayedGame ?? "-" },
    { label: "Least played game", value: insights.leastPlayedGame ?? "-" },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 17 }}>Algemeen</div>
      <StatsGrid items={statItems} />
    </div>
  );
}

function GameModeSection({ title, stats, extraChildren = null }) {
  const statItems = [
    { label: "Matches played", value: stats.matchesPlayed, highlight: true },
    { label: "Wins", value: stats.wins },
    { label: "Losses", value: stats.losses },
    { label: "Winrate", value: `${stats.winRate.toFixed(1)}%` },
    { label: "Podiums", value: stats.podiums },
    { label: "Last places", value: stats.lastPlaces },
    { label: "Total score", value: stats.totalScore },
    { label: "Avg score", value: stats.averageScore.toFixed(1) },
    { label: "Best score", value: stats.bestScore },
    { label: "Worst score", value: stats.worstScore },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 17 }}>{title}</div>
      <StatsGrid items={statItems} />
      {extraChildren}
    </div>
  );
}

export function StatsScreen() {
  const { isMobile, width } = useViewport();
  const [sortBy, setSortBy] = useState("wins");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [players, setPlayers] = useState(() => storageService.getPlayers());
  const [matches, setMatches] = useState(() => storageService.getMatchHistory());

  useEffect(() => {
    function refreshData() {
      setPlayers(storageService.getPlayers());
      setMatches(storageService.getMatchHistory());
    }

    window.addEventListener("smartcardmat:data-changed", refreshData);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", refreshData);
    };
  }, []);

  useEffect(() => {
    if (activeSection === "general") {
      if (!["wins", "matchesPlayed", "winRate"].includes(sortBy)) {
        setSortBy("wins");
      }
      return;
    }

    if (activeSection === "dobbelkingen") {
      if (
        ![
          "wins",
          "matchesPlayed",
          "winRate",
          "totalScore",
          "averageScore",
          "podiums",
          "bestScore",
          "worstScore",
        ].includes(sortBy)
      ) {
        setSortBy("wins");
      }
      return;
    }

    if (activeSection === "wiezen") {
      if (!["wins", "matchesPlayed", "winRate"].includes(sortBy)) {
        setSortBy("wins");
      }
    }
  }, [activeSection, sortBy]);

  const rows = useMemo(() => {
    const mapped = players.map((player) => ({
      player,
      generalStats: getPlayerStats(player.id, matches),
      gameModeStats: getPlayerStatsByGameMode(player.id, matches),
      insights: getPlayerGeneralInsights(player.id, matches),
      dobbelkingenContracts: getDobbelkingenContractInsights(player.id, matches),
    }));

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = mapped.filter(({ player, generalStats, gameModeStats }) => {
      const matchesForSection =
        activeSection === "dobbelkingen"
          ? (gameModeStats?.dobbelkingen?.matchesPlayed ?? 0)
          : activeSection === "wiezen"
            ? (gameModeStats?.wiezen?.matchesPlayed ?? 0)
            : generalStats.matchesPlayed;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLowerCase().includes(normalizedSearch);

      return matchesForSection > 0 && matchesSearch;
    });

    return sortPlayers(filtered, sortBy, activeSection);
  }, [players, matches, sortBy, searchTerm, activeSection]);

  const sortOptions =
    activeSection === "general"
      ? [
          { value: "wins", label: "Wins" },
          { value: "matchesPlayed", label: "Matches" },
          { value: "winRate", label: "Win%" },
        ]
      : activeSection === "dobbelkingen"
        ? [
            { value: "wins", label: "Wins" },
            { value: "matchesPlayed", label: "Matches" },
            { value: "winRate", label: "Winrate" },
            { value: "totalScore", label: "Total score" },
            { value: "averageScore", label: "Average score" },
            { value: "podiums", label: "Podiums" },
            { value: "bestScore", label: "Best score" },
            { value: "worstScore", label: "Worst score" },
          ]
        : activeSection === "wiezen"
          ? [
              { value: "wins", label: "Wins" },
              { value: "matchesPlayed", label: "Matches" },
              { value: "winRate", label: "Winrate" },
            ]
          : [
              { value: "wins", label: "Wins" },
              { value: "matchesPlayed", label: "Matches" },
              { value: "winRate", label: "Win%" },
            ];

  const sectionTabs = [
    { value: "general", label: "Algemeen" },
    { value: "dobbelkingen", label: "Dobbelkingen" },
    { value: "wiezen", label: "Wiezen" },
  ];

  const emptyMessage =
    searchTerm.trim().length > 0
      ? "Geen spelers gevonden."
      : activeSection === "dobbelkingen"
        ? "Nog geen spelers met gespeelde Dobbelkingen matches."
        : activeSection === "wiezen"
          ? "Nog geen spelers met gespeelde Wiezen matches."
          : "Nog geen spelers met gespeelde matches.";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <div
          style={{
            display: "grid",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Stats</h2>
            <div style={{ color: "#c8b6a1", marginTop: 4 }}>
              Overzicht van alle spelerprestaties en leaderboard rankings.
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#c8b6a1" }}>Zoek speler</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek op spelernaam..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, color: "#c8b6a1" }}>Stats section</div>
            <div
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridTemplateColumns: width >= 700 ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
                      gap: 8,
                    }
                  : { display: "flex", gap: 8, flexWrap: "wrap" }
              }
            >
              {sectionTabs.map((tab) => {
                const active = activeSection === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveSection(tab.value)}
                    style={{
                      ...subTabButtonBaseStyle,
                      background: active
                        ? "rgba(217, 119, 6, 0.18)"
                        : "rgba(255,255,255,0.04)",
                      border: active
                        ? "1px solid rgba(251, 191, 36, 0.32)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: active ? "#fde68a" : "#f5efe6",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, color: "#c8b6a1" }}>Sort by</div>

            <div
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridTemplateColumns: width >= 700 ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
                      gap: 8,
                    }
                  : { display: "flex", gap: 8, flexWrap: "wrap" }
              }
            >
              {sortOptions.map((option) => {
                const active = sortBy === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    style={{
                      ...sortButtonBaseStyle,
                      background: active
                        ? "rgba(217, 119, 6, 0.18)"
                        : "rgba(255,255,255,0.04)",
                      border: active
                        ? "1px solid rgba(251, 191, 36, 0.32)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: active ? "#fde68a" : "#f5efe6",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Leaderboard</div>

        {rows.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>{emptyMessage}</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {rows.map(
              ({ player, generalStats, gameModeStats, insights, dobbelkingenContracts }, index) => {
                const place = index + 1;
                const medalStyle = getMedalStyle(place);

                const dobbelkingenStats = gameModeStats?.dobbelkingen ?? getEmptyStats();
                const wiezenStats = gameModeStats?.wiezen ?? getEmptyStats();

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
                      gap: 14,
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
                            minWidth: 44,
                            height: 44,
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
                            Rank #{place}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 999,
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.05)",
                          fontWeight: 800,
                          color: "#fde68a",
                        }}
                      >
                        Wins: {generalStats.wins}
                      </div>
                    </div>

                    {activeSection === "general" && (
                      <GeneralSection
                        generalStats={generalStats}
                        insights={insights}
                      />
                    )}

                    {activeSection === "dobbelkingen" && (
                      <GameModeSection
                        title="Dobbelkingen"
                        stats={dobbelkingenStats}
                        extraChildren={
                          <div style={{ display: "grid", gap: 8 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 14,
                                color: "#fde68a",
                              }}
                            >
                              Contract insights
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: 8,
                              }}
                            >
                              <StatPill
                                label="Most picked contract"
                                value={dobbelkingenContracts.mostPickedContract ?? "-"}
                                highlight
                              />
                              <StatPill
                                label="Least picked contract"
                                value={dobbelkingenContracts.leastPickedContract ?? "-"}
                              />
                              <StatPill
                                label="Best contract"
                                value={dobbelkingenContracts.bestContract ?? "-"}
                              />
                              <StatPill
                                label="Worst contract"
                                value={dobbelkingenContracts.worstContract ?? "-"}
                              />
                            </div>
                          </div>
                        }
                      />
                    )}

                    {activeSection === "wiezen" && (
                      <GameModeSection title="Wiezen" stats={wiezenStats} />
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}