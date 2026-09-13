import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton';
import { year, ratingText } from '../utils/format';

// Placeholder shown when a movie has no poster.
function PosterFallback({ title }) {
  return (
    <div className="poster flex items-center justify-center bg-panel2 p-4 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-bold text-slate-400">
          M
        </div>
        <span className="clamp-2 text-sm text-slate-400">{title}</span>
      </div>
    </div>
  );
}

export default function MovieCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-panel shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/30"
    >
      {/* Poster */}
      <div className="relative overflow-hidden">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            className="poster w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <PosterFallback title={movie.title} />
        )}

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent opacity-80" />

        {/* Rating */}
        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          <span className="text-amber-400">★</span>
          <span>{ratingText(movie.rating)}</span>
        </div>

        {/* Wishlist */}
        <div className="absolute right-2.5 top-2.5">
          <WishlistButton movie={movie} />
        </div>
      </div>

      {/* Movie information */}
      <div className="p-3.5">
        <h3
          className="clamp-2 text-sm font-semibold leading-5 text-white transition-colors group-hover:text-red-300"
          title={movie.title}
        >
          {movie.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span>{year(movie.releaseDate)}</span>

          <span className="h-1 w-1 rounded-full bg-slate-600" />

          <span className="text-slate-500">Movie</span>
        </div>
      </div>
    </Link>
  );
}