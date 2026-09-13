export function year(releaseDate) {
  if (!releaseDate) return '—';
  return releaseDate.slice(0, 4);
}

export function prettyDate(releaseDate) {
  if (!releaseDate) return 'Release date unavailable';
  const d = new Date(releaseDate);
  if (Number.isNaN(d.getTime())) return 'Release date unavailable';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ratingText(rating) {
  return rating || rating === 0 ? rating.toFixed(1) : 'NR';
}
