const tmdb = require('../services/tmdb.service');

async function discover(req, res, next) {
  try {
    res.json(await tmdb.discoverMovies(req.listQuery));
  } catch (err) { next(err); }
}

async function search(req, res, next) {
  try {
    res.json(await tmdb.searchMovies(req.searchQuery));
  } catch (err) { next(err); }
}

async function details(req, res, next) {
  try {
    res.json(await tmdb.getMovieById(req.movieId));
  } catch (err) { next(err); }
}

async function genres(req, res, next) {
  try {
    res.json({ genres: await tmdb.getGenres() });
  } catch (err) { next(err); }
}

module.exports = { discover, search, details, genres };
