import { useEffect, useMemo, useState } from "react";
import { getMatchesFromApi } from "../../core/api/matchApi";
import { mergeMatches } from "../../core/matches/matchApiNormalizer";
import { storageService } from "../../core/storage/services/storageService";
import { ConfirmModal } from "../components/ConfirmModal";
import { MatchDetailModal } from "../history/MatchDetailModal";

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

const detailButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(59,130,246,0.22) 0%, rgba(30,64,175,0.18) 100%)",
  border: "1px solid rgba(96,165,250,0.35)",
  color: "#bfdbfe",
};

const summaryBadgeStyle = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#c8b6a1",
  fontWeight: 800,
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5efe6",
  padding: "0 12px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString ?? "-";
  }
}

function formatGameType(gameType) {
  if (gameType === "dobbelkingen") return "Dobbelkingen";
  if (gameType === "kleurenwiezen") return "Kleurenwiezen";
  return gameType ?? "-";
}

function getMatchSource(match) {
  if (match?.metadata?.simulated) return "simulated";
  if (match?.apiSyncStatus === "failed") return "failed";
  if (match?.apiSyncStatus === "pending") return "pending";
  if (match?.apiSyncStatus === "synced") return "online";
  if (match?.apiSyncStatus === "local_only") return "local";
  if (match?.isOnlineOnly) return "online";
  return "legacy";
}

function getSyncBadge(match) {
  const status = match?.apiSyncStatus;

  if (status === "synced") {
    return {
      label: match?.isOnlineOnly ? "Online" : "Online saved",
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
  return (
    !match?.isOnlineOnly &&
    (match?.apiSyncStatus === "local_only" || match?.apiSyncStatus === "failed")
  );
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

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...buttonStyle,
        background: active
          ? "rgba(217, 119, 6, 0.18)"
          : "rgba(255,255,255,0.04)",
        border: active
          ? "1px solid rgba(251, 191, 36, 0.34)"
          : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#fde68a" : "#f5efe6",
      }}
    >
      {children}
    </button>
  );
}

export function HistoryScreen() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [syncingMatchIds, setSyncingMatchIds] = useState({});
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  async function refreshMatches() {
    const localMatches = storageService.getMatchHistory();

    setLoadingOnline(true);
    setOnlineError("");

    try {
      const apiMatches = await getMatchesFromApi();
      setMatches(mergeMatches(localMatches, apiMatches));
    } catch (error) {
      setMatches(localMatches);
      setOnlineError(error?.message ?? "Online matches konden niet geladen worden.");
    } finally {
      setLoadingOnline(false);
    }
  }

  useEffect(() => {
    refreshMatches();

    function handleDataChanged() {
      refreshMatches();
    }

    window.addEventListener("smartcardmat:data-changed", handleDataChanged);
    window.addEventListener("smartcardmat:friends-changed", handleDataChanged);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", handleDataChanged);
      window.removeEventListener("smartcardmat:friends-changed", handleDataChanged);
    };
  }, []);

  function closeConfirm() {
    if (confirmAction?.busy) return;
    setConfirmAction(null);
  }

  async function runConfirmAction() {
    if (!confirmAction?.onConfirm) return;

    setConfirmAction((current) => ({
      ...current,
      busy: true,
    }));

    try {
      await confirmAction.onConfirm();
      setConfirmAction(null);
    } catch (error) {
      setOnlineError(error?.message ?? "Actie kon niet uitgevoerd worden.");
      setConfirmAction(null);
    }
  }

  function handleDeleteMatch(match) {
    if (match?.isOnlineOnly) {
      setConfirmAction({
        title: "Online match niet verwijderd",
        message:
          "Deze match staat alleen online. Online verwijderen bouwen we bewust niet standaard, zodat stats niet makkelijk gemanipuleerd kunnen worden.",
        confirmLabel: "Oké",
        cancelLabel: "Sluiten",
        danger: false,
        onConfirm: async () => {},
      });
      return;
    }

    setConfirmAction({
      title: "Lokale match verwijderen?",
      message: `Ben je zeker dat je deze ${formatGameType(match.gameType)} match lokaal wilt verwijderen? Online matches blijven bestaan.`,
      confirmLabel: "Delete local",
      cancelLabel: "Cancel",
      danger: true,
      onConfirm: async () => {
        storageService.deleteMatch(match.id);

        if (selectedMatch?.id === match.id) {
          setSelectedMatch(null);
        }

        await refreshMatches();
      },
    });
  }

  function handleClearAll() {
    setConfirmAction({
      title: "Alle lokale history wissen?",
      message:
        "Ben je zeker dat je alle lokale match history wilt wissen? Online matches blijven bestaan.",
      confirmLabel: "Clear local",
      cancelLabel: "Cancel",
      danger: true,
      onConfirm: async () => {
        storageService.clearMatchHistory();
        setSelectedMatch(null);
        await refreshMatches();
      },
    });
  }

  function handleClearSimulated() {
    setConfirmAction({
      title: "Simulated matches wissen?",
      message: "Ben je zeker dat je alle simulated/dev matches wilt wissen?",
      confirmLabel: "Clear simulated",
      cancelLabel: "Cancel",
      danger: true,
      onConfirm: async () => {
        storageService.clearSimulatedMatches();
        setSelectedMatch(null);
        await refreshMatches();
      },
    });
  }

  async function handleRetrySync(matchId) {
    setSyncingMatchIds((current) => ({
      ...current,
      [matchId]: true,
    }));

    try {
      await storageService.retryMatchSync(matchId);
      await refreshMatches();
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

  const filteredMatches = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return matches.filter((match) => {
      if (gameFilter !== "all" && match.gameType !== gameFilter) {
        return false;
      }

      if (sourceFilter !== "all" && getMatchSource(match) !== sourceFilter) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const winnerId = match.winnerIds?.[0] ?? null;
      const winnerPlayer =
        match.players?.find((player) => player.playerId === winnerId) ?? null;

      const searchableText = [
        match.gameType,
        formatGameType(match.gameType),
        formatDate(match.playedAt),
        winnerPlayer?.name,
        ...(match.players ?? []).map((player) => player.name),
        ...(match.players ?? []).map((player) => player.username),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(cleanSearch);
    });
  }, [matches, searchTerm, gameFilter, sourceFilter]);

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
            <button onClick={refreshMatches} style={syncButtonStyle}>
              {loadingOnline ? "Refreshing..." : "Refresh online"}
            </button>

            {simulatedCount > 0 && (
              <button onClick={handleClearSimulated} style={warningButtonStyle}>
                Clear simulated matches ({simulatedCount})
              </button>
            )}

            <button onClick={handleClearAll} style={dangerButtonStyle}>
              Clear local
            </button>
          </div>
        </div>

        <div style={{ color: "#c8b6a1", marginBottom: 14 }}>
          Overzicht van gespeelde matches. Lokale matches komen van dit toestel.
          Online matches komen van je account en matches waar je als speler in zit.
        </div>

        {onlineError ? (
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
            Online error: {onlineError}
          </div>
        ) : null}

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

        {matches.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginBottom: 18,
              padding: 14,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by player, winner, game or date..."
                style={inputStyle}
              />

              {(searchTerm || gameFilter !== "all" || sourceFilter !== "all") ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setGameFilter("all");
                    setSourceFilter("all");
                  }}
                  style={buttonStyle}
                >
                  Reset filters
                </button>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ color: "#c8b6a1", fontSize: 13, fontWeight: 800 }}>
                Game
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <FilterButton active={gameFilter === "all"} onClick={() => setGameFilter("all")}>
                  All
                </FilterButton>
                <FilterButton
                  active={gameFilter === "dobbelkingen"}
                  onClick={() => setGameFilter("dobbelkingen")}
                >
                  Dobbelkingen
                </FilterButton>
                <FilterButton
                  active={gameFilter === "kleurenwiezen"}
                  onClick={() => setGameFilter("kleurenwiezen")}
                >
                  Kleurenwiezen
                </FilterButton>
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ color: "#c8b6a1", fontSize: 13, fontWeight: 800 }}>
                Source
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <FilterButton active={sourceFilter === "all"} onClick={() => setSourceFilter("all")}>
                  All
                </FilterButton>
                <FilterButton active={sourceFilter === "online"} onClick={() => setSourceFilter("online")}>
                  Online
                </FilterButton>
                <FilterButton active={sourceFilter === "local"} onClick={() => setSourceFilter("local")}>
                  Local
                </FilterButton>
                <FilterButton active={sourceFilter === "failed"} onClick={() => setSourceFilter("failed")}>
                  Failed
                </FilterButton>
                <FilterButton active={sourceFilter === "pending"} onClick={() => setSourceFilter("pending")}>
                  Pending
                </FilterButton>
                <FilterButton
                  active={sourceFilter === "simulated"}
                  onClick={() => setSourceFilter("simulated")}
                >
                  Simulated
                </FilterButton>
              </div>
            </div>

            <div style={{ color: "#c8b6a1", fontSize: 13 }}>
              Showing {filteredMatches.length} of {matches.length} matches.
            </div>
          </div>
        ) : null}

        <div style={{ fontWeight: 900, marginBottom: 10 }}>Recente matches</div>

        {matches.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>
            {loadingOnline ? "Matches laden..." : "Nog geen gespeelde matches."}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>
            Geen matches gevonden met deze filters.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredMatches.map((match) => {
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
                          {formatGameType(match.gameType)}
                        </div>

                        <SyncBadge match={match} />

                        {match?.isOnlineOnly ? (
                          <div
                            style={{
                              borderRadius: 999,
                              padding: "4px 10px",
                              background: "rgba(34,197,94,0.10)",
                              border: "1px solid rgba(34,197,94,0.24)",
                              fontWeight: 800,
                              fontSize: 12,
                              color: "#bbf7d0",
                            }}
                          >
                            Online only
                          </div>
                        ) : null}

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

                      <button
                        type="button"
                        onClick={() => setSelectedMatch(match)}
                        style={detailButtonStyle}
                      >
                        View details
                      </button>

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

                      {!match?.isOnlineOnly ? (
                        <button
                          onClick={() => handleDeleteMatch(match)}
                          style={dangerButtonStyle}
                        >
                          Delete local
                        </button>
                      ) : null}
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
                            background:
                              player.source === "user"
                                ? "rgba(34,197,94,0.10)"
                                : "rgba(255,255,255,0.04)",
                            border:
                              player.source === "user"
                                ? "1px solid rgba(34,197,94,0.20)"
                                : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {player.name}
                          {player.source === "user" ? " · account" : ""}
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
                              Score: {row.score} · Rank: {row.rank ?? "-"}
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

      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        cancelLabel={confirmAction?.cancelLabel}
        danger={confirmAction?.danger}
        busy={!!confirmAction?.busy}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
    </div>
  );
}