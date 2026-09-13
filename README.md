# 🎬 Movie Discovery App

A full-stack movie discovery application built with **React, Node.js, Express, Prisma, SQLite, and the TMDB API**.

Users can browse popular movies, search for titles, filter by genre, sort results, view movie details, and maintain a persistent wishlist. The React frontend never talks to TMDB directly. Every movie-related external request goes through the Node/Express backend, which normalizes the data, handles errors, and caches responses.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Data Flow](#data-flow)
- [Technical Decisions](#technical-decisions)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [AI Usage](#ai-usage)
- [Future Improvements](#future-improvements)

---

## Features

- Browse and discover popular movies immediately on load
- Infinite scroll on the discover/home page
- Debounced movie search with request cancellation and race-condition protection
- Infinite scroll on search results
- Filter movies by genre
- Sort movies by popularity, rating, and release date
- Movie details page with poster, backdrop, overview, rating, runtime, genres, language, tagline, and release date
- Persistent wishlist stored through SQLite and Prisma
- Database-level duplicate prevention for wishlist items
- Loading skeletons, empty states, and error states with retry
- Graceful handling of missing movie data
- Responsive layout for mobile, tablet, and desktop
- Backend caching to reduce repeated TMDB requests and help with API rate limits

---

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Tailwind CSS
- React Hooks + Context API

**Backend**

- Node.js
- Express

**Database**

- SQLite
- Prisma ORM

**External API**

- TMDB API v3

---

## Architecture

```
React (Vite)
     |
     v
Express Backend
     |
     +----> TMDB API
     |
     +----> Prisma ----> SQLite
                         (wishlist)
```

The browser only ever communicates with the Express backend.

The TMDB API key is kept server-side in `backend/.env`. The backend acts as an abstraction layer between the frontend and TMDB: it normalizes TMDB responses into a consistent application-specific format, handles errors, and caches frequently requested data.

---

## Folder Structure

```
movie-discovery-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   ├── context/
    │   └── utils/
    └── .env.example
```

---

## Setup

### Prerequisites

- Node.js 18+
- npm
- A free TMDB v3 API key

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set your TMDB API key, then run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs at **http://localhost:5000**

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Backend port. Defaults to `5000`. |
| `FRONTEND_URL` | Allowed frontend origin for CORS. |
| `TMDB_API_KEY` | TMDB v3 API key. Must remain server-side. |
| `DATABASE_URL` | SQLite database location, e.g. `file:./dev.db`. |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the Express API. |

> ⚠️ Never commit `.env` files or API keys to source control.

---

## Database

The application uses **Prisma with SQLite**.

The database contains a `WishlistMovie` model with a unique `externalMovieId`, which prevents the same TMDB movie from being saved more than once.

For local development:

```bash
cd backend
npx prisma migrate dev --name init
```

To inspect the local database:

```bash
npx prisma studio
```

> The generated SQLite database should not be committed to the repository.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/genres` | Get available movie genres |
| GET | `/api/movies` | Discover movies using page, sort, and genre |
| GET | `/api/movies/search` | Search movies using query and page |
| GET | `/api/movies/:id` | Get movie details |
| GET | `/api/wishlist` | Get saved wishlist movies |
| POST | `/api/wishlist` | Add a movie to the wishlist |
| DELETE | `/api/wishlist/:movieId` | Remove a movie using its TMDB ID |

**List responses** use:

```json
{
  "page": 1,
  "totalPages": 100,
  "totalResults": 2000,
  "results": []
}
```

**Normalized movie objects** use:

```json
{
  "id": 0,
  "title": "",
  "overview": "",
  "posterUrl": "",
  "backdropUrl": "",
  "rating": 0,
  "releaseDate": "",
  "genres": []
}
```

**Movie details** additionally include `runtime`, `language`, `tagline`, and `status`.

---

## Data Flow

### Discover

```
Home
  -> GET /api/movies
  -> Express backend
  -> Cache check
  -> TMDB discover endpoint
  -> Normalize response
  -> Cache response
  -> React renders movie grid
```

### Search

```
User types
  -> 400ms debounce
  -> Previous request cancelled
  -> GET /api/movies/search
  -> Backend
  -> TMDB search
  -> Normalize response
  -> React renders results
```

A request-id guard prevents an older response from overwriting a newer search result.

### Movie Details

```
Movie Details
  -> GET /api/movies/:id
  -> Express backend
  -> TMDB details endpoint
  -> Normalize response
  -> React renders details
```

### Wishlist

```
Add movie
  -> POST /api/wishlist
  -> Prisma
  -> SQLite

Wishlist page
  -> GET /api/wishlist
  -> SQLite
  -> React renders saved movies
```

Wishlist data is stored as a snapshot, so rendering the wishlist does not require a separate TMDB request for every saved movie.

---

## Technical Decisions

### Backend Abstraction

The frontend does not know about TMDB endpoints or API authentication. The Express backend handles provider-specific requests, normalization, caching, validation, and error mapping. This keeps the frontend easy to maintain and allows the external movie provider to be changed without changing the frontend API contract.

### Normalization

TMDB responses are converted into a predictable application-specific movie shape. This keeps UI components simple and lets the application handle incomplete TMDB data safely.

### SQLite + Prisma

SQLite provides a simple, zero-setup database for the wishlist, while Prisma provides migrations and a clear database access layer.

### Wishlist Snapshots

When a movie is added, the application stores the TMDB ID along with display information such as title, poster URL, release date, and rating. This allows the wishlist to render without making a TMDB request for every saved movie. The `externalMovieId` field is unique, preventing duplicate wishlist entries.

### Caching

The backend uses a short-lived in-memory cache:

- Movie lists/details: approximately 5 minutes
- Genres: approximately 24 hours

This reduces repeated TMDB requests and helps with API rate limits.

---

## Error Handling

### Backend

The backend uses centralized error handling and returns a consistent structure:

```json
{
  "error": {
    "message": "..."
  }
}
```

| Case | Status |
|---|---|
| Validation errors | `400` |
| Unknown routes | `404` |
| TMDB/upstream failures | `502` |
| TMDB timeout | `504` |
| Unexpected server errors | `500` |

### Frontend

The frontend provides loading states, loading skeletons, empty states, error states, retry actions, and graceful fallbacks for missing movie information.

---

## Performance Considerations

- Search is debounced by 400ms to avoid a request for every keystroke.
- `AbortController` cancels stale search and movie-detail requests.
- A request-id guard prevents stale search responses from replacing newer results.
- Discover and search results are loaded incrementally using infinite scroll.
- Movie images are lazy-loaded.
- Backend caching reduces repeated TMDB requests.
- TMDB requests have an 8-second timeout.
- A database unique constraint prevents duplicate wishlist records.

---

## Deployment

The application is deployed as two services:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** SQLite with Prisma

The frontend uses `VITE_API_URL` to communicate with the deployed Express API. The backend uses `FRONTEND_URL` to configure CORS and keeps the TMDB API key server-side.

Production environment variables should be configured through the hosting provider's environment-variable settings rather than committed to Git.

### Production SQLite Note

SQLite is file-based. Hosting environments with ephemeral filesystems can lose SQLite data after a restart or redeployment unless persistent storage is configured. For a production-scale application, a managed database such as PostgreSQL would be a better choice.

---

## Known Limitations

- The in-memory cache is per process and is cleared when the backend restarts.
- The wishlist is global and does not have user accounts or authentication.
- Search relies on TMDB relevance and does not provide advanced multi-filter search.
- Wishlist entries store a snapshot and are not automatically refreshed from TMDB.
- Production SQLite persistence depends on the hosting environment's persistent-storage configuration.
- The current application does not include automated tests.

---

## AI Usage

AI tools were used to assist with API documentation research, initial boilerplate, debugging, code review, and exploring implementation approaches. The final architecture, implementation decisions, code changes, and application behaviour were reviewed and understood by the developer.

---

## Future Improvements

- Add user accounts and authentication so each user has a separate wishlist
- Move production data storage to PostgreSQL
- Use Redis for distributed caching across multiple backend instances
- Add automated backend and frontend tests
- Add trailer, cast, and crew sections to movie details
- Add more advanced filtering and discovery options
- Add improved observability and production logging
