import { useEffect } from "react";
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";

export function ContractEndOverlay({ open, title, message, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => onClose?.(), 2800);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, rgba(120,45,0,0.16), rgba(2, 6, 23, 0.82))",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
        animation: "overlayFadeIn 220ms ease-out",
      }}
      onClick={() => onClose?.()}
    >
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes overlayCardIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes overlayIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...panelStyle({ width: "min(620px, 100%)", padding: 22 }),
          animation: "overlayCardIn 260ms cubic-bezier(.19,1,.22,1)",
          border: "1px solid rgba(251, 191, 36, 0.28)",
          background:
            "linear-gradient(180deg, rgba(44, 28, 20, 0.96) 0%, rgba(28, 18, 14, 0.98) 100%)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "start", gap: 14 }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                background: "linear-gradient(180deg, rgba(251,191,36,0.18), rgba(217,119,6,0.10))",
                border: "1px solid rgba(251, 191, 36, 0.26)",
                boxShadow: "0 14px 30px rgba(217,119,6,0.16)",
                animation: "overlayIconPulse 1.8s ease-in-out infinite",
              }}
            >
              🏁
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1.12 }}>{title}</div>
              <div style={{ marginTop: 8, color: colors.muted, fontSize: 15 }}>{message}</div>
            </div>
          </div>

          <div
            style={softCardStyle({
              padding: 14,
              background: "linear-gradient(180deg, rgba(251, 191, 36, 0.10), rgba(217, 119, 6, 0.06))",
              color: colors.text,
              border: "1px solid rgba(251, 191, 36, 0.18)",
            })}
          >
            Even tonen aan tafel en daarna automatisch sluiten.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => onClose?.()} style={buttonStyle("primary")}>
              Verder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
