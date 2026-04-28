import { guestButtonStyle } from "./playersTheme";

export function QuickOptionsSection({
  locked,
  selectedPlayersLength,
  onAddGuest,
}) {
  return (
    <>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Snelle opties</div>

      <button
        onClick={onAddGuest}
        disabled={locked || selectedPlayersLength >= 4}
        style={{
          ...guestButtonStyle,
          opacity: locked || selectedPlayersLength >= 4 ? 0.55 : 1,
          cursor:
            locked || selectedPlayersLength >= 4 ? "not-allowed" : "pointer",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>+ Gast toevoegen</div>
        <div style={{ color: "#bfdbfe", fontSize: 13, marginTop: 4 }}>
          Tijdelijke speler voor deze match, zonder profiel of opgeslagen stats.
        </div>
      </button>
    </>
  );
}
