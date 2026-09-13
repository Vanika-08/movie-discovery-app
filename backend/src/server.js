const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
  if (!env.tmdbApiKey) {
    console.warn('WARNING: TMDB_API_KEY is not set. Movie endpoints will return an error until you add it to backend/.env');
  }
});
