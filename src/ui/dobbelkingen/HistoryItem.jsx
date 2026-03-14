import { softCardStyle } from "../play/theme";

export function HistoryItem({ children }) {
  return (
    <div
      style={softCardStyle({
        padding: "10px 12px",
        background: "rgba(255,255,255,0.04)",
      })}
    >
      {children}
    </div>
  );
}
