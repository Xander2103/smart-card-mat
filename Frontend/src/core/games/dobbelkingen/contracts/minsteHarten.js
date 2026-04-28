function countHearts(plays) {
  let n = 0;
  for (const p of plays ?? []) {
    const code = p?.card;
    if (typeof code === "string" && code.endsWith("H")) n++;
  }
  return n;
}

export const minsteHarten = {
  id: "MINSTE_HARTEN",
  label: "Minste harten",
  desc: "Probeer zo weinig mogelijk harten te nemen.",

  // winnaar krijgt straf = aantal harten in die slag
  scoreTrick({ trick, playersCount, winnerIndex }) {
    const hearts = countHearts(trick);
    if (!hearts) return null;

    const delta = Array.from({ length: playersCount }, () => 0);
    delta[winnerIndex] -= hearts;

    return delta;
  },

  // EndEarly zodra er 13 harten zijn gespeeld (want dan zijn alle strafpunten al toegekend)
  shouldEndEarly({ trickHistory }) {
    let heartsPlayed = 0;

    for (const trick of trickHistory ?? []) {
      for (const play of trick?.plays ?? []) {
        const card = String(play?.card ?? "").toUpperCase();

        if (
          card.endsWith("H") ||
          card.includes("HEART") ||
          card.includes("HART") ||
          card.includes("♥")
        ) {
          heartsPlayed++;
        }
      }
    }

    if (heartsPlayed >= 13) {
      return {
        endEarly: true,
        reason: "ALL_HEARTS_PLAYED",
      };
    }

    return {
      endEarly: false,
      reason: null,
    };
  }};