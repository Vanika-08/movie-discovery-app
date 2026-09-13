# Movie Discovery App

A full-stack movie discovery application. Browse popular movies, search, filter
by genre, sort, view details, and keep a persistent wishlist. The React frontend
never talks to TMDB directly — all external calls go through a Node/Express
backend that normalizes the data and caches responses.

## Features

- Browse/discover movies immediately on load (no search required)
- Debounced search with request cancellation and race-condition protection
- Genre filter and sorting (popularity, rating, release date)
- Pagination through large result sets
- Movie details page (poster, backdrop, overview, rating, runtime, genres, language)
- Persistent wishlist stored in SQLite (survives refresh and browser restart)
- Loading skeletons, empty states, and error states with retry
- Graceful handling of missing data (no poster, overview, rating, etc.)
- Responsive layout for mobile, tablet, and desktop

## Tech stack

- Frontend: React + Vite, React Router, Tailwind CSS, plain hooks + Context
- Backend: Node.js + Express
- Database: SQLite via Prisma
- External data: TMDB API (v3 API key, backend only)

## Architecture

```
React (Vite)  ->  Express backend  ->  TMDB API
                       |
                       +-> Prisma -> SQLite (wishlist)
```

The browser only calls our backend. The TMDB key lives only in `backend/.env`.
The backend normalizes every TMDB response into a consistent shape and caches
results in memory for a short time.

## Folder structure

```
movie-discovery-app/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/env.js
│   │   ├── controllers/       movies + wishlist (thin)
│   │   ├── middleware/        validation + central error handler
│   │   ├── routes/            /health /genres /movies /wishlist
│   │   ├── services/          tmdb.service.js, wishlist.service.js
│   │   ├── utils/             normalize, cache, ApiError
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── components/  MovieCard, MovieGrid, SearchBar, FilterBar,
        │                Pagination, LoadingSkeleton, EmptyState, ErrorState, Navbar
        ├── pages/       Home, Search, MovieDetails, Wishlist
        ├── services/    api.js (only place that calls our backend)
        ├── hooks/       useDebounce, useGenres
        ├── context/     WishlistContext
        └── utils/       format helpers
```

## Setup

Prerequisites: Node 18+ (the backend uses the built-in `fetch`), npm.

You need a free TMDB v3 API key: https://www.themoviedb.org/settings/api

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# open .env and set TMDB_API_KEY to your v3 key
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # default points at http://localhost:5000/api
npm run dev
```

Frontend runs on http://localhost:5173

## Environment variables

Backend (`backend/.env`):

| Variable | Description |
| --- | --- |
| `PORT` | Backend port (default 5000) |
| `FRONTEND_URL` | Allowed CORS origin (http://localhost:5173) |
| `TMDB_API_KEY` | TMDB v3 API key (backend only) |
| `DATABASE_URL` | SQLite location (`file:./dev.db`) |

Frontend (`frontend/.env`):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of our backend API (http://localhost:5000/api) |

## Database setup

Prisma + SQLite. The schema defines a single `WishlistMovie` model. Create the
database and tables with:

```bash
cd backend
npx prisma migrate dev --name init
```

This produces `backend/prisma/dev.db`. Inspect data with `npx prisma studio`.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/genres` | Genre list |
| GET | `/api/movies` | Discover (`page`, `sort`, `genre`) |
| GET | `/api/movies/search` | Search (`query`, `page`) |
| GET | `/api/movies/:id` | Movie details |
| GET | `/api/wishlist` | Saved movies |
| POST | `/api/wishlist` | Add movie (dedup by `externalMovieId`) |
| DELETE | `/api/wishlist/:movieId` | Remove by external (TMDB) id |

List responses use the shape `{ page, totalPages, totalResults, results: [movie] }`.
Normalized movie: `{ id, title, overview, posterUrl, backdropUrl, rating, releaseDate, genres }`
(details also include `runtime`, `language`, `tagline`, `status`).

## Data flow

- Home: React -> `GET /api/movies` -> backend checks cache -> TMDB discover ->
  normalize -> cache -> React renders grid.
- Search: user types -> 400ms debounce -> previous request aborted ->
  `GET /api/movies/search` -> normalize -> render (stale responses ignored).
- Details: `GET /api/movies/:id` -> TMDB details -> normalize -> render.
- Wishlist: `POST /api/wishlist` writes a snapshot to SQLite; `GET /api/wishlist`
  reads from SQLite (never TMDB); `DELETE /api/wishlist/:movieId` removes it.

## Technical decisions

- Backend abstraction hides the API key, centralizes normalization/caching/error
  handling, and means the frontend never changes if the provider changes.
- Normalization gives the frontend one predictable movie shape with safe
  fallbacks, so missing fields can't break the UI.
- SQLite + Prisma: zero-setup file database, typed queries, easy migrations —
  ideal for a single persistent wishlist and easy to explain.
- Wishlist stores a snapshot (title, poster, year, rating) plus the TMDB id.
  This lets the wishlist render instantly with no per-item TMDB call, keeps
  working if TMDB is slow/down, and avoids rate limits. `externalMovieId` is
  unique, which prevents duplicates at the database level.
- In-memory cache with short TTL (5 min for lists/details, 24h for genres) cuts
  repeat TMDB calls without extra infrastructure.

## Error handling

- Backend: a central error handler returns a consistent `{ error: { message } }`
  shape; validation errors are 400, unknown routes 404, TMDB failures map to
  502/504, and unexpected errors are logged and returned as a generic 500.
- Frontend: every page shows loading, empty, and error states; error states
  include a retry button.

## Performance considerations

- Debounced search (400ms) avoids a request per keystroke.
- `AbortController` cancels stale search/detail requests.
- A request-id guard in Search prevents an older response from overwriting a
  newer one (race-condition protection).
- Backend caching reduces repeat TMDB calls and helps with rate limits.
- Pagination keeps payloads small; images are lazy-loaded.
- TMDB request timeout (8s) so a slow upstream fails cleanly.

## Known limitations

- In-memory cache is per-process and clears on restart (fine for one instance).
- Wishlist is global (no user accounts / auth).
- Search uses TMDB relevance; no advanced multi-filter search.
- Wishlist snapshots are not refreshed after saving.

## AI usage

AI tools were used to assist with API documentation research, initial
boilerplate, debugging, and code review, and to explore implementation
approaches. The final architecture, implementation decisions, and application
behaviour were reviewed and understood by the developer.

## Future improvements

- User accounts so wishlists are per-user
- Infinite scroll as an alternative to pagination
- Redis cache for multi-instance deployments
- Trailer/cast sections on the details page
- Automated tests (backend endpoints + frontend components)
