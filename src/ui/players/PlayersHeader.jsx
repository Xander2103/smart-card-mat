import {
  buttonStyle,
  dangerButtonStyle,
} from "./playersTheme";

export function PlayersHeader({
  compactMobile,
  appState,
  hasDevProfiles,
  locked,
  onDeleteDevData,
  onClearSelection,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <h2 style={{ margin: 0, fontSize: compactMobile ? 24 : undefined }}>
          Players
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {appState?.devMode && hasDevProfiles && (
            <button
              onClick={onDeleteDevData}
              style={{
                ...dangerButtonStyle,
                opacity: locked ? 0.5 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
              disabled={locked}
            >
              Delete DEV accounts
            </button>
          )}

          <button
            onClick={onClearSelection}
            style={{
              ...buttonStyle,
              opacity: locked ? 0.5 : 1,
              cursor: locked ? "not-allowed" : "pointer",
            }}
            disabled={locked}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div style={{ color: "#c8b6a1", marginBottom: 10 }}>
        Maak lokale spelers aan en kies exact 4 spelers voor de huidige match.
      </div>

      <div
        style={{
          marginBottom: 18,
          borderRadius: 14,
          padding: "10px 12px",
          background: "rgba(217, 119, 6, 0.10)",
          border: "1px solid rgba(251, 191, 36, 0.16)",
          color: "#fde68a",
          fontWeight: 700,
        }}
      >
        Seat 1 → Seat 4 is de volgorde waarin de spelers aan tafel zitten en
        spelen. Gebruik de pijltjes om de speelvolgorde te wijzigen.
      </div>

      {locked ? (
        <div
          style={{
            marginBottom: 14,
            borderRadius: 14,
            padding: "10px 12px",
            background: "rgba(180, 83, 9, 0.18)",
            border: "1px solid rgba(251, 191, 36, 0.22)",
            color: "#fde68a",
            fontWeight: 700,
          }}
        >
          Players zijn vergrendeld terwijl een match bezig is.
        </div>
      ) : null}
    </>
  );
}
