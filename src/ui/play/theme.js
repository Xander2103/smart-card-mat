export const colors = {
  pageBg: "linear-gradient(180deg, #0f172a 0%, #172554 42%, #0f172a 100%)",
  panelBg: "rgba(15, 23, 42, 0.78)",
  panelBorder: "rgba(148, 163, 184, 0.24)",
  softBg: "rgba(255, 255, 255, 0.04)",
  softBorder: "rgba(255, 255, 255, 0.08)",
  text: "#e5eefb",
  muted: "#9fb0cf",
  accent: "#fbbf24",
  accentSoft: "rgba(251, 191, 36, 0.14)",
  red: "#fb7185",
  redSoft: "rgba(251, 113, 133, 0.14)",
  green: "#4ade80",
  greenSoft: "rgba(74, 222, 128, 0.14)",
  blue: "#60a5fa",
  blueSoft: "rgba(96, 165, 250, 0.16)",
};

export function panelStyle(extra = {}) {
  return {
    border: `1px solid ${colors.panelBorder}`,
    background: colors.panelBg,
    backdropFilter: "blur(18px)",
    borderRadius: 20,
    boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
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
      background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
      color: "#1f2937",
      boxShadow: "0 12px 24px rgba(245, 158, 11, 0.24)",
    };
  }

  if (variant === "danger") {
    return {
      ...base,
      border: "1px solid rgba(251, 113, 133, 0.42)",
      background: colors.redSoft,
      color: "#ffe4ea",
    };
  }

  if (variant === "success") {
    return {
      ...base,
      border: "1px solid rgba(74, 222, 128, 0.42)",
      background: colors.greenSoft,
      color: "#defce7",
    };
  }

  return {
    ...base,
    border: `1px solid ${colors.softBorder}`,
    background: "rgba(255,255,255,0.05)",
    color: colors.text,
  };
}
