// src/ui/ContractEndOverlay.jsx
import { useEffect } from "react";

export function ContractEndOverlay({ open, title, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 2500); // auto close
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={() => onClose?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          borderRadius: 18,
          background: "white",
          border: "1px solid #eee",
          padding: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
        <div style={{ marginTop: 8, opacity: 0.8, fontSize: 14 }}>
          {message}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button
            onClick={() => onClose?.()}
            style={{
              borderRadius: 12,
              padding: "8px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Oké
          </button>
        </div>
      </div>
    </div>
  );
}