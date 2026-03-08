import { buttonStyle, colors, panelStyle, softCardStyle } from "../play/theme";
import { useViewport } from "../play/useViewport";

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
      <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop: 2, width: 18, height: 18 }} />
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ color: colors.muted, fontSize: 14, lineHeight: 1.5 }}>{description}</div>
      </div>
    </label>
  );
}

export function SettingsScreen({ appState, dispatchAction }) {
  const { isMobile } = useViewport();
  const autoConfirm = !!appState.autoConfirm;

  return (
    <div style={panelStyle({ padding: isMobile ? 16 : 22, display: "grid", gap: 16 })}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900, fontSize: isMobile ? 24 : 28 }}>Settings</div>
        <div style={{ color: colors.muted, maxWidth: 760 }}>
          Basisinstellingen voor de Smart Card Mat. Alles blijft werken zoals nu, maar je kunt het spelverloop hier vlotter maken.
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
        description="Wanneer ingeschakeld worden geldige plays automatisch bevestigd. Dat is handig voor vlot spelverloop zonder extra bevestigingsknop."
      />

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
        <div style={{ fontWeight: 900 }}>Aanbevolen instelling</div>
        <div style={{ color: colors.muted, lineHeight: 1.55 }}>
          Voor een snelle speeltafel laat je auto-confirm aan en gebruik je <b>Undo</b> alleen wanneer een kaart fout werd gescand of verkeerd geplaatst.
        </div>
        <div>
          <button
            onClick={() => dispatchAction?.({ type: "set_auto_confirm", value: true })}
            style={buttonStyle("primary")}
          >
            Zet tournament mode aan
          </button>
        </div>
      </div>
    </div>
  );
}
