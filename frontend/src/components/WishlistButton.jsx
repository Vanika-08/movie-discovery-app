import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistButton({ movie, className = '' }) {
  const { isSaved, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(movie.id);

  async function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (busy) return;

    setBusy(true);

    try {
      await toggle(movie);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/60 text-base backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/80 disabled:opacity-50 ${className}`}
    >
      <span
        className={`transition-colors ${
          saved ? 'text-red-500' : 'text-white/90'
        }`}
      >
        {saved ? '♥' : '♡'}
      </span>
    </button>
  );
}