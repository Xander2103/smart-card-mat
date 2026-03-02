export function SettingsScreen({ appState, dispatchAction }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>Settings</h2>

      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={!!appState.autoConfirm}
          onChange={(e) =>
            dispatchAction({ type: "set_auto_confirm", value: e.target.checked })
          }
        />
        Auto-confirm plays (geen confirm knop nodig)
      </label>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        Tip: voor “tournament mode” laat je auto-confirm aan + gebruik Undo enkel bij fouten.
      </div>
    </div>
  );
}