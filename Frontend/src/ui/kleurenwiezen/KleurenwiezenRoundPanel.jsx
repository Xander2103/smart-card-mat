import { useMemo, useState } from "react";
import {
  evaluateRound,
  getContractLabel,
  getFriendlyTeamLabel,
  getTeamTrickSummary,
  getTrumpLabel,
} from "../../core/games/kleurenwiezen";
import { getKleurenwiezenContract } from "../../core/games/kleurenwiezen/contracts";
import { getTotalTricksForContract } from "../../core/games/kleurenwiezen/helpers";
import { getSeatName } from "./helpers";
import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { ConfirmModal } from "../components/ConfirmModal";

export function KleurenwiezenRoundPanel({ appState, dispatchAction }) {
  const slice = appState?.game?.kleurenwiezen ?? {};
  const players = appState?.players ?? [];
  const contract = getKleurenwiezenContract(slice?.contractId);
  const contractLabel = getContractLabel(slice?.contractId);
  const teamLabel = getFriendlyTeamLabel(slice, players);
  const teamSummary = getTeamTrickSummary(slice, players);
  const evaluation = evaluateRound(slice, players);
  const totalScores = slice?.totalScores ?? [];
  const totalTricks = getTotalTricksForContract(slice);
  const playedTricks = slice?.trickHistory?.length ?? 0;
  const remainingTricks = Math.max(0, totalTricks - playedTricks);
  const attackLabel = teamSummary.attackLabel;
  const defenseLabel = teamSummary.defenseLabel;

  const [showClaimChoice, setShowClaimChoice] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const trickCounterText = useMemo(() => {
    if (contract?.teamMode === "solo") {
      return `${attackLabel}: ${teamSummary.attackTricks} · ${defenseLabel}: ${teamSummary.defenseTricks}`;
    }

    return `${attackLabel}: ${teamSummary.attackTricks} · ${defenseLabel}: ${teamSummary.defenseTricks}`;
  }, [
    attackLabel,
    contract?.teamMode,
    defenseLabel,
    teamSummary.attackTricks,
    teamSummary.defenseTricks,
  ]);

  function closeConfirm() {
    setConfirmAction(null);
  }

  async function runConfirmAction() {
    if (!confirmAction?.onConfirm) return;

    await confirmAction.onConfirm();
    setConfirmAction(null);
  }

  function handleBackToSetup() {
    setConfirmAction({
      title: "Actieve ronde verlaten?",
      message:
        "Ben je zeker dat je deze actieve ronde wilt verlaten? De huidige voortgang kan verloren gaan.",
      confirmLabel: "Ronde verlaten",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        dispatchAction?.({ type: "abort_contract" });
      },
    });
  }

  function handleFinalizeMatch() {
    setConfirmAction({
      title: "Match afronden?",
      message:
        "Weet je zeker dat je deze match wilt afronden? Dit slaat de match op in history en statistieken.",
      confirmLabel: "Match afronden",
      cancelLabel: "Annuleren",
      danger: false,
      onConfirm: async () => {
        dispatchAction?.({ type: "finish_kleurenwiezen_round" });
      },
    });
  }

  function handleOpenClaimChoice() {
    setShowClaimChoice(true);
  }

  function handleClaimAward(awardedTo) {
    dispatchAction?.({ type: "finish_kleurenwiezen_round_early", awardedTo });
    setShowClaimChoice(false);
  }

  function handleCancelClaim() {
    setShowClaimChoice(false);
  }

  const canClaimEarly = !slice?.roundFinished && !!contract?.allowEarlyClaim !== false;

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 14 })}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>Kleurenwiezen</div>
          <div style={{ color: colors.muted, marginTop: 4 }}>
            Contract: {contractLabel} · Team: {teamLabel}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleBackToSetup} style={buttonStyle("danger")}>
            Terug
          </button>
        </div>
      </div>

      <div
        style={{
          ...softCardStyle({ padding: 18, display: "grid", gap: 8 }),
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          style={{
            color: colors.muted,
            fontSize: 12,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Live slagenstand
        </div>

        <div style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.1 }}>
          {trickCounterText}
        </div>

        <div style={{ color: colors.muted, fontSize: 14 }}>
          Gespeeld: {playedTricks} / {totalTricks} · Nog te spelen:{" "}
          {remainingTricks}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}>
          <div
            style={{
              color: colors.muted,
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Declarant
          </div>
          <div style={{ fontWeight: 900 }}>
            {getSeatName(players, slice?.declarantSeat)}
          </div>
        </div>

        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}>
          <div
            style={{
              color: colors.muted,
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Dealer
          </div>
          <div style={{ fontWeight: 900 }}>
            {getSeatName(players, slice?.dealerSeat)}
          </div>
        </div>

        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}>
          <div
            style={{
              color: colors.muted,
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Troef
          </div>
          <div style={{ fontWeight: 900 }}>
            {slice?.trumpSuit ? getTrumpLabel(slice?.trumpSuit) : "Geen troef"}
          </div>
        </div>

        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}>
          <div
            style={{
              color: colors.muted,
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Doel
          </div>
          <div style={{ fontWeight: 900 }}>{evaluation.targetLabel}</div>
        </div>

        <div style={softCardStyle({ padding: 14, display: "grid", gap: 6 })}>
          <div
            style={{
              color: colors.muted,
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Stand
          </div>
          <div style={{ fontWeight: 900 }}>
            {teamSummary.attackTricks} – {teamSummary.defenseTricks}
          </div>
        </div>
      </div>

      {!slice?.roundFinished && canClaimEarly ? (
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 10 })}>
          <div style={{ fontWeight: 900 }}>Contract afronden</div>

          <div style={{ color: colors.muted, fontSize: 13 }}>
            Gebruik dit alleen als iedereen akkoord is wie de resterende slagen
            krijgt. De app kent die resterende slagen dan handmatig toe en opent
            meteen het resultaat van de ronde.
          </div>

          {!showClaimChoice ? (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleOpenClaimChoice} style={buttonStyle("primary")}>
                Contract afronden
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: colors.muted, fontSize: 13 }}>
                Wie krijgt de resterende {remainingTricks} slag
                {remainingTricks === 1 ? "" : "en"}?
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleClaimAward("attack")}
                  style={buttonStyle("primary")}
                >
                  Geef aan declarant / team
                </button>

                <button
                  onClick={() => handleClaimAward("defense")}
                  style={buttonStyle("secondary")}
                >
                  Geef aan verdediging
                </button>

                <button onClick={handleCancelClaim} style={buttonStyle("ghost")}>
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {slice?.roundFinished ? (
        <div
          style={softCardStyle({
            padding: 16,
            display: "grid",
            gap: 10,
            border: `1px solid ${
              evaluation.success
                ? "rgba(74, 222, 128, 0.28)"
                : "rgba(248, 113, 113, 0.28)"
            }`,
          })}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              color: evaluation.success ? colors.green : colors.red,
            }}
          >
            {evaluation.resultLabel}
          </div>

          <div style={{ color: colors.muted }}>
            {evaluation.attackLabel} haalde {evaluation.attackTricks} slagen.
            Doel was {evaluation.targetTricks}.
            {slice?.instantFailTriggered
              ? " Contract stopte meteen omdat de declarant een verboden slag nam in miserie."
              : ""}
            {slice?.earlyFinishRemainingTricks
              ? ` Ronde werd vroeg afgerond en ${slice.earlyFinishRemainingTricks} resterende slag${
                  slice.earlyFinishRemainingTricks === 1 ? "" : "en"
                } werd${
                  slice.earlyFinishRemainingTricks === 1 ? "" : "en"
                } toegewezen aan ${
                  slice.earlyFinishAwardedTo === "defense"
                    ? defenseLabel
                    : attackLabel
                }.`
              : ""}
          </div>

          <div style={{ color: colors.muted, fontSize: 13 }}>
            Pas wanneer je hieronder op <strong>Match afronden</strong> drukt,
            telt deze ronde mee voor history en stats.
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {players.map((player, index) => {
              const delta = evaluation.playerDeltas?.[index] ?? 0;
              const sign = delta > 0 ? "+" : "";

              return (
                <div
                  key={player.id ?? index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{player.name}</div>
                  <div style={{ fontWeight: 900 }}>
                    {sign}
                    {delta} · totaal {totalScores[index] ?? 0}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <button onClick={handleFinalizeMatch} style={buttonStyle("primary")}>
              Match afronden
            </button>
          </div>
        </div>
      ) : (
        <div style={softCardStyle({ padding: 14, display: "grid", gap: 8 })}>
          <div style={{ fontWeight: 900 }}>Automatische score</div>

          <div style={{ color: colors.muted, fontSize: 13 }}>
            Zodra alle vereiste slagen gespeeld zijn — of zodra een
            miserie-contract direct faalt — berekent de app automatisch winnaar,
            contractresultaat en punten volgens de ingestelde contractwaardes.
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        cancelLabel={confirmAction?.cancelLabel}
        danger={confirmAction?.danger}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
    </div>
  );
}