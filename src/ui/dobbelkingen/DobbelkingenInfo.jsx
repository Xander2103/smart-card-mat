// src/ui/dobbelkingen/DobbelkingenInfo.jsx
export function DobbelkingenInfo({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "white",
          borderRadius: 18,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18)",
          padding: 20,
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>Dobbelkingen – uitleg</div>
            <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>
              Volledige uitleg van fases, regels en scoring.
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "1px solid #ddd",
              background: "white",
              borderRadius: 12,
              padding: "8px 12px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Sluiten
          </button>
        </div>

        <Section title="Wat is Dobbelkingen?">
          Dobbelkingen is een slagenspel in 2 grote fases. In fase 1 worden de
          verschillende contracten gespeeld. In fase 2 speelt iedereen 2 keer een
          troefspel. De totaalscore loopt door over beide fases.
        </Section>

        <Section title="Fase 1 – Contracten">
          In fase 1 kiest elke speler om beurt een contract. De speler die kiest,
          kiest alleen het contract; de <b>volgende speler in de rij</b> komt uit
          in de eerste slag.
          <br />
          <br />
          Regels in fase 1:
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>Elke contractsoort mag maximaal 2 keer gespeeld worden.</li>
            <li>Je mag niet 2 keer na elkaar hetzelfde contract kiezen.</li>
            <li>Na elk contract schuift de chooser door naar de volgende speler.</li>
            <li>
              Zodra alle fase-1 contracten 2 keer gespeeld zijn, ga je automatisch
              naar fase 2.
            </li>
          </ul>
        </Section>

        <Section title="Contracten in fase 1">
          <ul style={{ marginTop: 0, marginBottom: 0 }}>
            <li>
              <b>Minste slagen</b> – probeer zo weinig mogelijk slagen te winnen.
            </li>
            <li>
              <b>Minste harten</b> – probeer zo weinig mogelijk harten te pakken.
              Dit contract stopt zodra alle 13 harten gespeeld zijn.
            </li>
            <li>
              <b>Harten Koning</b> – zodra de harten koning gespeeld wordt, stopt
              het contract onmiddellijk. De winnaar van die slag krijgt -5.
            </li>
            <li>
              <b>Minste boeren & koningen</b> – per boer of koning in een slag
              krijgt de winnaar van die slag -1.
            </li>
            <li>
              <b>Geen slag 7 & 13</b> – winnaar van slag 7 krijgt -2 en winnaar
              van slag 13 krijgt -3.
            </li>
            <li>
              <b>Minste queens</b> – per queen in een slag krijgt de winnaar van
              die slag -2.
            </li>
          </ul>
        </Section>

        <Section title="Fase 2 – Troef">
          In fase 2 kiest elke speler <b>2 keer</b> een troefkleur.
          <br />
          <br />
          Voorbeeld met 4 spelers:
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>Player 1 kiest troef → Player 2 komt uit</li>
            <li>Player 2 kiest troef → Player 3 komt uit</li>
            <li>Player 3 kiest troef → Player 4 komt uit</li>
            <li>Player 4 kiest troef → Player 1 komt uit</li>
          </ul>
          <br />
          Daarna begint een tweede ronde, zodat iedereen opnieuw 1 keer troef kiest.
        </Section>

        <Section title="Troefregels">
          <ul style={{ marginTop: 0, marginBottom: 0 }}>
            <li>De gekozen kleur is troef en verslaat alle andere kleuren.</li>
            <li>Je moet kleur volgen als je die hebt.</li>
            <li>Als je de gevraagde kleur niet hebt, mag je troef spelen.</li>
            <li>De winnaar van de slag komt de volgende slag uit.</li>
          </ul>
        </Section>

        <Section title="Scoring in fase 2">
          In fase 2 is de scoring eenvoudig:
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>Elke gewonnen slag is <b>+1 punt</b>.</li>
            <li>Die punten komen bovenop de totaalscore van fase 1.</li>
            <li>Na alle troefrondes wordt de eindranking bepaald.</li>
          </ul>
        </Section>

        <Section title="Einde van de match">
          Zodra fase 2 volledig klaar is:
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>wordt een match summary opgebouwd,</li>
            <li>zie je de winnaar en ranking,</li>
            <li>en kan de match later makkelijk opgeslagen worden voor stats.</li>
          </ul>
        </Section>

        <Section title="Wat de app ook bijhoudt">
          Deze versie houdt ook extra info bij voor later:
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>contract history,</li>
            <li>chooser en leader per contract,</li>
            <li>troefkleur,</li>
            <li>contractscore,</li>
            <li>totale score na elk contract,</li>
            <li>match summary voor latere opslag/statistieken.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 14,
        background: "#fafafa",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <div style={{ lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}