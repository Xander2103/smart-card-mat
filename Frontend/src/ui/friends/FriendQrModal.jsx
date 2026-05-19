import { QRCodeSVG } from "qrcode.react";
import { PlayerIdentity } from "../components/PlayerIdentity";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(0,0,0,0.68)",
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "min(420px, 100%)",
  borderRadius: 24,
  padding: 20,
  background:
    "linear-gradient(180deg, rgba(39,27,21,0.98) 0%, rgba(19,13,10,0.98) 100%)",
  border: "1px solid rgba(251,191,36,0.22)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  color: "#f5efe6",
};

const buttonStyle = {
  borderRadius: 14,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  color: "#f5efe6",
};

function getQrValue(user) {
  const username = user?.username ?? "";
  return `smartcardmat://user/${username}`;
}

export function FriendQrModal({ open, user, onClose }) {
  if (!open || !user) return null;

  const qrValue = getQrValue(user);

  async function copyUsername() {
    await navigator.clipboard?.writeText(user.username ?? "");
  }

  async function copyQrValue() {
    await navigator.clipboard?.writeText(qrValue);
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#d97706" }}>Friend QR</h2>
            <p style={{ margin: "6px 0 0", color: "#c8b6a1", lineHeight: 1.4 }}>
              Laat iemand deze code scannen of laat je username zoeken in de Friends tab.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              width: 40,
              height: 40,
              borderRadius: 999,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: 14,
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.25)",
            marginBottom: 14,
          }}
        >
          <PlayerIdentity
            player={user}
            name={user.name}
            username={user.username}
            imageUrl={user.avatar_url ?? null}
            avatarSize={44}
            avatarFontSize={13}
            nameFontSize={18}
            subtitle={user.username ? `@${user.username}` : user.email}
          />
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center",
            borderRadius: 20,
            padding: 18,
            background: "#ffffff",
            marginBottom: 14,
          }}
        >
          <QRCodeSVG
            value={qrValue}
            size={240}
            level="M"
            marginSize={4}
          />
        </div>

        <div
          style={{
            borderRadius: 14,
            padding: "10px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#c8b6a1",
            fontSize: 13,
            lineHeight: 1.4,
            marginBottom: 14,
            wordBreak: "break-word",
          }}
        >
          <strong style={{ color: "#fde68a" }}>QR value:</strong> {qrValue}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <button type="button" onClick={copyUsername} style={buttonStyle}>
            Copy username
          </button>

          <button type="button" onClick={copyQrValue} style={buttonStyle}>
            Copy QR value
          </button>
        </div>
      </div>
    </div>
  );
}