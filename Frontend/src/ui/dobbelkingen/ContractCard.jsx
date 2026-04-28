import { colors, softCardStyle } from "../play/theme";

export function ContractCard({
  label,
  desc,
  count,
  disabled,
  reason,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  compact = false,
  minHeight,
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      style={{
        ...softCardStyle({
          padding: compact ? 10 : 16,
          textAlign: "left",
          display: "grid",
          gap: compact ? 6 : 8,
          minHeight,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transform: hovered && !disabled ? "translateY(-2px)" : "none",
          transition: "all 0.16s ease",
          background: hovered && !disabled
            ? "rgba(251, 191, 36, 0.10)"
            : "rgba(255,255,255,0.04)",
          border: hovered && !disabled
            ? "1px solid rgba(251, 191, 36, 0.30)"
            : "1px solid rgba(255,255,255,0.08)",
        }),
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: compact ? 15 : 17,
            textAlign: "center",
            width: "100%",
            paddingRight: compact ? 34 : 42,
          }}
        >
          {label}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            borderRadius: 999,
            padding: compact ? "3px 7px" : "4px 8px",
            background: count >= 2 ? colors.redSoft : colors.accentSoft,
            color: count >= 2 ? "#fecdd3" : "#fcd34d",
            fontSize: compact ? 11 : 12,
            fontWeight: 700,
          }}
        >
          {count}/2
        </div>
      </div>

      <div
        style={{
          color: colors.muted,
          fontSize: compact ? 11 : 14,
          lineHeight: compact ? 1.32 : 1.5,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: compact ? 4 : "unset",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {desc}
      </div>

      <div
        style={{
          fontSize: compact ? 11 : 12,
          fontWeight: 700,
          color: disabled ? "#fda4af" : colors.muted,
          textAlign: "center",
        }}
      >
        {reason || "Beschikbaar om te kiezen"}
      </div>
    </button>
  );
}
