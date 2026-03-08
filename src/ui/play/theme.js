export const colors = {
  appBg:
    "radial-gradient(circle at top, rgba(217, 119, 6, 0.18), transparent 26%), radial-gradient(circle at right, rgba(220, 38, 38, 0.10), transparent 22%), linear-gradient(180deg, #140d08 0%, #1f1510 42%, #120c08 100%)",
  panelBg: "linear-gradient(180deg, rgba(39, 27, 21, 0.92) 0%, rgba(28, 20, 16, 0.94) 100%)",
  panelBorder: "rgba(245, 158, 11, 0.22)",
  softBg: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)",
  softBorder: "rgba(251, 191, 36, 0.10)",
  text: "#f5efe6",
  muted: "#c8b6a1",
  accent: "#fbbf24",
  accentSoft: "rgba(251, 191, 36, 0.14)",
  red: "#fb7185",
  redSoft: "rgba(251, 113, 133, 0.14)",
  green: "#4ade80",
  greenSoft: "rgba(74, 222, 128, 0.14)",
  blue: "#7dd3fc",
  blueSoft: "rgba(125, 211, 252, 0.14)",
  wood: "#8b5e34",
  felt: "#234232",
};

export function panelStyle(extra = {}) {
  return {
    border: `1px solid ${colors.panelBorder}`,
    background: colors.panelBg,
    backdropFilter: "blur(18px)",
    borderRadius: 22,
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
    color: colors.text,
    ...extra,
  };
}

export function softCardStyle(extra = {}) {
  return {
    border: `1px solid ${colors.softBorder}`,
    background: colors.softBg,
    borderRadius: 18,
    color: colors.text,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    ...extra,
  };
}

export function buttonStyle(variant = "secondary") {
  const base = {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    transition: "all 0.18s ease",
  };

  if (variant === "primary") {
    return {
      ...base,
      border: "1px solid rgba(251, 191, 36, 0.48)",
      background: "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)",
      color: "#2b1607",
      boxShadow: "0 12px 24px rgba(217, 119, 6, 0.24)",
    };
  }

  if (variant === "danger") {
    return {
      ...base,
      border: "1px solid rgba(251, 113, 133, 0.32)",
      background: "linear-gradient(180deg, rgba(127, 29, 29, 0.76) 0%, rgba(69, 10, 10, 0.86) 100%)",
      color: "#ffe4ea",
    };
  }

  if (variant === "success") {
    return {
      ...base,
      border: "1px solid rgba(74, 222, 128, 0.30)",
      background: "linear-gradient(180deg, rgba(20, 83, 45, 0.9) 0%, rgba(22, 101, 52, 0.86) 100%)",
      color: "#eaffef",
    };
  }

  return {
    ...base,
    border: `1px solid ${colors.softBorder}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
    color: colors.text,
  };
}
