const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2, 6, 23, 0.72)",
  backdropFilter: "blur(8px)",
  zIndex: 9999,
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "min(920px, 100%)",
  maxHeight: "88vh",
  overflow: "auto",
  borderRadius: 24,
  border: "1px solid rgba(251, 191, 36, 0.22)",
  background: "rgba(39, 27, 21, 0.96)",
  color: "#f5efe6",
  boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  padding: 20,
};

const buttonStyle = {
  borderRadius: 12,
  padding: "8px 12px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  color: "#f5efe6",
};

const sectionStyle = {
  borderRadius: 16,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.035)",
  display: "grid",
  gap: 10,
};

const pillStyle = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 800,
  fontSize: 13,
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString ?? "-";
  }
}

function getPlayerName(match, playerId) {
  return (
    match?.players?.find((player) => player.playerId === playerId)?.name ??
    playerId ??
    "-"
  );
}

function getWinnerName(match) {
  const winnerId = match?.winnerIds?.[0] ?? null;
  return getPlayerName(match, winnerId);
}

function formatGameType(gameType) {
  if (gameType === "dobbelkingen") return "Dobbelkingen";
  if (gameType === "kleurenwiezen") return "Kleurenwiezen";
  return gameType ?? "-";
}

function DobbelkingenDetails({ match }) {
  const contracts = match?.gameData?.contracts ?? match?.gameData?.history ?? [];

  if (String(match?.gameType ?? "").toLowerCase() !== "dobbelkingen") {
    return null;
  }

  function formatContractName(contractName) {
    return String(contractName ?? "-")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <div style={sectionStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 17 }}>Dobbelkingen details</div>

        <div style={pillStyle}>
          {contracts.length} contract{contracts.length === 1 ? "" : "en"}
        </div>
      </div>

      {contracts.length === 0 ? (
        <div style={{ color: "#c8b6a1" }}>Geen contract history gevonden.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {contracts.map((contract, index) => {
            const contractScores = contract?.contractScores ?? [];
            const totalScoresAfter = contract?.totalScoresAfter ?? [];
            const chooserName = getPlayerName(match, contract?.chooserPlayerId);

            return (
              <div
                key={`${contract?.timestamp ?? index}-${contract?.contract ?? "contract"}`}
                style={{
                  borderRadius: 16,
                  padding: 12,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ color: "#c8b6a1", fontSize: 12, fontWeight: 800 }}>
                      Round {index + 1}
                    </div>

                    <div style={{ fontWeight: 950, fontSize: 17 }}>
                      {formatContractName(contract?.contract)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...pillStyle,
                      background: "rgba(217,119,6,0.16)",
                      border: "1px solid rgba(251,191,36,0.25)",
                      color: "#fde68a",
                    }}
                  >
                    Chooser: {chooserName}
                  </div>
                </div>

                {contract?.endedEarlyReason ? (
                  <div
                    style={{
                      borderRadius: 12,
                      padding: "8px 10px",
                      background: "rgba(217,119,6,0.12)",
                      border: "1px solid rgba(251,191,36,0.20)",
                      color: "#fde68a",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    Ended early: {formatContractName(contract.endedEarlyReason)}
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.8fr 0.8fr",
                    gap: 8,
                    color: "#c8b6a1",
                    fontSize: 12,
                    fontWeight: 900,
                    padding: "0 4px",
                  }}
                >
                  <div>Player</div>
                  <div style={{ textAlign: "right" }}>Delta</div>
                  <div style={{ textAlign: "right" }}>Total</div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  {(match.players ?? []).map((player, playerIndex) => {
                    const delta = Number(contractScores?.[playerIndex] ?? 0);
                    const total = Number(totalScoresAfter?.[playerIndex] ?? 0);
                    const isChooser = player.playerId === contract?.chooserPlayerId;

                    return (
                      <div
                        key={`${index}-${player.playerId}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.4fr 0.8fr 0.8fr",
                          gap: 8,
                          alignItems: "center",
                          borderRadius: 12,
                          padding: "8px 10px",
                          background: isChooser
                            ? "rgba(251,191,36,0.10)"
                            : "rgba(255,255,255,0.035)",
                          border: isChooser
                            ? "1px solid rgba(251,191,36,0.22)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div style={{ fontWeight: 850 }}>
                          {player.name}
                          {isChooser ? (
                            <span style={{ color: "#fde68a" }}> · chooser</span>
                          ) : null}
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                            fontWeight: 900,
                            color:
                              delta > 0
                                ? "#bbf7d0"
                                : delta < 0
                                  ? "#fecaca"
                                  : "#f5efe6",
                          }}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </div>

                        <div style={{ textAlign: "right", fontWeight: 900 }}>
                          {total}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KleurenwiezenDetails({ match }) {
  if (String(match?.gameType ?? "").toLowerCase() !== "kleurenwiezen") {
    return null;
  }

  const gameData = match?.gameData ?? {};
  const trickHistory = gameData?.trickHistory ?? [];
  const playerDeltas = gameData?.playerDeltas ?? [];

  function getSeatName(seatIndex) {
    if (typeof seatIndex !== "number") return "-";

    return match?.players?.[seatIndex]?.name ?? `Seat ${seatIndex + 1}`;
  }

  function formatSuitLabel(label) {
    if (!label || label === "-") return "Geen troef";
    return label;
  }

  function getSuccessStyle(success) {
    if (success === true) {
      return {
        background: "rgba(34,197,94,0.14)",
        border: "1px solid rgba(34,197,94,0.28)",
        color: "#bbf7d0",
        label: "Success",
      };
    }

    if (success === false) {
      return {
        background: "rgba(127,29,29,0.28)",
        border: "1px solid rgba(248,113,113,0.30)",
        color: "#fecaca",
        label: "Failed",
      };
    }

    return {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#f5efe6",
      label: "-",
    };
  }

  const successStyle = getSuccessStyle(gameData.success);

  return (
    <div style={sectionStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 17 }}>Kleurenwiezen details</div>

        <div
          style={{
            ...pillStyle,
            background: successStyle.background,
            border: successStyle.border,
            color: successStyle.color,
          }}
        >
          {successStyle.label}
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 12,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 900, color: "#fde68a" }}>Contract summary</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
          }}
        >
          <div style={pillStyle}>Contract: {gameData.contractLabel ?? "-"}</div>
          <div style={pillStyle}>Troef: {formatSuitLabel(gameData.trumpLabel)}</div>
          <div style={pillStyle}>Team: {gameData.teamLabel ?? "-"}</div>
          <div style={pillStyle}>Result: {gameData.resultLabel ?? "-"}</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
          }}
        >
          <div style={pillStyle}>Declarant: {getSeatName(gameData.declarantSeat)}</div>
          <div style={pillStyle}>Partner: {getSeatName(gameData.partnerSeat)}</div>
          <div style={pillStyle}>Dealer: {getSeatName(gameData.dealerSeat)}</div>
          <div style={pillStyle}>Starter: {getSeatName(gameData.starterSeat)}</div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 12,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 900, color: "#fde68a" }}>Tricks result</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 8,
          }}
        >
          <div style={pillStyle}>Attack tricks: {gameData.attackTricks ?? 0}</div>
          <div style={pillStyle}>Defense tricks: {gameData.defenseTricks ?? 0}</div>
          <div style={pillStyle}>Target tricks: {gameData.targetTricks ?? "-"}</div>
          <div
            style={{
              ...pillStyle,
              background: successStyle.background,
              border: successStyle.border,
              color: successStyle.color,
            }}
          >
            Outcome: {successStyle.label}
          </div>
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 12,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 900, color: "#fde68a" }}>Player score changes</div>

        {playerDeltas.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>Geen player deltas gevonden.</div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {(match.players ?? []).map((player, index) => {
              const delta = Number(playerDeltas?.[index] ?? 0);

              return (
                <div
                  key={`${player.playerId}-delta`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.8fr",
                    gap: 8,
                    alignItems: "center",
                    borderRadius: 12,
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontWeight: 850 }}>{player.name}</div>

                  <div
                    style={{
                      textAlign: "right",
                      fontWeight: 900,
                      color:
                        delta > 0
                          ? "#bbf7d0"
                          : delta < 0
                            ? "#fecaca"
                            : "#f5efe6",
                    }}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          borderRadius: 16,
          padding: 12,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 900, color: "#fde68a" }}>Trick history</div>
          <div style={pillStyle}>
            {trickHistory.length} trick{trickHistory.length === 1 ? "" : "s"}
          </div>
        </div>

        {trickHistory.length === 0 ? (
          <div style={{ color: "#c8b6a1" }}>Geen trick history gevonden.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {trickHistory.map((trick, index) => {
              const winnerSeat = trick?.winnerSeat;
              const leaderSeat = trick?.leaderSeat;

              return (
                <div
                  key={`${index}-${winnerSeat ?? "trick"}`}
                  style={{
                    borderRadius: 14,
                    padding: 10,
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Trick {index + 1}</div>

                    <div
                      style={{
                        ...pillStyle,
                        background: "rgba(217,119,6,0.16)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        color: "#fde68a",
                      }}
                    >
                      Winner: {getSeatName(winnerSeat)}
                    </div>
                  </div>

                  <div style={{ color: "#c8b6a1", fontSize: 13 }}>
                    Leader: {getSeatName(leaderSeat)}
                  </div>

                  {Array.isArray(trick?.cards) && trick.cards.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {trick.cards.map((card, cardIndex) => {
                        const seat = card?.seatIndex ?? card?.seat ?? cardIndex;
                        const cardLabel =
                          card?.cardName ??
                          card?.card ??
                          card?.label ??
                          card?.name ??
                          "-";

                        return (
                          <div
                            key={`${index}-${cardIndex}`}
                            style={{
                              ...pillStyle,
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            {getSeatName(seat)}: {cardLabel}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchDetailModal({ match, onClose }) {
  if (!match) return null;

  const sortedScores = [...(match.scores ?? [])].sort((a, b) => {
    const rankA = Number(a.rank ?? 999);
    const rankB = Number(b.rank ?? 999);

    if (rankA !== rankB) return rankA - rankB;

    return Number(b.score ?? 0) - Number(a.score ?? 0);
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ color: "#c8b6a1", fontWeight: 800, marginBottom: 4 }}>
              Match details
            </div>
            <h2 style={{ margin: 0 }}>{formatGameType(match.gameType)}</h2>
            <div style={{ color: "#c8b6a1", marginTop: 6 }}>
              {formatDate(match.playedAt)}
            </div>
          </div>

          <button type="button" onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div style={sectionStyle}>
            <div style={{ fontWeight: 900, fontSize: 17 }}>Summary</div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={pillStyle}>Winner: {getWinnerName(match)}</div>
              <div style={pillStyle}>
                Source: {match?.isOnlineOnly ? "Online only" : "Local/online"}
              </div>
              <div style={pillStyle}>Sync: {match?.apiSyncStatus ?? "legacy"}</div>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontWeight: 900, fontSize: 17 }}>Players</div>

            <div style={{ display: "grid", gap: 8 }}>
              {(match.players ?? []).map((player) => (
                <div
                  key={player.playerId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    borderRadius: 12,
                    padding: "8px 10px",
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
                  <span>
                    {player.name}
                    {player.source === "user" ? " · account" : ""}
                  </span>
                  <span style={{ color: "#c8b6a1" }}>
                    {player.username ? `@${player.username}` : player.source ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontWeight: 900, fontSize: 17 }}>Final scores</div>

            <div style={{ display: "grid", gap: 8 }}>
              {sortedScores.map((row) => (
                <div
                  key={`${match.id}-${row.playerId}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    borderRadius: 12,
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span>{getPlayerName(match, row.playerId)}</span>
                  <span>
                    Score: {row.score} · Rank: {row.rank ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DobbelkingenDetails match={match} />
          <KleurenwiezenDetails match={match} />
        </div>
      </div>
    </div>
  );
}