import { buttonStyle, colors, panelStyle } from "./theme";

function MetaPill({ label, value, accent = colors.blue }) {
  return (
    <div
      style={{
        border: `1px solid ${accent}40`,
        background: `${accent}12`,
        borderRadius: 999,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
      }}
    >
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ fontWeight: 900 }}>{value}</span>
    </div>
  );
}

export function GameToolbar({
  canConfirm,
  autoConfirm,
  onConfirmTurn,
  onUndo,
  onResetPile,
  onBack,
  onDebugNextPhase,
  onFinishMatch,
  showNextPhaseButton,
  showFinishMatchButton,
  meta,
}) {
  return (
    <div
      style={panelStyle({
        padding: 16,
        display: "grid",
        gap: 14,
      })}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
        <button
          onClick={onConfirmTurn}
          disabled={!canConfirm || autoConfirm}
          style={{
            ...buttonStyle("primary"),
            opacity: !canConfirm || autoConfirm ? 0.55 : 1,
            cursor: !canConfirm || autoConfirm ? "not-allowed" : "pointer",
          }}
        >
          Confirm turn
        </button>

        <button onClick={onUndo} style={buttonStyle()}>
          Undo last play
        </button>

        <button onClick={onResetPile} style={buttonStyle()}>
          Reset pile
        </button>

        {showNextPhaseButton && (
          <button onClick={onDebugNextPhase} style={buttonStyle("success")}>
            Doorgaan naar fase 2
          </button>
        )}

        {showFinishMatchButton && (
          <button onClick={onFinishMatch} style={buttonStyle("success")}>
            Match direct afronden
          </button>
        )}

        <button onClick={onBack} style={buttonStyle("danger")}>
          ← Terug
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
        {meta.map((item) => (
          <MetaPill key={item.label} label={item.label} value={item.value} accent={item.accent} />
        ))}
      </div>
    </div>
  );
}
