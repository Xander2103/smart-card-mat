export const panelStyle = {
  border: "1px solid rgba(251, 191, 36, 0.18)",
  background: "rgba(39, 27, 21, 0.84)",
  backdropFilter: "blur(18px)",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
  color: "#f5efe6",
  padding: 20,
};

export const buttonStyle = {
  borderRadius: 12,
  padding: "8px 12px",
  fontWeight: 800,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  color: "#f5efe6",
};

export const actionButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(217, 119, 6, 0.28) 0%, rgba(180, 83, 9, 0.18) 100%)",
  border: "1px solid rgba(251, 191, 36, 0.3)",
};

export const dangerButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(127, 29, 29, 0.78) 0%, rgba(80, 20, 20, 0.78) 100%)",
  border: "1px solid rgba(248, 113, 113, 0.35)",
};

export const guestButtonStyle = {
  ...buttonStyle,
  width: "100%",
  textAlign: "left",
  padding: 14,
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(59, 130, 246, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%)",
  border: "1px dashed rgba(96, 165, 250, 0.35)",
};

export const seatMoveButtonStyle = {
  borderRadius: 10,
  padding: "6px 10px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5efe6",
};
