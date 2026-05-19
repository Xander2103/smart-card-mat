import { useEffect, useMemo, useState } from "react";
import { getMatchesFromApi } from "../../core/api/matchApi";
import { storageService } from "../../core/storage/services/storageService";
import { useViewport } from "../play/useViewport";
import {
  getPlayerStats,
  getPlayerStatsByGameMode,
  getDobbelkingenContractInsights,
  getKleurenwiezenInsights,
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

const refreshButtonStyle = {
  borderRadius: 12,
  padding: "9px 13px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(34,197,94,0.35)",
  background:
    "linear-gradient(180deg, rgba(34,197,94,0.22) 0%, rgba(21,128,61,0.18) 100%)",
  color: "#bbf7d0",
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

function normalizeApiPlayers(apiMatch, rawState) {
  if (Array.isArray(rawState?.players) && rawState.players.length > 0) {
    return rawState.players;
  }

  return (apiMatch?.players ?? []).map((player) => ({
    playerId: player.player_id,
    name: player.name,
    userId: player.user_id ?? null,
    source: player.source ?? "guest",
    username: player.username ?? null,
  }));
}

function normalizeApiScores(apiMatch, rawState) {
  if (Array.isArray(rawState?.scores) && rawState.scores.length > 0) {
    return rawState.scores;
  }

  return (apiMatch?.players ?? []).map((player) => ({
    playerId: player.player_id,
    score: Number(player.score ?? 0),
    rank: player?.stats?.rank ?? null,
  }));
}

function normalizeApiWinnerIds(apiMatch, rawState) {
  if (Array.isArray(rawState?.winnerIds)) {
    return rawState.winnerIds;
  }

  const winners = (apiMatch?.players ?? [])
    .filter((player) => player.is_winner)
    .map((player) => player.player_id);

  if (winners.length > 0) return winners;

  return apiMatch?.winner_player_id ? [apiMatch.winner_player_id] : [];
}

function normalizeApiMatch(apiMatch) {
  const rawState = apiMatch?.raw_state ?? {};
  const clientMatchId =
    apiMatch?.client_match_id ?? rawState?.id ?? `api_${apiMatch.id}`;

  return {
    ...rawState,
    id: clientMatchId,
    apiId: apiMatch.id,
    apiSyncStatus: "synced",
    isOnlineMatch: true,
    isOnlineOnly: true,

    gameType: rawState?.gameType ?? apiMatch?.mode ?? "-",
    playedAt:
      rawState?.playedAt ?? apiMatch?.played_at ?? apiMatch?.created_at ?? null,
    winnerIds: normalizeApiWinnerIds(apiMatch, rawState),
    players: normalizeApiPlayers(apiMatch, rawState),
    scores: normalizeApiScores(apiMatch, rawState),
    metadata: rawState?.metadata ?? {},
    gameData: rawState?.gameData ?? {},
  };
}

function getMatchMergeKey(match) {
  return match?.id ?? match?.client_match_id ?? `api_${match?.apiId}`;
}

function mergeMatches(localMatches, apiMatches) {
  const merged = new Map();

  for (const localMatch of localMatches) {
    merged.set(getMatchMergeKey(localMatch), {
      ...localMatch,
      isOnlineOnly: false,
    });
  }

  for (const apiMatch of apiMatches) {
    const normalized = normalizeApiMatch(apiMatch);
    const key = getMatchMergeKey(normalized);
    const existing = merged.get(key);

    merged.set(key, {
      ...existing,
      ...normalized,
      isOnlineOnly: !existing,
    });
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );
}

function buildAccountPlayersFromMatches(matches = []) {
  const playersById = new Map();

  for (const match of matches) {
    for (const player of match.players ?? []) {
      if (player?.source !== "user") continue;

      const id = player?.playerId ?? player?.id;
      if (!id) continue;

      const existing = playersById.get(id);

      playersById.set(id, {
        id,
        name: existing?.name ?? player?.name ?? "Unknown player",
        userId: existing?.userId ?? player?.userId ?? null,
        source: "user",
        username: existing?.username ?? player?.username ?? null,
        isFromMatchHistory: true,
      });
    }
  }

  return [...playersById.values()];
}

function getCurrentAccountPlayer(authUser, accountPlayers = []) {
  if (!authUser?.id) return null;

  const expectedPlayerId = `user_${authUser.id}`;

  const existing =
    accountPlayers.find((player) => Number(player.userId) === Number(authUser.id)) ??
    accountPlayers.find((player) => player.id === expectedPlayerId) ??
    null;

  if (existing) {
    return {
      ...existing,
      id: existing.id ?? expectedPlayerId,
      userId: authUser.id,
      source: "user",
      name: authUser.name ?? existing.name,
      username: authUser.username ?? existing.username ?? null,
    };
  }

  return {
    id: expectedPlayerId,
    name: authUser.name ?? "Mijn account",
    userId: authUser.id,
    source: "user",
    username: authUser.username ?? null,
  };
}

function getFriendPlayers(authUser, accountPlayers = []) {
  if (!authUser?.id) return accountPlayers;

  return accountPlayers.filter(
    (player) => Number(player.userId) !== Number(authUser.id)
  );
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

function getStatsForSection(row, activeSection) {
  if (activeSection === "dobbelkingen") {
    return row.gameModeStats?.dobbelkingen ?? getEmptyStats();
  }

  if (activeSection === "wiezen") {
    return row.gameModeStats?.wiezen ?? getEmptyStats();
  }

  if (activeSection === "kleurenwiezen") {
    return row.gameModeStats?.kleurenwiezen ?? getEmptyStats();
  }

  return row.generalStats;
}

function sortPlayers(rows, sortBy, activeSection) {
  const copy = [...rows];

  copy.sort((a, b) => {
    const aStats = getStatsForSection(a, activeSection);
    const bStats = getStatsForSection(b, activeSection);

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

function GeneralSection({ generalStats }) {
  const statItems = [
    { label: "Matches played", value: generalStats.matchesPlayed, highlight: true },
    { label: "Wins", value: generalStats.wins },
    { label: "Win%", value: `${generalStats.winRate.toFixed(1)}%` },
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

function PlayerStatsCard({
  row,
  place,
  leaderboardRank = null,
  activeSection,
  isOwnAccount = false,
}) {
  const {
    player,
    generalStats,
    gameModeStats,
    dobbelkingenContracts,
    kleurenwiezenInsights,
  } = row;

  const medalStyle = getMedalStyle(leaderboardRank ?? place);

  const dobbelkingenStats = gameModeStats?.dobbelkingen ?? getEmptyStats();
  const kleurenwiezenStats = gameModeStats?.kleurenwiezen ?? getEmptyStats();
  const wiezenStats = gameModeStats?.wiezen ?? getEmptyStats();

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        border: isOwnAccount
          ? "1px solid rgba(34,197,94,0.38)"
          : (leaderboardRank ?? place) === 1
            ? "1px solid rgba(251, 191, 36, 0.34)"
            : "1px solid rgba(255,255,255,0.08)",
        background: isOwnAccount
          ? "rgba(34,197,94,0.10)"
          : (leaderboardRank ?? place) === 1
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
            {isOwnAccount ? "👤" : getPlaceLabel(leaderboardRank ?? place)}
          </div>

          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {player.name}
              {isOwnAccount ? " · mijn account" : " · account"}
            </div>
            <div style={{ color: "#c8b6a1", fontSize: 13 }}>
              {`Leaderboard rank #${leaderboardRank ?? place ?? "-"}`}
              {player.username ? ` · @${player.username}` : ""}
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
        <GeneralSection generalStats={generalStats} />
      )}

      {activeSection === "dobbelkingen" && (
        <GameModeSection
          title="Dobbelkingen"
          stats={dobbelkingenStats}
          extraChildren={
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fde68a" }}>
                Contract insights
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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

      {activeSection === "kleurenwiezen" && (
        <GameModeSection
          title="Kleurenwiezen"
          stats={kleurenwiezenStats}
          extraChildren={
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fde68a" }}>
                Contract insights
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 8,
                }}
              >
                <StatPill
                  label="Hoogste gehaalde contract"
                  value={kleurenwiezenInsights.highestAchievedContract ?? "-"}
                  highlight
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

export function StatsScreen({ authUser = null }) {
  const { isMobile, width } = useViewport();

  const [sortBy, setSortBy] = useState("wins");
  const [friendSearchTerm, setFriendSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [friendsOpen, setFriendsOpen] = useState(true);

  const [matches, setMatches] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState("");

  async function refreshData() {
    const localMatches = storageService.getMatchHistory();

    setLoadingOnline(true);
    setOnlineError("");

    try {
      const apiMatches = await getMatchesFromApi();
      const mergedMatches = mergeMatches(localMatches, apiMatches);

      setMatches(mergedMatches);
    } catch (error) {
      setMatches(localMatches);
      setOnlineError(error?.message ?? "Online stats konden niet geladen worden.");
    } finally {
      setLoadingOnline(false);
    }
  }

  useEffect(() => {
    refreshData();

    window.addEventListener("smartcardmat:data-changed", refreshData);
    window.addEventListener("smartcardmat:friends-changed", refreshData);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", refreshData);
      window.removeEventListener("smartcardmat:friends-changed", refreshData);
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

    if (["wiezen", "kleurenwiezen"].includes(activeSection)) {
      if (
        ![
          "wins",
          "matchesPlayed",
          "winRate",
          "totalScore",
          "averageScore",
          "bestScore",
          "worstScore",
        ].includes(sortBy)
      ) {
        setSortBy("wins");
      }
    }
  }, [activeSection, sortBy]);

  const { myRow, myRank, friendRows } = useMemo(() => {
    const accountPlayers = buildAccountPlayersFromMatches(matches);
    const currentAccountPlayer = getCurrentAccountPlayer(authUser, accountPlayers);
    const friends = getFriendPlayers(authUser, accountPlayers);

    function buildRow(player) {
      return {
        player,
        generalStats: getPlayerStats(player.id, matches),
        gameModeStats: getPlayerStatsByGameMode(player.id, matches),
        dobbelkingenContracts: getDobbelkingenContractInsights(player.id, matches),
        kleurenwiezenInsights: getKleurenwiezenInsights(player.id, matches),
      };
    }

    const allRows = accountPlayers.map(buildRow);
    const sortedAllRows = sortPlayers(allRows, sortBy, activeSection);

    const rankByPlayerId = new Map();

    sortedAllRows.forEach((row, index) => {
      rankByPlayerId.set(row.player.id, index + 1);
    });

    const currentRow = currentAccountPlayer ? buildRow(currentAccountPlayer) : null;

    const currentRank = currentRow
      ? rankByPlayerId.get(currentRow.player.id) ?? null
      : null;

    const normalizedFriendSearch = friendSearchTerm.trim().toLowerCase();

    const mappedFriends = friends
      .map(buildRow)
      .filter(({ player, generalStats, gameModeStats }) => {
        const statsForSection =
          activeSection === "dobbelkingen"
            ? gameModeStats?.dobbelkingen ?? getEmptyStats()
            : activeSection === "wiezen"
              ? gameModeStats?.wiezen ?? getEmptyStats()
              : activeSection === "kleurenwiezen"
                ? gameModeStats?.kleurenwiezen ?? getEmptyStats()
                : generalStats;

        const matchesSection = statsForSection.matchesPlayed;

        const matchesSearch =
          normalizedFriendSearch.length === 0 ||
          player.name.toLowerCase().includes(normalizedFriendSearch) ||
          String(player.username ?? "").toLowerCase().includes(normalizedFriendSearch);

        return matchesSection > 0 && matchesSearch;
      })
      .map((row) => ({
        ...row,
        leaderboardRank: rankByPlayerId.get(row.player.id) ?? null,
      }));

    return {
      myRow: currentRow,
      myRank: currentRank,
      friendRows: sortPlayers(mappedFriends, sortBy, activeSection),
    };
  }, [authUser, matches, sortBy, friendSearchTerm, activeSection]);

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
        : [
            { value: "wins", label: "Wins" },
            { value: "matchesPlayed", label: "Matches" },
            { value: "winRate", label: "Winrate" },
            { value: "totalScore", label: "Total score" },
            { value: "averageScore", label: "Average score" },
            { value: "bestScore", label: "Best score" },
            { value: "worstScore", label: "Worst score" },
          ];

  const sectionTabs = [
    { value: "general", label: "Algemeen" },
    { value: "dobbelkingen", label: "Dobbelkingen" },
    { value: "kleurenwiezen", label: "Kleurenwiezen" },
    { value: "wiezen", label: "Wiezen" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
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
              <h2 style={{ margin: 0 }}>Stats</h2>
              <div style={{ color: "#c8b6a1", marginTop: 4 }}>
                Alleen echte account-users worden getoond. Guests en lokale profielen
                tellen niet mee in deze online stats.
              </div>
            </div>

            <button type="button" onClick={refreshData} style={refreshButtonStyle}>
              {loadingOnline ? "Refreshing..." : "Refresh stats"}
            </button>
          </div>

          {onlineError ? (
            <div
              style={{
                borderRadius: 14,
                padding: "10px 12px",
                background: "rgba(127, 29, 29, 0.55)",
                border: "1px solid rgba(248, 113, 113, 0.35)",
                color: "#fee2e2",
                fontWeight: 700,
              }}
            >
              Online error: {onlineError}
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, color: "#c8b6a1" }}>Stats section</div>
            <div
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridTemplateColumns:
                        width >= 700
                          ? "repeat(3, minmax(0, 1fr))"
                          : "repeat(2, minmax(0, 1fr))",
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
            <div style={{ fontSize: 13, color: "#c8b6a1" }}>Sort friends by</div>

            <div
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridTemplateColumns:
                        width >= 700
                          ? "repeat(3, minmax(0, 1fr))"
                          : "repeat(2, minmax(0, 1fr))",
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

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Mijn account</div>

          {myRow ? (
            <PlayerStatsCard
              row={myRow}
              place={myRank ?? 1}
              leaderboardRank={myRank}
              activeSection={activeSection}
              isOwnAccount
            />
          ) : (
            <div style={{ color: "#c8b6a1" }}>
              Log in om je persoonlijke stats te zien.
            </div>
          )}

          <button
            type="button"
            onClick={() => setFriendsOpen((prev) => !prev)}
            style={{
              marginTop: 8,
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              border: "1px solid rgba(251, 191, 36, 0.22)",
              background: "rgba(255,255,255,0.04)",
              color: "#f5efe6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 900,
              fontSize: 17,
            }}
          >
            <span>Friends ({friendRows.length})</span>
            <span style={{ color: "#fde68a" }}>{friendsOpen ? "Open" : "Closed"}</span>
          </button>

          {friendsOpen && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 13, color: "#c8b6a1" }}>
                  Search friends
                </div>
                <input
                  type="text"
                  value={friendSearchTerm}
                  onChange={(e) => setFriendSearchTerm(e.target.value)}
                  placeholder="Search by name or username..."
                  style={{
                    ...inputStyle,
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {friendRows.length === 0 ? (
                <div style={{ color: "#c8b6a1" }}>
                  {loadingOnline
                    ? "Stats laden..."
                    : "Nog geen friends met gespeelde online matches."}
                </div>
              ) : (
                friendRows.map((row) => (
                  <PlayerStatsCard
                    key={row.player.id}
                    row={row}
                    place={row.leaderboardRank ?? 1}
                    leaderboardRank={row.leaderboardRank}
                    activeSection={activeSection}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}