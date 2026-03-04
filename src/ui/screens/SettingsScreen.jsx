// src/ui/screens/SettingsScreen.jsx
export function SettingsScreen({ appState, dispatchAction }) {
  const autoConfirm = !!appState.autoConfirm;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
        Settings
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={autoConfirm}
          onChange={(e) => {
            dispatchAction?.({
              type: "set_auto_confirm",
              value: e.target.checked,
            });
          }}
        />
        <span>Auto-confirm plays (geen confirm knop nodig)</span>
      </label>

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        Tip: voor “tournament mode” laat je auto-confirm aan + gebruik Undo enkel bij fouten.
      </div>
    </div>
  );
}