const ApiError = require('../utils/ApiError');

function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}

// Central error handler: every thrown/async error ends up here and becomes a
// consistent JSON shape. Unexpected errors are logged and hidden behind a 500.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message } });
  }
  console.error('[unexpected error]', err);
  res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
}

module.exports = { notFound, errorHandler };
