const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic request helper. Accepts an optional AbortSignal so callers can cancel
// stale requests (used by search). Throws Error(message) on failure so the UI
// can show a friendly message + retry.
async function request(path, { signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot reach the server. Please try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const api = {
  discover: ({ page = 1, sort = 'popularity.desc', genre } = {}, signal) => {
    const p = new URLSearchParams({ page, sort });
    if (genre) p.set('genre', genre);
    return request(`/movies?${p.toString()}`, { signal });
  },
  search: ({ query, page = 1 }, signal) => {
    const p = new URLSearchParams({ query, page });
    return request(`/movies/search?${p.toString()}`, { signal });
  },
  movie: (id, signal) => request(`/movies/${id}`, { signal }),
  genres: (signal) => request('/genres', { signal }),
  getWishlist: (signal) => request('/wishlist', { signal }),
  addWishlist: async (movie) => {
    const res = await fetch(`${BASE}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message || 'Could not add to wishlist.');
    return data;
  },
  removeWishlist: async (externalMovieId) => {
    const res = await fetch(`${BASE}/wishlist/${externalMovieId}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error?.message || 'Could not remove from wishlist.');
    }
  },
};
