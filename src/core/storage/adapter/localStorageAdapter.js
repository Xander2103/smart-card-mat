function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export const localStorageAdapter = {

  get(key, fallback = null) {
    const raw = localStorage.getItem(key);
    return safeParse(raw, fallback);
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  }

};