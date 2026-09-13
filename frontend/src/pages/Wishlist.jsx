import { useWishlist } from '../context/WishlistContext';
import MovieGrid from '../components/MovieGrid';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

// Wishlist reads from our database (via context). Stored rows use
// externalMovieId; map them to the normalized movie shape the cards expect.
export default function Wishlist() {
  const { items, loading, error, reload } = useWishlist();

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-6"><LoadingSkeleton count={5} /></div>;
  }
  if (error) {
    return <div className="mx-auto max-w-6xl px-4 py-6"><ErrorState message={error} onRetry={reload} /></div>;
  }

  const movies = items.map((m) => ({
    id: m.externalMovieId,
    title: m.title,
    posterUrl: m.posterUrl,
    releaseDate: m.releaseDate,
    rating: m.rating,
  }));

  return (
    <div className="mx-auto max-w-8xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Your wishlist</h1>
      <p className="mb-6 text-sm text-slate-400">
        {movies.length} {movies.length === 1 ? 'movie' : 'movies'} saved.
      </p>
      {movies.length === 0 ? (
        <EmptyState title="Your wishlist is empty" message="Tap the heart on any movie to save it here." />
      ) : (
        <MovieGrid movies={movies} />
      )}
    </div>
  );
}
