import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { prettyDate, ratingText } from '../utils/format';
import ErrorState from '../components/ErrorState';

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="skeleton h-48 w-full rounded-2xl sm:h-72" />
      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="skeleton poster mx-auto w-40 rounded-xl sm:mx-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-7 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const { isSaved, toggle } = useWishlist();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(() => {
    setStatus('loading');
    const controller = new AbortController();
    api.movie(id, controller.signal)
      .then((res) => { setMovie(res); setStatus('done'); })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });
    return controller;
  }, [id]);

  useEffect(() => {
    const controller = load();
    return () => controller.abort();
  }, [load]);

  if (status === 'loading') return <DetailsSkeleton />;
  if (status === 'error' || !movie) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorState message="Could not load this movie." onRetry={load} />
      </div>
    );
  }

  const saved = isSaved(movie.id);
  const rating = ratingText(movie.rating);

  return (
    <div className="pb-12">
      {/* Backdrop layer: sits behind content, fades into the page background. */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {movie.backdropUrl ? (
            <img
              src={movie.backdropUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-top opacity-60"
            />
          ) : (
            <div className="h-full w-full bg-panel2" />
          )}
          {/* Gradients: darken top for readability, fade bottom into page. */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        </div>

        <div className="mx-auto max-w-8xl px-4 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-slate-300 transition-colors hover:text-white"
          >
            ← Back
          </Link>

          {/* Content sits in normal flow — no negative margins, so nothing overlaps. */}
          <div className="mt-[200px] flex flex-col gap-6 sm:flex-row sm:pt-8">
            {/* Poster */}
            <div className="mx-auto w-40 shrink-0 sm:mx-0 md:w-52">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="poster w-full rounded-xl border border-edge object-cover shadow-card"
                />
              ) : (
                <div className="poster flex w-full items-center justify-center rounded-xl border border-edge bg-panel2 p-3 text-center text-xs text-slate-500">
                  {movie.title}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="clamp-2 mt-2 italic text-slate-400">{movie.tagline}</p>
              )}

              {/* Meta row wraps cleanly on small screens */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                {rating !== 'NR' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 font-semibold text-brand-400">
                    <span>★</span>{rating}
                  </span>
                )}
                <span>{prettyDate(movie.releaseDate)}</span>
                {movie.runtime ? <span>{movie.runtime} min</span> : null}
                {movie.language ? <span className="uppercase">{movie.language}</span> : null}
              </div>

              {movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-edge bg-panel/60 px-3 py-1 text-xs text-slate-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-200">
                {movie.overview}
              </p>

                <button
              onClick={() => toggle(movie)}
              className={`mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                saved ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <span>{saved ? '♥' : '♡'}</span>
              {saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}