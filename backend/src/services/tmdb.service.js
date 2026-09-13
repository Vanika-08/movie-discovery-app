const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
const { normalizeMovie, normalizeMovieDetails } = require('../utils/normalize');

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const GENRE_TTL = 24 * 60 * 60 * 1000; // genres change rarely
const TIMEOUT_MS = 8000;

// Single place that talks to TMDB. Adds the api_key, applies a timeout, and
// converts network/TMDB failures into ApiError so controllers stay clean.
async function tmdbFetch(path, params = {}) {
  if (!env.tmdbApiKey) {
    throw new ApiError(500, 'TMDB API key is not configured on the server.');
  }

  const url = new URL(`${env.tmdbBaseUrl}${path}`);
  url.searchParams.set('api_key', env.tmdbApiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError(504, 'The movie service timed out. Please try again.');
    }
    throw new ApiError(502, 'Could not reach the movie service.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    if (res.status === 404) throw new ApiError(404, 'Movie not found.');
    throw new ApiError(502, 'The movie service returned an error.');
  }
  return res.json();
}

// Genre id -> name map, cached so we can label list results that only carry ids.
async function getGenreMap() {
  const cached = cache.get('genreMap');
  if (cached) return cached;
  const data = await tmdbFetch('/genre/movie/list');
  const map = {};
  (data.genres || []).forEach((g) => { map[g.id] = g.name; });
  cache.set('genreMap', map, GENRE_TTL);
  return map;
}

async function getGenres() {
  const cached = cache.get('genresList');
  if (cached) return cached;
  const data = await tmdbFetch('/genre/movie/list');
  const genres = data.genres || [];
  cache.set('genresList', genres, GENRE_TTL);
  return genres;
}

async function discoverMovies({ page = 1, sort = 'popularity.desc', genre } = {}) {
  const key = `discover:${page}:${sort}:${genre || 'all'}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const genreMap = await getGenreMap();
  const data = await tmdbFetch('/discover/movie', {
    page,
    sort_by: sort,
    with_genres: genre,
    include_adult: false,
  });

  const result = {
    page: data.page,
    totalPages: Math.min(data.total_pages || 1, 500), // TMDB caps at 500
    totalResults: data.total_results || 0,
    results: (data.results || []).map((m) => normalizeMovie(m, genreMap)),
  };
  cache.set(key, result, CACHE_TTL);
  return result;
}

async function searchMovies({ query, page = 1 } = {}) {
  const key = `search:${query}:${page}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const genreMap = await getGenreMap();
  const data = await tmdbFetch('/search/movie', {
    query,
    page,
    include_adult: false,
  });

  const result = {
    page: data.page,
    totalPages: Math.min(data.total_pages || 1, 500),
    totalResults: data.total_results || 0,
    results: (data.results || []).map((m) => normalizeMovie(m, genreMap)),
  };
  cache.set(key, result, CACHE_TTL);
  return result;
}

async function getMovieById(id) {
  const key = `movie:${id}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await tmdbFetch(`/movie/${id}`);
  const result = normalizeMovieDetails(data);
  cache.set(key, result, CACHE_TTL);
  return result;
}

module.exports = {
  discoverMovies,
  searchMovies,
  getMovieById,
  getGenres,
};
