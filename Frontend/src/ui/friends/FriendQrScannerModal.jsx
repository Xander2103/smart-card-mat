import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(0,0,0,0.72)",
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const modalStyle = {
  width: "min(460px, 100%)",
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

function parseSmartCardMatQr(value) {
  const cleanValue = String(value ?? "").trim();

  if (!cleanValue) return null;

  const prefix = "smartcardmat://user/";

  if (cleanValue.startsWith(prefix)) {
    return cleanValue.slice(prefix.length).trim();
  }

  // Fallback: als iemand later alleen username in QR zet.
  if (/^[a-zA-Z0-9_-]{3,30}$/.test(cleanValue)) {
    return cleanValue;
  }

  return null;
}

export function FriendQrScannerModal({ open, onClose, onUsernameScanned }) {
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [status, setStatus] = useState("Camera starten...");

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    hasScannedRef.current = false;

    async function startScanner() {
      try {
        setStatus("Camera starten...");

        const scanner = new Html5Qrcode("friend-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          async (decodedText) => {
            if (hasScannedRef.current) return;

            const username = parseSmartCardMatQr(decodedText);

            if (!username) {
              setStatus("QR herkend, maar dit is geen Smart Card Mat friend QR.");
              return;
            }

            hasScannedRef.current = true;
            setStatus(`QR gevonden: @${username}`);

            try {
              await scanner.stop();
              await scanner.clear();
            } catch {
              // scanner kan al gestopt zijn
            }

            if (!cancelled) {
              onUsernameScanned(username);
            }
          },
          () => {
            // decode errors negeren, scanner blijft gewoon zoeken
          }
        );

        if (!cancelled) {
          setStatus("Richt je camera op de Smart Card Mat friend QR.");
        }
      } catch (error) {
        setStatus(
          error?.message ??
            "Camera kon niet gestart worden. Check camera permissie."
        );
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      async function stopScanner() {
        const scanner = scannerRef.current;

        if (!scanner) return;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }

          await scanner.clear();
        } catch {
          // veilig negeren bij sluiten
        }

        scannerRef.current = null;
      }

      stopScanner();
    };
  }, [open, onUsernameScanned]);

  if (!open) return null;

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
            <h2 style={{ margin: 0, color: "#d97706" }}>Scan friend QR</h2>
            <p style={{ margin: "6px 0 0", color: "#c8b6a1", lineHeight: 1.4 }}>
              Scan een Smart Card Mat QR-code. De app zoekt daarna automatisch de
              juiste username.
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
          id="friend-qr-reader"
          style={{
            width: "100%",
            overflow: "hidden",
            borderRadius: 18,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            marginBottom: 12,
          }}
        />

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
          }}
        >
          {status}
        </div>

        <button type="button" onClick={onClose} style={{ ...buttonStyle, width: "100%" }}>
          Close scanner
        </button>
      </div>
    </div>
  );
}