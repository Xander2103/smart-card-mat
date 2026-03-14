import { actionButtonStyle } from "./playersTheme";

export function CreatePlayerForm({
  compactMobile,
  locked,
  newPlayerName,
  setNewPlayerName,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: compactMobile ? "grid" : "flex",
        gridTemplateColumns: compactMobile ? "1fr auto" : undefined,
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 18,
      }}
    >
      <input
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        placeholder="Nieuwe spelernaam"
        disabled={locked}
        style={{
          flex: "1 1 240px",
          minWidth: compactMobile ? 0 : 220,
          borderRadius: 12,
          padding: "10px 12px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "#f5efe6",
          outline: "none",
          opacity: locked ? 0.6 : 1,
        }}
      />

      <button
        type="submit"
        style={{
          ...actionButtonStyle,
          opacity: locked ? 0.5 : 1,
          cursor: locked ? "not-allowed" : "pointer",
        }}
        disabled={locked}
      >
        Create player
      </button>
    </form>
  );
}
