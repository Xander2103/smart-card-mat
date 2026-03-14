import { BluetoothIcon } from "./BluetoothIcon";

export function DisconnectModal({ theme, open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(4, 6, 12, 0.72)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          ...theme.panel,
          width: "min(92vw, 420px)",
          padding: 20,
          display: "grid",
          gap: 14,
          border: "1px solid rgba(248, 113, 113, 0.28)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              background: "rgba(127, 29, 29, 0.28)",
              boxShadow: "0 0 18px rgba(248, 113, 113, 0.20)",
            }}
          >
            <BluetoothIcon size={18} color="#fb7185" />
          </div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Bluetooth verbinding verbroken</div>
        </div>

        <div style={{ color: "#dbc6b6", lineHeight: 1.55 }}>
          Je toestel is gedisconnecteerd. Controleer je verbinding en verbind opnieuw als je verder wilt spelen.
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...theme.button, minWidth: 96 }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
