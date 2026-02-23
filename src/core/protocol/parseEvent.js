export function parseEvent(line) {
  //verwijder spaties en enters
  const trimmed = line.trim();
  //string leeg is = stop
  if (!trimmed) return null;
  //split bij |
  const parts = trimmed.split("|");
  //Pak het eerste deel als type
  const type = parts[0];

  if (type === "P" && parts.length === 3) {
    return { type: "placed", zone: Number(parts[1]), uid: parts[2], raw: trimmed };
  }

  if (type === "R" && parts.length === 3) {
    return { type: "removed", zone: Number(parts[1]), uid: parts[2], raw: trimmed };
  }

  if (type === "T" && parts.length === 2) {
    return { type: "turn", zone: Number(parts[1]), raw: trimmed };
  }

  return { type: "unknown", raw: trimmed };
}