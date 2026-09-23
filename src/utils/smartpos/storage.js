const memory = new Map();
let useMemory = false;

try {
  window.localStorage.setItem('__smartpos_test__', '1');
  window.localStorage.removeItem('__smartpos_test__');
} catch {
  useMemory = true;
}

const store = {
  get(key) {
    if (useMemory) return memory.get(key) ?? null;
    return window.localStorage.getItem(key);
  },
  set(key, value) {
    if (useMemory) return memory.set(key, value);
    window.localStorage.setItem(key, value);
  },
  remove(key) {
    if (useMemory) return memory.delete(key);
    window.localStorage.removeItem(key);
  },
  clear() {
    if (useMemory) return memory.clear();
    window.localStorage.clear();
  },
};

export const storage = {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  remove: (key) => store.remove(key),
  clear: () => store.clear(),
  getJson(key) {
    const raw = store.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setJson(key, value) {
    store.set(key, JSON.stringify(value));
  },
};