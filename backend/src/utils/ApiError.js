// Small error type so controllers/services can throw errors with an HTTP
// status code, and the central error handler can turn them into clean JSON.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
