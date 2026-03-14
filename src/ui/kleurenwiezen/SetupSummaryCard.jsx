import { colors, softCardStyle } from "../play/theme";
import { getSetupSummaryRows } from "./helpers";

export function SetupSummaryCard({ slice, players, extraRows = [] }) {
  const rows = getSetupSummaryRows(slice, players, extraRows);

  return (
    <div style={softCardStyle({ padding: 18, display: "grid", gap: 14 })}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Ronde-overzicht</div>
        <div style={{ color: colors.muted, marginTop: 4 }}>
          Bieden gebeurt aan tafel. Vul hier enkel het eindresultaat helder in; slagen, winnaar en punten lopen daarna automatisch.
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase", fontWeight: 700 }}>
              {row.label}
            </div>
            <div style={{ fontWeight: 800 }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
