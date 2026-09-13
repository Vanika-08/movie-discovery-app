const ApiError = require('../utils/ApiError');

const ALLOWED_SORTS = new Set([
  'popularity.desc',
  'popularity.asc',
  'vote_average.desc',
  'vote_average.asc',
  'release_date.desc',
  'release_date.asc',
  'primary_release_date.desc',
  'primary_release_date.asc',
]);

// Parse + validate the discover/list query params. Bad values throw a 400.
function parseListQuery(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      throw new ApiError(400, 'page must be an integer between 1 and 500.');
    }
    const sort = req.query.sort || 'popularity.desc';
    if (!ALLOWED_SORTS.has(sort)) {
      throw new ApiError(400, 'Invalid sort value.');
    }
    let genre;
    if (req.query.genre !== undefined && req.query.genre !== '') {
      genre = Number(req.query.genre);
      if (!Number.isInteger(genre) || genre < 1) {
        throw new ApiError(400, 'genre must be a positive integer id.');
      }
    }
    req.listQuery = { page, sort, genre };
    next();
  } catch (err) {
    next(err);
  }
}

function parseSearchQuery(req, res, next) {
  try {
    const query = (req.query.query || '').trim();
    if (!query) throw new ApiError(400, 'query is required.');
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      throw new ApiError(400, 'page must be an integer between 1 and 500.');
    }
    req.searchQuery = { query, page };
    next();
  } catch (err) {
    next(err);
  }
}

function parseIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return next(new ApiError(400, 'Invalid movie id.'));
  }
  req.movieId = id;
  next();
}

module.exports = { parseListQuery, parseSearchQuery, parseIdParam };
