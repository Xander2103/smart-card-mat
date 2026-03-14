import { evaluateRound, getContractLabel, getFriendlyTeamLabel, getTeamTrickSummary, getTrumpLabel } from "../../core/games/kleurenwiezen";
import { getSeatName } from "./helpers";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";

export function KleurenwiezenRoundPanel({ appState, dispatchAction }) {
  const slice = appState?.game?.kleurenwiezen ?? {};
  const players = appState?.players ?? [];
  const contractLabel = getContractLabel(slice?.contractId);
  const teamLabel = getFriendlyTeamLabel(slice, players);
  const teamSummary = getTeamTrickSummary(slice, players);
  const evaluation = evaluateRound(slice, players);
  const totalScores = slice?.totalScores ?? [];

  function handleBackToSetup() {
    const ok = window.confirm(
      slice?.roundFinished
        ? "Terug naar setup voor een nieuwe ronde?"
        : "Actieve ronde verlaten? Huidige voortgang kan verloren gaan."
    );
    if (!ok) return;
    dispatchAction?.({ type: slice?.roundFinished ? "finish_kleurenwiezen_round" : "abort_contract" });
  }

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 14 })}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Kleurenwiezen</div>
          <div style={{ color: colors.muted, marginTop: 4 }}>
            Contract: {contractLabel} · Team: {teamLabel}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleBackToSetup} style={slice?.roundFinished ? buttonStyle("primary") : buttonStyle("danger")}>
            {slice?.roundFinished ? "Volgende ronde" : "Terug"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}><div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 700 }}>Declarant</div><div style={{ fontWeight: 900 }}>{getSeatName(players, slice?.declarantSeat)}</div></div>
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}><div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 700 }}>Dealer</div><div style={{ fontWeight: 900 }}>{getSeatName(players, slice?.dealerSeat)}</div></div>
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}><div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 700 }}>Troef</div><div style={{ fontWeight: 900 }}>{slice?.trumpSuit ? getTrumpLabel(slice?.trumpSuit) : "Geen troef"}</div></div>
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}><div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 700 }}>Doel</div><div style={{ fontWeight: 900 }}>{evaluation.targetLabel}</div></div>
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}><div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 700 }}>Stand</div><div style={{ fontWeight: 900 }}>{teamSummary.attackTricks} – {teamSummary.defenseTricks}</div></div>
      </div>

      {slice?.roundFinished ? (
        <div style={softCardStyle({ padding: 16, display: "grid", gap: 10, border: `1px solid ${evaluation.success ? "rgba(74, 222, 128, 0.28)" : "rgba(248, 113, 113, 0.28)"}` })}>
          <div style={{ fontWeight: 900, fontSize: 20, color: evaluation.success ? colors.green : colors.red }}>{evaluation.resultLabel}</div>
          <div style={{ color: colors.muted }}>{evaluation.attackLabel} haalde {evaluation.attackTricks} slagen. Doel was {evaluation.targetTricks}.</div>
          <div style={{ display: "grid", gap: 8 }}>
            {players.map((player, index) => {
              const delta = evaluation.playerDeltas?.[index] ?? 0;
              const sign = delta > 0 ? "+" : "";
              return <div key={player.id ?? index} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div style={{ fontWeight: 800 }}>{player.name}</div><div style={{ fontWeight: 900 }}>{sign}{delta} · totaal {totalScores[index] ?? 0}</div></div>;
            })}
          </div>
        </div>
      ) : (
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 8 })}>
          <div style={{ fontWeight: 900 }}>Automatische score</div>
          <div style={{ color: colors.muted, fontSize: 13 }}>
            Zodra de 13e slag gespeeld is, berekent de app automatisch winnaar, contractresultaat en punten volgens de ingestelde officiële contractwaardes.
          </div>
        </div>
      )}
    </div>
  );
}
