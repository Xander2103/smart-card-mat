import { useState } from "react";
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
  const [devCodeInput, setDevCodeInput] = useState("");
  const [devCodeError, setDevCodeError] = useState("");

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

      {!isMobile && (
        <>
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
        </>
      )}

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 10 })}>
        <div style={{ fontWeight: 700 }}>Aanbevolen instelling</div>
        <div style={{ color: colors.muted, lineHeight: 1.55 }}>
          Voor desktop testing: laat <b>recent kaarten</b> uit, <b>slagnummer</b> uit en
          <b> auto-confirm</b> aan. Gebruik <b>Undo</b> alleen wanneer een kaart fout werd
          gescand of verkeerd geplaatst.
        </div>
        <div>
          <button
            onClick={() => {
              dispatchAction?.({ type: "set_auto_confirm", value: true });
              dispatchAction?.({ type: "set_show_recent_cards", value: false });
              dispatchAction?.({ type: "set_show_center_trick_label", value: false });
            }}
            style={buttonStyle("primary")}
          >
            Zet tournament mode aan
          </button>
        </div>
      </div>

      <div style={softCardStyle({ padding: 16, display: "grid", gap: 12, marginTop: 6 })}>
        <div style={{ fontWeight: 700 }}>Dev mode</div>
        <div style={{ color: colors.muted, lineHeight: 1.55 }}>
          Dev mode staat apart en vraagt een code zodat niet iedereen zomaar debugtools
          kan activeren. Gebruik code <b>1281</b> om in te schakelen.
        </div>

        {!devMode ? (
          <>
            <input
              type="password"
              value={devCodeInput}
              onChange={(e) => {
                setDevCodeInput(e.target.value);
                setDevCodeError("");
              }}
              placeholder="Voer dev code in"
              style={{
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#f5efe6",
                outline: "none",
                maxWidth: 240,
              }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  if (devCodeInput.trim() !== "1281") {
                    setDevCodeError("Foute code voor dev mode.");
                    return;
                  }
                  dispatchAction?.({ type: "set_dev_mode", value: true });
                  setDevCodeInput("");
                  setDevCodeError("");
                }}
                style={buttonStyle("secondary")}
              >
                Dev mode activeren
              </button>
            </div>
            {devCodeError ? <div style={{ color: "#fca5a5", fontWeight: 700 }}>{devCodeError}</div> : null}
          </>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ color: "#86efac", fontWeight: 800 }}>Dev mode is actief.</div>
            <button
              onClick={() => dispatchAction?.({ type: "set_dev_mode", value: false })}
              style={buttonStyle("danger")}
            >
              Dev mode uitzetten
            </button>
          </div>
        )}

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