import { ZoneGrid } from "../../ZoneGrid";
import { DebugLog } from "../../DebugLog";
import { buttonStyle, colors, panelStyle } from "../../play/theme";

export function DevPanel({
  appState,
  d,
  zonesForGrid,
  DISPLAY_ZONES,
  turnZoneForGrid,
  cardNamesForGrid,
  handleGridClick,
  onConfirmTurn,
  onResetPile,
  dispatchAction,
}) {
  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 14 })}>
      <div style={{ fontWeight: 900, fontSize: 20 }}>Dev panel</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Ontwikkeltools, debugacties en speelzones.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button onClick={onConfirmTurn} style={buttonStyle("primary")}>
          Confirm turn
        </button>

        <button onClick={onResetPile} style={buttonStyle()}>
          Reset pile
        </button>

        {d?.roundPhase !== 2 && (
          <button
            onClick={() => dispatchAction?.({ type: "debug_go_to_phase2" })}
            style={buttonStyle("success")}
          >
            Doorgaan naar fase 2
          </button>
        )}

        {d?.roundPhase === 2 && (
          <button
            onClick={() => dispatchAction?.({ type: "debug_finish_phase2_match" })}
            style={buttonStyle("success")}
          >
            Match direct afronden
          </button>
        )}
      </div>

      <ZoneGrid
        zones={zonesForGrid}
        zoneNumbers={DISPLAY_ZONES}
        turnZone={turnZoneForGrid}
        cardNames={cardNamesForGrid}
        trumpSuit={d?.currentTrumpSuit ?? null}
        onZoneClick={handleGridClick}
      />

      <div style={panelStyle({ padding: 16, display: "grid", gap: 10 })}>
        <div style={{ fontWeight: 900 }}>Debug log</div>
        <DebugLog lines={appState.log} />
      </div>
    </div>
  );
}
