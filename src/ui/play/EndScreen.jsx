// src/ui/play/EndScreen.jsx
import { buttonStyle, colors, panelStyle, softCardStyle } from "./theme";

function getMedalPrefix(place) {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";
  return `${place}.`;
}

function getLeaderboardRowStyle(place) {
  if (place === 1) {
    return {
      background: "rgba(251, 191, 36, 0.14)",
      border: "1px solid rgba(251, 191, 36, 0.26)",
    };
  }

  if (place === 2) {
    return {
      background: "rgba(226, 232, 240, 0.08)",
      border: "1px solid rgba(203, 213, 225, 0.18)",
    };
  }

  if (place === 3) {
    return {
      background: "rgba(217, 119, 6, 0.10)",
      border: "1px solid rgba(251, 146, 60, 0.18)",
    };
  }

  return {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
}

function getTrumpLabel(suit) {
  switch (String(suit ?? "").toUpperCase()) {
    case "H":
      return "Harten";
    case "D":
      return "Ruiten";
    case "C":
      return "Klaveren";
    case "S":
      return "Schoppen";
    default:
      return "—";
  }
}

function formatDelta(value) {
  const n = Number(value ?? 0);
  if (n > 0) return `+${n}`;
  return `${n}`;
}

function formatDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) return "-";

  const diffMs = Math.max(0, finishedAt - startedAt);
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

function SectionTitle({ children }) {
  return <div style={{ fontWeight: 900, fontSize: 18 }}>{children}</div>;
}

function BreakdownPlayerRow({ label, value }) {
  return (
    <div
      style={softCardStyle({
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        background: "rgba(255,255,255,0.04)",
      })}
    >
      <div>{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  );
}

export function EndScreen({ summary, onNewGame, onBackHome }) {
  const ranking = summary?.ranking ?? [];
  const winnerName = summary?.winnerName ?? "Onbekend";
  const phase1Contracts = summary?.phase1Contracts ?? [];
  const phase2Contracts = summary?.phase2Contracts ?? [];
  const phase1Totals = summary?.phase1Totals ?? [];
  const phase2Totals = summary?.phase2Totals ?? [];
  const startedAt = summary?.startedAt ?? null;
  const finishedAt = summary?.finishedAt ?? null;
  const totalRounds = summary?.totalRounds ?? ranking.length ?? 0;

  return (
    <div
      style={panelStyle({
        padding: 22,
        display: "grid",
        gap: 18,
      })}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900 }}>Dobbelkingen klaar</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 18,
            fontWeight: 800,
            color: colors.accent,
          }}
        >
          🏆 Winnaar: {winnerName}
        </div>
      </div>

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
        <SectionTitle>Leaderboard</SectionTitle>

        {ranking.map((row) => (
          <div
            key={row.playerIndex}
            style={{
              ...softCardStyle({
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                ...getLeaderboardRowStyle(row.place),
              }),
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ minWidth: 34, fontWeight: 900 }}>
                {getMedalPrefix(row.place)}
              </div>
              <div style={{ fontWeight: 800 }}>{row.name}</div>
            </div>

            <div style={{ fontWeight: 900, color: row.score > 0 ? colors.green : colors.text }}>
              {formatDelta(row.score)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        <div style={softCardStyle({ padding: 16, display: "grid", gap: 12 })}>
          <SectionTitle>Fase 1 – Contracten</SectionTitle>

          {phase1Contracts.length === 0 ? (
            <div style={{ color: colors.muted }}>Geen fase 1 contractdata beschikbaar.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {phase1Contracts.map((entry, index) => (
                <div
                  key={`${entry.contract}-${entry.timestamp ?? index}-${index}`}
                  style={softCardStyle({
                    padding: "12px 14px",
                    display: "grid",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                  })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{entry.label ?? entry.contract}</div>
                    <div style={{ fontWeight: 900 }}>
                      {formatDelta(entry.scoreDelta)}
                    </div>
                  </div>

                  <div style={{ color: colors.muted, fontSize: 13 }}>
                    Gekozen door {entry.chooserName}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800, color: colors.accent }}>
              Fase 1 totaal
            </div>

            {phase1Totals.map((row) => (
              <BreakdownPlayerRow
                key={`phase1-${row.playerIndex}`}
                label={row.name}
                value={formatDelta(row.score)}
              />
            ))}
          </div>
        </div>

        <div style={softCardStyle({ padding: 16, display: "grid", gap: 12 })}>
          <SectionTitle>Fase 2 – Troefrondes</SectionTitle>

          {phase2Contracts.length === 0 ? (
            <div style={{ color: colors.muted }}>Geen fase 2 data beschikbaar.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {phase2Contracts.map((entry, index) => (
                <div
                  key={`troef-${entry.timestamp ?? index}-${index}`}
                  style={softCardStyle({
                    padding: "12px 14px",
                    display: "grid",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                  })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>
                      Troef {getTrumpLabel(entry.trumpSuit)}
                    </div>
                    <div style={{ fontWeight: 900 }}>
                      {formatDelta(entry.scoreDelta)}
                    </div>
                  </div>

                  <div style={{ color: colors.muted, fontSize: 13 }}>
                    Gekozen door {entry.chooserName}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800, color: colors.accent }}>
              Fase 2 totaal
            </div>

            {phase2Totals.map((row) => (
              <BreakdownPlayerRow
                key={`phase2-${row.playerIndex}`}
                label={row.name}
                value={formatDelta(row.score)}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
        <SectionTitle>Match info</SectionTitle>

        <BreakdownPlayerRow
          label="Match duur"
          value={formatDuration(startedAt, finishedAt)}
        />
        <BreakdownPlayerRow label="Rondes gespeeld" value={totalRounds} />
        <BreakdownPlayerRow
          label="Gestart"
          value={startedAt ? new Date(startedAt).toLocaleString() : "-"}
        />
        <BreakdownPlayerRow
          label="Afgerond"
          value={finishedAt ? new Date(finishedAt).toLocaleString() : "-"}
        />
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={onNewGame} style={buttonStyle("primary")}>
          Nieuw spel
        </button>
        <button onClick={onBackHome} style={buttonStyle()}>
          Terug naar home
        </button>
      </div>
    </div>
  );
}