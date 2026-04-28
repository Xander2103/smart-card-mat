export const ZONES = 4;

export function isMatchLocked(appState) {
  const phase = appState?.phase ?? "HOME";

  return (
    phase === "CHOOSING_CONTRACT" ||
    phase === "CHOOSING_TROEF" ||
    phase === "PLAYING_TRICK"
  );
}

export function getBleStatusStyles(bleStatus) {
  const statusColor =
    bleStatus === "connected"
      ? "#4ade80"
      : bleStatus === "connecting..."
        ? "#fbbf24"
        : bleStatus === "error"
          ? "#fb7185"
          : "#ef4444";

  const bleGlow =
    bleStatus === "connected"
      ? "0 0 18px rgba(74, 222, 128, 0.42)"
      : bleStatus === "connecting..."
        ? "0 0 16px rgba(251, 191, 36, 0.30)"
        : "0 0 16px rgba(239, 68, 68, 0.28)";

  return { statusColor, bleGlow };
}

export function getCardNames(zones, mapping, cardByCode) {
  return zones.map((uid) => {
    if (!uid) return null;

    const code = mapping[uid] ?? null;
    if (!code) return null;

    const card = cardByCode?.[code];
    return card ? `${card.label} (${card.name})` : code;
  });
}

export function getMobileHeaderFlags(appState, isMobile) {
  const mobileCompactHeader =
    isMobile &&
    appState?.activeMode === "DOBBELKINGEN" &&
    [
      "DOBBELKINGEN_READY",
      "CHOOSING_CONTRACT",
      "CHOOSING_TROEF",
      "PLAYING_TRICK",
    ].includes(appState?.phase);

  const mobileTableOnlyMode =
    mobileCompactHeader && appState?.phase === "PLAYING_TRICK";

  return { mobileCompactHeader, mobileTableOnlyMode };
}
