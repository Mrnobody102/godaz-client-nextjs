const RECENT_SEARCHES_KEY = 'godaz_recent_searches_v1';
const MAX_RECENT_SEARCHES = 6;

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function normalizeSearchKey(value: string) {
  return value.trim().toLowerCase();
}

export function getRecentSearches() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === 'string')
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed || !canUseStorage()) return getRecentSearches();

  const next = [
    trimmed,
    ...getRecentSearches().filter(
      (item) => normalizeSearchKey(item) !== normalizeSearchKey(trimmed)
    ),
  ].slice(0, MAX_RECENT_SEARCHES);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches() {
  if (canUseStorage()) {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
  }
  return [];
}
