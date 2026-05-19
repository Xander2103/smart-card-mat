import { createPortal } from "react-dom";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 999999,
  background: "rgba(0,0,0,0.70)",
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "min(440px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 32px)",
  overflow: "auto",
  borderRadius: 24,
  padding: 20,
  background:
    "linear-gradient(180deg, rgba(39,27,21,0.98) 0%, rgba(19,13,10,0.98) 100%)",
  border: "1px solid rgba(251,191,36,0.24)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
  color: "#f5efe6",
};

const baseButtonStyle = {
  borderRadius: 14,
  padding: "11px 14px",
  fontWeight: 950,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f5efe6",
};

const cancelButtonStyle = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)",
};

const confirmButtonStyle = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.92) 100%)",
  color: "#1f1307",
};

const dangerButtonStyle = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(127,29,29,0.78) 0%, rgba(80,20,20,0.78) 100%)",
  border: "1px solid rgba(248,113,113,0.35)",
  color: "#fee2e2",
};

export function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const modal = (
    <div style={overlayStyle} onClick={busy ? undefined : onCancel}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: danger ? "#fecaca" : "#d97706",
                fontSize: 24,
                lineHeight: 1.25,
              }}
            >
              {title}
            </h2>

            {message ? (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#c8b6a1",
                  lineHeight: 1.45,
                  fontSize: 15,
                }}
              >
                {message}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              ...cancelButtonStyle,
              width: 40,
              height: 40,
              borderRadius: 999,
              padding: 0,
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              ...cancelButtonStyle,
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              ...(danger ? dangerButtonStyle : confirmButtonStyle),
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}