// src/ui/DobbelkingenPanel.jsx
import { getContractList, getContract } from "../core/games/dobbelkingen/contracts";

function pillStyle() {
  return {
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
    border: "1px solid #eee",
    borderRadius: 999,
    padding: "6px 10px",
    background: "white",
    fontSize: 12,
    opacity: 0.9,
  };
}

function Banner({ title, subtitle }) {
  return (
    <div
      style={{
        border: "1px solid #ffe58f",
        background: "#fffbe6",
        borderRadius: 14,
        padding: "10px 12px",
        marginTop: 12,
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 2, fontSize: 13, opacity: 0.8 }}>{subtitle}</div>
    </div>
  );
}

function ContractCard({ c, onPick, plays = 0, disabled = false, reason = "" }) {
  return (
    <button
      onClick={() => !disabled && onPick(c.id)}
      disabled={disabled}
      style={{
        textAlign: "left",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        background: disabled ? "#fafafa" : "white",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontWeight: 800 }}>{c.label}</div>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.85 }}>
          ({plays}/2)
        </div>
      </div>

      <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>{c.desc}</div>

      {disabled && reason ? (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700 }}>{reason}</div>
      ) : null}
    </button>
  );
}

export function DobbelkingenPanel({ appState, onClose, onStart, onChooseContract }) {
  const d = appState.game?.dobbelkingen ?? null;

  const players = appState.players ?? [];
  const chooserIndex = typeof d?.chooserIndex === "number" ? d.chooserIndex : 0;
  const leaderIndex = typeof d?.leaderIndex === "number" ? d.leaderIndex : null;
  const currentIndex = typeof d?.currentPlayerIndex === "number" ? d.currentPlayerIndex : null;

  const chooserName = players[chooserIndex]?.name ?? "Chooser";
  const leaderName = leaderIndex !== null ? (players[leaderIndex]?.name ?? "-") : "-";
  const currentName = currentIndex !== null ? (players[currentIndex]?.name ?? "-") : "-";

  const contracts = getContractList();
  const totals = d?.totalScores ?? appState.totalScores ?? [];

  const phase = appState.phase;

  const lastResult = d?.lastResult ?? null;
  const showEndBanner =
    phase === "CHOOSING_CONTRACT" &&
    lastResult &&
    (lastResult.endedEarlyReason === "ALL_HEARTS_PLAYED" || lastResult.endedEarly);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Dobbelkingen</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={onClose}>Terug</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <div style={pillStyle()}>
          Phase: <b>{appState.phase}</b>
        </div>
        <div style={pillStyle()}>
          Chooser: <b>{chooserName}</b>
        </div>
        <div style={pillStyle()}>
          Leader: <b>{leaderName}</b>
        </div>
        <div style={pillStyle()}>
          Current: <b>{currentName}</b>
        </div>
        <div style={pillStyle()}>
          Contract: <b>{d?.contract ?? "-"}</b>
        </div>
      </div>

      {/* ✅ Banner blijft staan tot nieuw contract gekozen wordt */}
      {showEndBanner && (
        <Banner
          title={
            lastResult.endedEarlyReason === "ALL_HEARTS_PLAYED"
              ? "❤️ Alle harten zijn gespeeld"
              : "✅ Contract afgelopen"
          }
          subtitle={
            lastResult.endedEarlyReason === "ALL_HEARTS_PLAYED"
              ? "Contract automatisch beëindigd. Kies een nieuw contract."
              : "Kies een nieuw contract."
          }
        />
      )}

      {appState.phase === "DOBBELKINGEN_READY" && (
        <div style={{ marginTop: 12 }}>
          <button onClick={onStart} style={{ fontWeight: 800 }}>
            Start Dobbelkingen
          </button>
          <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
            Eerst kiest {chooserName} een contract. Daarna komt de volgende speler uit.
          </div>
        </div>
      )}

      {appState.phase === "CHOOSING_CONTRACT" && (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>{chooserName} kiest een spel:</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {contracts.map((c) => {
              const plays = d?.contractPlays?.[c.id] ?? 0;
              const disabledByRepeat = (d?.lastContract ?? null) === c.id;
              const disabledByMax = plays >= 2;
              const disabled = disabledByRepeat || disabledByMax;

              const reason = disabledByRepeat
                ? "Niet 2× na elkaar"
                : disabledByMax
                ? "Al 2× gespeeld"
                : "";

              return (
                <ContractCard
                  key={c.id}
                  c={c}
                  onPick={onChooseContract}
                  plays={plays}
                  disabled={disabled}
                  reason={reason}
                />
              );
            })}
          </div>

          {/* Tussenstand */}
          <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Tussenstand</div>

            <div style={{ display: "grid", gap: 6 }}>
              {(players ?? []).map((p, i) => (
                <div
                  key={p.id ?? i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    border: "1px solid #f0f0f0",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <b>{p.name}</b>
                  </div>
                  <div style={{ fontWeight: 800 }}>{totals[i] ?? 0}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              Scores zijn totaal (opgeteld over alle gespeelde contracten).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}