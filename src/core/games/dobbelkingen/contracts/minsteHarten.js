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
  shouldEndEarly({ trickHistory }) {s
    let hearts = 0;

    for (const t of trickHistory ?? []) {
      hearts += countHearts(t.plays);
    }

    return hearts >= 13;
  }
};