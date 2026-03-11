import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";
import { storageService } from "../../core/storage/services/storageService";
import { simulateDobbelkingenMatches } from "../../core/dev/simulateDobbelkingenMatches";

function ToggleRow({ checked, onChange, title, description }) {
  return (
    <label
      style={softCardStyle({
        padding: 16,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 14,
        alignItems: "start",
        cursor: "pointer",
      })}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginTop: 2, width: 18, height: 18 }}
      />
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
    </label>
  );
}

export function SettingsScreen({ appState, dispatchAction }) {
  const { isMobile } = useViewport();

  const autoConfirm = !!appState.autoConfirm;
  const devMode = !!appState.devMode;
  const showRecentCards = appState.showRecentCards !== false;
  const showCenterTrickLabel = appState.showCenterTrickLabel !== false;

  return (
    <div style={panelStyle({ padding: isMobile ? 16 : 22, display: "grid", gap: 16 })}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: isMobile ? 24 : 28 }}>Settings</div>
        <div style={{ color: colors.muted, maxWidth: 760 }}>
          Basisinstellingen voor de Smart Card Mat. Alles blijft werken zoals nu,
          maar je kunt het spelverloop hier vlotter en cleaner maken.
        </div>
      </div>

      <ToggleRow
        checked={autoConfirm}
        onChange={(e) => {
          dispatchAction?.({
            type: "set_auto_confirm",
            value: e.target.checked,
          });
        }}
        title="Auto-confirm plays"
        description="Wanneer ingeschakeld worden geldige plays automatisch bevestigd."
      />

      <ToggleRow
        checked={showRecentCards}
        onChange={(e) => {
          dispatchAction?.({
            type: "set_show_recent_cards",
            value: e.target.checked,
          });
        }}
        title="Recente kaarten zichtbaar"
        description="Toon onder de tussenstand een blok met recent gespeelde kaarten."
      />

      <ToggleRow
        checked={showCenterTrickLabel}
        onChange={(e) => {
          dispatchAction?.({
            type: "set_show_center_trick_label",
            value: e.target.checked,
          });
        }}
        title="Slagnummer in het midden zichtbaar"
        description="Toon in het midden van de speeltafel een subtiel label met het huidige slagnummer."
      />

      <ToggleRow
        checked={devMode}
        onChange={(e) => {
          dispatchAction?.({
            type: "set_dev_mode",
            value: e.target.checked,
          });
        }}
        title="Dev mode"
        description="Toon ontwikkeltools zoals speelzones, debuglog en debugknoppen."
      />

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
        <div style={{ fontWeight: 700 }}>Aanbevolen instelling</div>
        <div style={{ color: colors.muted, lineHeight: 1.55 }}>
          Voor een snelle speeltafel laat je auto-confirm aan en gebruik je <b>Undo</b>
          alleen wanneer een kaart fout werd gescand of verkeerd geplaatst.
        </div>
        <div>
          <button
            onClick={() => dispatchAction?.({ type: "set_auto_confirm", value: true })}
            style={buttonStyle("primary")}
          >
            Zet tournament mode aan
          </button>
        </div>
        {appState?.devMode && (
          <div
            style={{
              marginTop: 24,
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(251,191,36,0.18)",
              background: "rgba(217,119,6,0.08)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 900 }}>DEV Tools : Dobbelkingen </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={buttonStyle("secondary")}
                onClick={() => simulateDobbelkingenMatches(1)}
              >
                Simulate 1 match
              </button>

              <button
                style={buttonStyle("secondary")}
                onClick={() => simulateDobbelkingenMatches(20)}
              >
                Simulate 20 matches
              </button>

              <button
                style={buttonStyle("secondary")}
                onClick={() => simulateDobbelkingenMatches(100)}
              >
                Simulate 100 matches
              </button>

              <button
                style={buttonStyle("secondary")}
                onClick={() => {
                  const ok = window.confirm(
                    "Ben je zeker dat je alle gesimuleerde matches wilt verwijderen?"
                  );
                  if (!ok) return;

                  storageService.clearSimulatedMatches();
                }}
              >
                Clear simulated matches
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}