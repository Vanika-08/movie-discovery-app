const { tmdbImageBase } = require('../config/env');

const FALLBACK_OVERVIEW = 'No overview available.';

function imageUrl(path, size) {
  return path ? `${tmdbImageBase}/${size}${path}` : null;
}

// Turn a raw TMDB movie object into our predictable shape. Missing fields get
// safe fallbacks so the frontend never has to defend against undefined.
function normalizeMovie(m, genreMap = {}) {
  // TMDB list endpoints give genre_ids; the details endpoint gives genres[].
  let genres = [];
  if (Array.isArray(m.genres)) {
    genres = m.genres.map((g) => g.name).filter(Boolean);
  } else if (Array.isArray(m.genre_ids)) {
    genres = m.genre_ids.map((id) => genreMap[id]).filter(Boolean);
  }

  return {
    id: m.id,
    title: m.title || m.name || 'Untitled',
    overview: m.overview && m.overview.trim() ? m.overview : FALLBACK_OVERVIEW,
    posterUrl: imageUrl(m.poster_path, 'w500'),
    backdropUrl: imageUrl(m.backdrop_path, 'w1280'),
    rating: typeof m.vote_average === 'number' ? Number(m.vote_average.toFixed(1)) : null,
    releaseDate: m.release_date || null,
    genres,
  };
}

// Extra fields for the details page.
function normalizeMovieDetails(m) {
  const base = normalizeMovie(m);
  return {
    ...base,
    runtime: m.runtime || null,
    language: m.original_language || null,
    tagline: m.tagline || null,
    status: m.status || null,
  };
}

module.exports = { normalizeMovie, normalizeMovieDetails };
