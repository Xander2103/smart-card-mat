import { colors, panelStyle, softCardStyle } from "../../play/theme";
import { toPrettyCard } from "./cardFormatters";

export function PlayedCardsPanel({ cardCodes = [] }) {
  const pretty = cardCodes.slice(-20).map((code) => toPrettyCard(code));

  return (
    <div style={panelStyle({ padding: 16, display: "grid", gap: 8 })}>
      <div style={{ fontWeight: 900 }}>Recent gespeelde kaarten</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>
        Laatste 20 gescande kaartcodes uit deze matchflow.
      </div>

      <div
        style={softCardStyle({
          padding: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          minHeight: 56,
          alignItems: "center",
        })}
      >
        {pretty.length === 0 ? (
          <div style={{ color: colors.muted }}>—</div>
        ) : (
          pretty.map((label, index) => {
            const isRed = label.includes("♥") || label.includes("♦");

            return (
              <div
                key={`${label}-${index}`}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  fontWeight: 900,
                  color: isRed ? "#ff9aa8" : colors.text,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                }}
              >
                {label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
