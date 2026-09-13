// Tiny in-memory cache with per-entry TTL. Used to avoid hitting TMDB again
// for identical requests within a short window (e.g. the same discover page).
// Good enough for this assignment; a real app might use Redis.
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

module.exports = { get, set };
