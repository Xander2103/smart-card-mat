export function createId(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now();

  return `${prefix}_${time}_${rand}`;
}