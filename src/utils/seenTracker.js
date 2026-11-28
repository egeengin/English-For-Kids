/**
 * Lightweight localStorage helpers to mark completed/played items (scenes, books, drawings, arcade games).
 */

export function loadCompletedSet(storageKey) {
  if (typeof window === 'undefined' || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function saveCompletedSet(storageKey, set) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...set]));
  } catch {
    // Ignore quota errors
  }
}

export function markCompletedId(storageKey, prevSet, id) {
  if (!id || prevSet.has(id)) return prevSet;
  const next = new Set(prevSet);
  next.add(id);
  saveCompletedSet(storageKey, next);
  return next;
}
