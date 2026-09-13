const ApiError = require('../utils/ApiError');
const wishlist = require('../services/wishlist.service');

async function list(req, res, next) {
  try {
    res.json({ results: await wishlist.getWishlist() });
  } catch (err) { next(err); }
}

async function add(req, res, next) {
  try {
    const { externalMovieId, title } = req.body || {};
    if (externalMovieId === undefined || Number.isNaN(Number(externalMovieId))) {
      throw new ApiError(400, 'externalMovieId is required and must be a number.');
    }
    if (!title || typeof title !== 'string') {
      throw new ApiError(400, 'title is required.');
    }
    const saved = await wishlist.addToWishlist(req.body);
    res.status(201).json(saved);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId < 1) {
      throw new ApiError(400, 'Invalid movie id.');
    }
    await wishlist.removeFromWishlist(movieId);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { list, add, remove };
