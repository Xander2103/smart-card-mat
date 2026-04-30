import { useState } from "react";
import { DECK52 } from "../../../core/mapping/deck52";
import { buttonStyle, colors, panelStyle } from "../../play/theme";

export function DevCardSimulator({
    currentTurnZone,
    currentTurnPlayerName,
    onSimulateDevCard,
    onSimulateRandomContract,
}) {
    const [cardCode, setCardCode] = useState("KH");

    const selectedCard = DECK52.find((card) => card.code === cardCode);
    const canSimulate = currentTurnZone !== null && currentTurnZone !== undefined;

    function handleSimulatePlaced() {
        if (!canSimulate) return;

        onSimulateDevCard?.({
            zone: currentTurnZone,
            cardCode,
            action: "placed",
        });
    }

    function handleSimulateRemoved() {
        if (!canSimulate) return;

        onSimulateDevCard?.({
            zone: currentTurnZone,
            cardCode,
            action: "removed",
        });
    }

    return (
        <div style={panelStyle({ padding: 16, display: "grid", gap: 12 })}>
            <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                    Dev kaartensimulator
                </div>

                <div style={{ color: colors.muted, fontSize: 13 }}>
                    Simuleert automatisch op de zone van de speler die aan de beurt is.
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "140px minmax(220px, 1fr)",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <label style={{ color: colors.muted, fontSize: 13 }}>
                    Huidige beurt
                </label>

                <div
                    style={{
                        background: "rgba(15,23,42,0.28)",
                        color: colors.text,
                        border: "1px solid rgba(251,191,36,0.16)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontWeight: 800,
                    }}
                >
                    {canSimulate
                        ? `${currentTurnPlayerName ?? "Speler"} — Zone ${currentTurnZone}`
                        : "Geen actieve beurt"}
                </div>

                <label style={{ color: colors.muted, fontSize: 13 }}>
                    Kaart
                </label>

                <select
                    value={cardCode}
                    onChange={(event) => setCardCode(event.target.value)}
                    style={{
                        background: "rgba(15,23,42,0.28)",
                        color: colors.text,
                        border: "1px solid rgba(251,191,36,0.16)",
                        borderRadius: 12,
                        padding: "10px 12px",
                    }}
                >
                    {DECK52.map((card) => (
                        <option key={card.code} value={card.code}>
                            {card.label} — {card.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ color: colors.muted, fontSize: 13 }}>
                Gekozen kaart: <b>{selectedCard?.name}</b> — fake UID:{" "}
                <b>{`DEV_${cardCode}`}</b>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button
                    onClick={handleSimulatePlaced}
                    disabled={!canSimulate}
                    style={{
                        ...buttonStyle("primary"),
                        opacity: canSimulate ? 1 : 0.45,
                        cursor: canSimulate ? "pointer" : "not-allowed",
                    }}
                >
                    Simuleer kaart voor huidige speler
                </button>

                <button
                    onClick={handleSimulateRemoved}
                    disabled={!canSimulate}
                    style={{
                        ...buttonStyle(),
                        opacity: canSimulate ? 1 : 0.45,
                        cursor: canSimulate ? "pointer" : "not-allowed",
                    }}
                >
                    Simuleer kaart weg
                </button>
                <button
                    onClick={onSimulateRandomContract}
                    disabled={typeof onSimulateRandomContract !== "function"}
                    style={{
                        ...buttonStyle("success"),
                        opacity: typeof onSimulateRandomContract === "function" ? 1 : 0.45,
                        cursor:
                            typeof onSimulateRandomContract === "function"
                                ? "pointer"
                                : "not-allowed",
                    }}
                >
                    Simuleer volledig contract
                </button>
            </div>
        </div>
    );
}