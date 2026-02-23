const STORAGE_KEY = "scm_uid_to_card_v1";

export function loadMapping() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") return obj;
    return {};
  } catch {
    return {};
  }
}

export function saveMapping(mapping) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
}

export function setMappingValue(mapping, uid, cardName) {
  return { ...mapping, [uid]: cardName };
}