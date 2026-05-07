export function AuthButton({ user, isMobile, onClick, theme }) {
  const label = user ? user.name?.slice(0, 1).toUpperCase() : "👤";

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={user ? `Account ${user.name}` : "Account"}
        title={user ? `Account ${user.name}` : "Account"}
        style={{
          ...theme.button,
          width: 46,
          height: 46,
          borderRadius: 999,
          padding: 0,
          border: user
            ? "1px solid rgba(34,197,94,0.5)"
            : "1px solid rgba(255,255,255,0.14)",
          background: user
            ? "rgba(34,197,94,0.12)"
            : "rgba(255,255,255,0.06)",
          color: user ? "#bbf7d0" : "#f5efe6",
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...theme.button,
        minWidth: 130,
        height: 52,
        borderRadius: 999,
        padding: "0 16px",
        border: user
          ? "1px solid rgba(34,197,94,0.45)"
          : "1px solid rgba(255,255,255,0.12)",
        background: user
          ? "rgba(34,197,94,0.12)"
          : "rgba(255,255,255,0.06)",
        color: user ? "#bbf7d0" : "#f5efe6",
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span>{user ? user.name : "Account"}</span>
    </button>
  );
}