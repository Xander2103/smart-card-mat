// src/ui/ContractEndOverlay.jsx
import { useEffect } from "react";
import { buttonStyle, colors, panelStyle, softCardStyle } from "./play/theme";

export function ContractEndOverlay({ open, title, message, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.68)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={() => onClose?.()}
    >
      <div onClick={(e) => e.stopPropagation()} style={panelStyle({ width: "min(560px, 100%)", padding: 20 })}>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{title}</div>
            <div style={{ marginTop: 8, color: colors.muted, fontSize: 14 }}>{message}</div>
          </div>

          <div style={softCardStyle({ padding: 12, background: "rgba(251, 191, 36, 0.10)", color: colors.text })}>
            De overlay sluit automatisch na een paar seconden.
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => onClose?.()} style={buttonStyle("primary")}>
              Oké
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
