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
    if (!storedValue) return { state: fallback, warning: '' };

    const parsedValue = JSON.parse(storedValue);
    if (matchesShape(parsedValue, fallback)) return { state: parsedValue, warning: '' };
    return { state: fallback, warning: 'Saved demo data was incompatible and has been replaced with fresh sample data.' };
  } catch (error) {
    return {
      state: fallback,
      warning: `Could not read saved demo data: ${error.message}`,
    };
  }
}

export function saveState(storageKey, state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return '';
  } catch (error) {
    return `Could not save demo data in this browser: ${error.message}`;
  }
}

export function resetState(storageKey, createSeedData) {
  let warning = '';
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    warning = `Could not clear saved demo data: ${error.message}`;
  }

  return { state: createSeedData(), warning };
}
