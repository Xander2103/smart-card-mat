// src/ui/DobbelkingenPanel.jsx
import { DOBBELKINGEN_CONTRACTS } from "../core/game/dobbelkingenContracts";

function pillStyle() {
    return {
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        border: "1px solid #eee",
        borderRadius: 999,
        padding: "6px 10px",
        background: "white",
        fontSize: 12,
        opacity: 0.9,
    };
}

function ContractCard({ c, onPick, plays = 0, disabled = false, reason = "" }) {
    return (
        <button
            onClick={() => !disabled && onPick(c.id)}
            disabled={disabled}
            style={{
                textAlign: "left",
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                background: disabled ? "#fafafa" : "white",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>{c.label}</div>

                <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.85 }}>
                    ({plays}/2)
                </div>
            </div>

            <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>{c.desc}</div>

            {disabled && reason ? (
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700 }}>
                    {reason}
                </div>
            ) : null}
        </button>
    );
}

export function DobbelkingenPanel({ appState, onClose, onStart, onChooseContract }) {
    const chooserName =
        appState.players?.[appState.chooserIndex]?.name ?? "Chooser";
    const currentName =
        appState.players?.[appState.currentPlayerIndex]?.name ?? "-";

    return (
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>Dobbelkingen</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button onClick={onClose}>Terug</button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <div style={pillStyle()}>
                    Phase: <b>{appState.phase}</b>
                </div>
                <div style={pillStyle()}>
                    Chooser: <b>{chooserName}</b>
                </div>
                <div style={pillStyle()}>
                    Contract: <b>{appState.contract ?? "-"}</b>
                </div>
                <div style={pillStyle()}>
                    Current: <b>{currentName}</b>
                </div>
                <div style={pillStyle()}>
                    TurnZone: <b>{appState.turnZone ?? "-"}</b>
                </div>
            </div>

            {appState.phase === "DOBBELKINGEN_READY" && (
                <div style={{ marginTop: 12 }}>
                    <button onClick={onStart} style={{ fontWeight: 800 }}>
                        Start Dobbelkingen
                    </button>
                    <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
                        Eerst kiest {chooserName} een contract. Daarna komt de volgende speler uit.
                    </div>
                </div>
            )}

            {appState.phase === "CHOOSING_CONTRACT" && (
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 800 }}>{chooserName} kiest een spel:</div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                        }}
                    >
                        {DOBBELKINGEN_CONTRACTS.map((c) => {
                            const plays = appState.contractPlays?.[c.id] ?? 0;
                            const disabledByRepeat = appState.lastContract === c.id;
                            const disabledByMax = plays >= 2;
                            const disabled = disabledByRepeat || disabledByMax;

                            const reason = disabledByRepeat
                                ? "Niet 2× na elkaar"
                                : disabledByMax
                                    ? "Al 2× gespeeld"
                                    : "";

                            return (
                                <ContractCard
                                    key={c.id}
                                    c={c}
                                    onPick={onChooseContract}
                                    plays={plays}
                                    disabled={disabled}
                                    reason={reason}
                                />
                            );
                        })}
                    </div>

                    {/* Tussenstand: totale score over alle contracten */}
                    <div
                        style={{
                            marginTop: 14,
                            border: "1px solid #eee",
                            borderRadius: 14,
                            padding: 12,
                        }}
                    >
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Tussenstand</div>

                        <div style={{ display: "grid", gap: 6 }}>
                            {(appState.players ?? []).map((p, i) => (
                                <div
                                    key={p.id ?? i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "8px 10px",
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 12,
                                    }}
                                >
                                    <div>
                                        <b>{p.name}</b>
                                    </div>
                                    <div style={{ fontWeight: 800 }}>{p.score ?? 0}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                            Scores zijn totaal (opgeteld over alle gespeelde contracten).
                        </div>
                    </div>
                </div>
            )}

            {appState.phase === "PLAYING_TRICK" && (
                <div style={{ marginTop: 12, opacity: 0.75, fontSize: 13 }}>
                    Spelen is gestart. Gebruik je huidige “Confirm turn” flow (turnZone) om kaarten te bevestigen.
                </div>
            )}
        </div>
    );
}