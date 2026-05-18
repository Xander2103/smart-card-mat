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

const warningButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(120, 53, 15, 0.78) 0%, rgba(92, 33, 14, 0.78) 100%)",
  border: "1px solid rgba(251, 191, 36, 0.28)",
  color: "#fde68a",
};

const syncButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(34,197,94,0.22) 0%, rgba(21,128,61,0.18) 100%)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#bbf7d0",
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString ?? "-";
  }
}

function getSyncBadge(match) {
  const status = match?.apiSyncStatus;

  if (status === "synced") {
    return {
      label: "Online saved",
      icon: "✅",
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (status === "local_only") {
    return {
      label: "Local only",
      icon: "💾",
      color: "#fde68a",
      background: "rgba(217,119,6,0.14)",
      border: "1px solid rgba(251,191,36,0.26)",
    };
  }

  if (status === "failed") {
    return {
      label: "Sync failed",
      icon: "⚠️",
      color: "#fecaca",
      background: "rgba(127,29,29,0.28)",
      border: "1px solid rgba(248,113,113,0.3)",
    };
  }

  if (status === "pending") {
    return {
      label: "Sync pending",
      icon: "⏳",
      color: "#bfdbfe",
      background: "rgba(37,99,235,0.16)",
      border: "1px solid rgba(96,165,250,0.28)",
    };
  }

  return {
    label: "Legacy local",
    icon: "📦",
    color: "#c8b6a1",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  };
}

function canRetrySync(match) {
  return match?.apiSyncStatus === "local_only" || match?.apiSyncStatus === "failed";
}

function SyncBadge({ match }) {
  const badge = getSyncBadge(match);

  return (
    <div
      title={match?.syncError ? `Sync error: ${match.syncError}` : badge.label}
      style={{
        borderRadius: 999,
        padding: "5px 10px",
        background: badge.background,
        border: badge.border,
        color: badge.color,
        fontWeight: 900,
        fontSize: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </div>
  );
}

export function HistoryScreen() {
  const [matches, setMatches] = useState([]);
  const [syncingMatchIds, setSyncingMatchIds] = useState({});

  function refreshMatches() {
    setMatches(storageService.getMatchHistory());
  }

  useEffect(() => {
    refreshMatches();

    function handleDataChanged() {
      refreshMatches();
    }

    window.addEventListener("smartcardmat:data-changed", handleDataChanged);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", handleDataChanged);
    };
  }, []);

  function handleDeleteMatch(matchId) {
    storageService.deleteMatch(matchId);
  }

  function handleClearAll() {
    const ok = window.confirm("Ben je zeker dat je alle match history wilt wissen?");
    if (!ok) return;

    storageService.clearMatchHistory();
  }

  function handleClearSimulated() {
    const ok = window.confirm("Ben je zeker dat je alle simulated matches wilt wissen?");
    if (!ok) return;

    storageService.clearSimulatedMatches();
  }

  async function handleRetrySync(matchId) {
    setSyncingMatchIds((current) => ({
      ...current,
      [matchId]: true,
    }));

    try {
      await storageService.retryMatchSync(matchId);
    } finally {
      setSyncingMatchIds((current) => {
        const next = { ...current };
        delete next[matchId];
        return next;
      });
    }
  }

  const simulatedCount = useMemo(
    () => matches.filter((match) => match?.metadata?.simulated).length,
    [matches]
  );

  const syncCounts = useMemo(() => {
    return matches.reduce(
      (totals, match) => {
        const status = match?.apiSyncStatus ?? "legacy";
        totals[status] = (totals[status] ?? 0) + 1;
        return totals;
      },
      {
        synced: 0,
        local_only: 0,
        failed: 0,
        pending: 0,
        legacy: 0,
      }
    );
  }, [matches]);

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

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {simulatedCount > 0 && (
              <button onClick={handleClearSimulated} style={warningButtonStyle}>
                Clear simulated matches ({simulatedCount})
              </button>
            )}

            <button onClick={handleClearAll} style={dangerButtonStyle}>
              Clear all
            </button>
          </div>
        </div>

        <div style={{ color: "#c8b6a1", marginBottom: 14 }}>
          Overzicht van gespeelde matches. Matches worden lokaal bewaard en,
          wanneer je ingelogd bent, online gesynct.
        </div>

        {matches.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div style={summaryBadgeStyle}>✅ Online: {syncCounts.synced}</div>
            <div style={summaryBadgeStyle}>💾 Local: {syncCounts.local_only}</div>
            <div style={summaryBadgeStyle}>⚠️ Failed: {syncCounts.failed}</div>
            <div style={summaryBadgeStyle}>⏳ Pending: {syncCounts.pending}</div>
          </div>
        )}

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Recente matches</div>

        {matches.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>Nog geen gespeelde matches.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {matches.map((match) => {
              const winnerId = match.winnerIds?.[0] ?? null;
              const winnerPlayer =
                match.players?.find((player) => player.playerId === winnerId) ?? null;

              const isSimulated = !!match?.metadata?.simulated;
              const isSyncing = !!syncingMatchIds[match.id];

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
                    <div style={{ display: "grid", gap: 6 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                          {match.gameType}
                        </div>

                        <SyncBadge match={match} />

                        {isSimulated && (
                          <div
                            style={{
                              borderRadius: 999,
                              padding: "4px 10px",
                              background: "rgba(217, 119, 6, 0.14)",
                              border: "1px solid rgba(251, 191, 36, 0.24)",
                              fontWeight: 800,
                              fontSize: 12,
                              color: "#fde68a",
                            }}
                          >
                            Simulated
                          </div>
                        )}
                      </div>

                      <div style={{ color: "#c8b6a1", fontSize: 13 }}>
                        {formatDate(match.playedAt)}
                      </div>

                      {match?.syncError && (
                        <div
                          style={{
                            color: "#fecaca",
                            fontSize: 12,
                            lineHeight: 1.35,
                          }}
                        >
                          Sync error: {match.syncError}
                        </div>
                      )}
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

                      {canRetrySync(match) && (
                        <button
                          onClick={() => handleRetrySync(match.id)}
                          disabled={isSyncing}
                          style={{
                            ...syncButtonStyle,
                            opacity: isSyncing ? 0.6 : 1,
                          }}
                        >
                          {isSyncing ? "Syncing..." : "Sync now"}
                        </button>
                      )}

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

const summaryBadgeStyle = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#c8b6a1",
  fontWeight: 800,
  fontSize: 12,
};