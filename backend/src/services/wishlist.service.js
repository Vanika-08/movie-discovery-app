const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');

// Lazily create a single PrismaClient on first use. This keeps the rest of the
// API working even before `prisma generate` has run, and avoids creating the
// client at import time.
let prisma;
function db() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

function getWishlist() {
  return db().wishlistMovie.findMany({ orderBy: { createdAt: 'desc' } });
}

async function addToWishlist(movie) {
  const externalMovieId = Number(movie.externalMovieId);
  const existing = await db().wishlistMovie.findUnique({ where: { externalMovieId } });
  if (existing) return existing; // duplicate -> no-op success
  return db().wishlistMovie.create({
    data: {
      externalMovieId,
      title: movie.title,
      posterUrl: movie.posterUrl ?? null,
      releaseDate: movie.releaseDate ?? null,
      rating: movie.rating ?? null,
    },
  });
}

async function removeFromWishlist(externalMovieId) {
  const id = Number(externalMovieId);
  const existing = await db().wishlistMovie.findUnique({ where: { externalMovieId: id } });
  if (!existing) throw new ApiError(404, 'Movie is not in the wishlist.');
  await db().wishlistMovie.delete({ where: { externalMovieId: id } });
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
