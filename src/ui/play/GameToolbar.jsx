import { buttonStyle, panelStyle } from "./theme";

export function GameToolbar({
  onUndo,
  onBack,
}) {
  return (
    <div
      style={panelStyle({
        padding: 14,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "flex-end",
      })}
    >
      <button onClick={onUndo} style={buttonStyle()}>
        Undo last play
      </button>

      <button onClick={onBack} style={buttonStyle("danger")}>
        ← Terug
      </button>
    </div>
  );
}