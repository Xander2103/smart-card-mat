export function ZoneGrid({ zones, turnZone, cardNames }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {zones.map((uid, i) => {
        const zoneNr = i + 1;
        const isTurn = turnZone === zoneNr;

        const cardName = uid ? (cardNames?.[i] ?? "(unmapped)") : "(empty)";

        return (
          <div
            key={zoneNr}
            style={{
              border: "2px solid #ddd",
              borderRadius: 12,
              padding: 12,
              background: isTurn ? "#f3f3f3" : "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Zone {zoneNr}</strong>
              {isTurn ? <span>🎯 Turn</span> : null}
            </div>

            <div style={{ marginTop: 8 }}>
              <div>UID: {uid ?? "-"}</div>
              <div><b>Card:</b> {cardName}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}