import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

// Holds the wishlist in memory (loaded from our DB) and exposes add/remove.
// The source of truth is the database; this context just mirrors it so any
// component can check "is this movie saved?" without refetching.
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWishlist();
      setItems(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isSaved = useCallback(
    (movieId) => items.some((m) => m.externalMovieId === movieId),
    [items],
  );

  const add = useCallback(async (movie) => {
    const payload = {
      externalMovieId: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl ?? null,
      releaseDate: movie.releaseDate ?? null,
      rating: movie.rating ?? null,
    };
    const saved = await api.addWishlist(payload);
    setItems((prev) =>
      prev.some((m) => m.externalMovieId === saved.externalMovieId) ? prev : [saved, ...prev],
    );
  }, []);

  const remove = useCallback(async (movieId) => {
    await api.removeWishlist(movieId);
    setItems((prev) => prev.filter((m) => m.externalMovieId !== movieId));
  }, []);

  const toggle = useCallback(
    async (movie) => {
      if (items.some((m) => m.externalMovieId === movie.id)) {
        await remove(movie.id);
      } else {
        await add(movie);
      }
    },
    [items, add, remove],
  );

  return (
    <WishlistContext.Provider value={{ items, loading, error, isSaved, add, remove, toggle, reload: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
