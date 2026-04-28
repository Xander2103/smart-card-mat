export const appTheme = {
  panel: {
    border: "1px solid rgba(251, 191, 36, 0.18)",
    background: "rgba(39, 27, 21, 0.84)",
    backdropFilter: "blur(18px)",
    borderRadius: 22,
    boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
    color: "#f5efe6",
  },
  button: {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
    color: "#f5efe6",
  },
};

export const APP_TABS = [
  { value: "play", label: "Play" },
  { value: "players", label: "Players", locked: true },
  { value: "history", label: "History" },
  { value: "stats", label: "Stats" },
  { value: "deck", label: "Deck Setup" },
  { value: "settings", label: "Settings" },
];
