import { buttonStyle, colors, softCardStyle } from "../play/theme";

export function SetupStepCard({ title, subtitle, children, footer }) {
  return (
    <div
      style={softCardStyle({
        padding: 18,
        display: "grid",
        gap: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))",
      })}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 900, fontSize: 24 }}>{title}</div>
        {subtitle ? (
          <div style={{ color: colors.muted, lineHeight: 1.55 }}>{subtitle}</div>
        ) : null}
      </div>

      {children}

      {footer ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{footer}</div> : null}
    </div>
  );
}

export function ChoiceGrid({ children, min = 220 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

export function SelectButton({ active = false, onClick, eyebrow, title, body }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...softCardStyle({
          padding: 16,
          display: "grid",
          gap: 8,
          textAlign: "left",
          cursor: "pointer",
          border: active
            ? "1px solid rgba(251, 191, 36, 0.44)"
            : "1px solid rgba(255,255,255,0.08)",
          background: active
            ? "linear-gradient(180deg, rgba(120,53,15,0.50), rgba(255,255,255,0.06))"
            : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
          boxShadow: active ? "0 14px 32px rgba(217, 119, 6, 0.18)" : undefined,
        }),
      }}
    >
      {eyebrow ? (
        <div style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>
          {eyebrow}
        </div>
      ) : null}
      <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
      {body ? <div style={{ color: colors.muted, lineHeight: 1.5 }}>{body}</div> : null}
    </button>
  );
}

export function WizardActions({ onBack, onNext, nextLabel = "Volgende", backLabel = "Terug", nextDisabled = false }) {
  return [
    onBack ? (
      <button key="back" onClick={onBack} style={buttonStyle()}>
        {backLabel}
      </button>
    ) : null,
    onNext ? (
      <button key="next" onClick={onNext} disabled={nextDisabled} style={{ ...buttonStyle("primary"), opacity: nextDisabled ? 0.5 : 1 }}>
        {nextLabel}
      </button>
    ) : null,
  ].filter(Boolean);
}
