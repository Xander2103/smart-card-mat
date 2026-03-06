const LOG_MAX = 200;

export function pushLog(prevLog, raw) {
  const next = [raw, ...(prevLog ?? [])];
  return next.length > LOG_MAX ? next.slice(0, LOG_MAX) : next;
}

export function clampIndex(i, max) {
  if (max <= 0) return 0;
  return ((i % max) + max) % max;
}

export function inc(obj, key) {
  return { ...(obj ?? {}), [key]: ((obj?.[key] ?? 0) + 1) };
}

export function isHeartCode(code) {
  if (!code) return false;

  const s = String(code).trim().toUpperCase();

  if (s.endsWith("H")) return true;
  if (s.includes("HEART") || s.includes("HART")) return true;
  if (s.includes("♥")) return true;

  return false;
}

export function countHeartsInTrickHistory(trickHistory) {
  let n = 0;
  for (const t of trickHistory ?? []) {
    for (const p of t?.plays ?? []) {
      if (isHeartCode(p?.card)) n++;
    }
  }
  return n;
}
