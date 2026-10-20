function matchesShape(value, example) {
  if (Array.isArray(example)) {
    if (!Array.isArray(value)) return false;
    if (example.length === 0) return true;
    return value.every((entry) => matchesShape(entry, example[0]));
  }

  if (example && typeof example === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return Object.keys(example).every((key) => matchesShape(value[key], example[key]));
  }

  return typeof value === typeof example;
}

export function loadState(storageKey, createSeedData) {
  const fallback = createSeedData();

  try {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) return fallback;

    const parsedValue = JSON.parse(storedValue);
    return matchesShape(parsedValue, fallback) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(storageKey, state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetState(storageKey, createSeedData) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // The in-memory reset still works when browser storage is unavailable.
  }

  return createSeedData();
}
