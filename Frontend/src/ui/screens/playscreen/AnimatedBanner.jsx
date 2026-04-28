import { panelStyle } from "../../play/theme";

export function AnimatedBanner({ type = "info", title, message, compact = false }) {
  if (!title && !message) return null;

  const tones =
    type === "error"
      ? {
          border: "1px solid rgba(251, 113, 133, 0.34)",
          background: "linear-gradient(180deg, rgba(127, 29, 29, 0.82), rgba(69, 10, 10, 0.82))",
          glow: "0 16px 34px rgba(127, 29, 29, 0.22)",
          icon: "🚫",
          titleColor: "#ffe4e6",
          bodyColor: "#fecdd3",
        }
      : {
          border: "1px solid rgba(74, 222, 128, 0.34)",
          background: "linear-gradient(180deg, rgba(20, 83, 45, 0.84), rgba(22, 101, 52, 0.80))",
          glow: "0 16px 34px rgba(20, 83, 45, 0.22)",
          icon: "🏆",
          titleColor: "#ecfdf5",
          bodyColor: "#bbf7d0",
        };

  return (
    <div
      style={{
        ...panelStyle({
          padding: compact ? "10px 14px" : "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          overflow: "hidden",
          position: "relative",
          border: tones.border,
          background: tones.background,
          boxShadow: tones.glow,
          animation: "bannerIn 240ms cubic-bezier(.19,1,.22,1)",
        }),
      }}
    >
      <style>{`
        @keyframes bannerIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes bannerShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }

        @keyframes bannerTimer {
          0% { transform: scaleX(1); opacity: 0.95; }
          100% { transform: scaleX(0); opacity: 0.45; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.08) 48%, transparent 78%)",
          animation: "bannerShine 2.6s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: compact ? 34 : 42,
            height: compact ? 34 : 42,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            fontSize: compact ? 16 : 18,
            fontWeight: 900,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {tones.icon}
        </div>

        <div style={{ display: "grid", gap: 2 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: compact ? 3 : 4,
              background:
                type === "error"
                  ? "linear-gradient(90deg, rgba(251,113,133,0.95), rgba(254,205,211,0.65))"
                  : "linear-gradient(90deg, rgba(74,222,128,0.95), rgba(187,247,208,0.65))",
              transformOrigin: "left center",
              animation: compact ? "bannerTimer 1.2s linear forwards" : "bannerTimer 3.2s linear forwards",
            }}
          />

          <div style={{ fontWeight: 900, color: tones.titleColor }}>{title}</div>
          {message ? <div style={{ fontSize: 13, color: tones.bodyColor }}>{message}</div> : null}
        </div>
      </div>
    </div>
  );
}
