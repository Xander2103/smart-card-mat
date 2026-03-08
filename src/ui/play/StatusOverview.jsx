import { colors, panelStyle, softCardStyle } from "./theme";

function StatCard({ eyebrow, title, lines, accent = colors.blue }) {
  return (
    <div
      style={softCardStyle({
        padding: 16,
        display: "grid",
        gap: 10,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 22px ${accent}16`,
      })}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 18px ${accent}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 12, color: colors.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {eyebrow}
          </div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {lines.map((line) => (
          <div
            key={line.label}
            style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}
          >
            <span style={{ color: colors.muted }}>{line.label}</span>
            <span style={{ fontWeight: 800, textAlign: "right" }}>{line.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusOverview({
  chooserName,
  leaderName,
  currentName,
  phaseLabel,
  roundLabel,
  playedCount,
  totalCount,
  contractLabel,
  trumpLabel,
  statusText,
}) {
  return (
    <div
      style={panelStyle({
        padding: 18,
        display: "grid",
        gap: 14,
      })}
    >
      <div>
        <div style={{ fontWeight: 900, fontSize: 24 }}>Dobbelkingen</div>
        <div style={{ color: colors.muted, marginTop: 4 }}>
          Strategische contractkeuze, troefrondes en een lopende totaalscore.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard
          eyebrow="Beurt"
          title={currentName}
          accent={colors.red}
          lines={[
            { label: "Kiest", value: chooserName },
            { label: "Komt uit", value: leaderName },
            { label: "Aan zet", value: currentName },
          ]}
        />

        <StatCard
          eyebrow="Ronde"
          title={phaseLabel}
          accent={colors.accent}
          lines={[
            { label: "Ronde", value: roundLabel },
            { label: "Gespeeld", value: `${playedCount} / ${totalCount}` },
            { label: "Status", value: statusText },
          ]}
        />

        <StatCard
          eyebrow="Actief"
          title={contractLabel}
          accent={colors.green}
          lines={[
            { label: "Contract", value: contractLabel },
            { label: "Troef", value: trumpLabel },
            { label: "Volgende stap", value: statusText },
          ]}
        />
      </div>
    </div>
  );
}
