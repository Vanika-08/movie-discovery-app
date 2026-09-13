import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useGenres } from '../hooks/useGenres';
import MovieGrid from '../components/MovieGrid';
import FilterBar from '../components/FilterBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const genres = useGenres();
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | error | done

  const load = useCallback(
    (pageNumber = 1, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setStatus('loading');
      }

      const controller = new AbortController();

      api.discover(
        {
          page: pageNumber,
          sort,
          genre,
        },
        controller.signal
      )
        .then((res) => {
          setData((prev) => ({
            ...res,
            results: isLoadMore
              ? [...(prev?.results || []), ...res.results]
              : res.results,
          }));

          setPage(res.page);
          setStatus('done');
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setStatus('error');
          }
        })
        .finally(() => {
          setLoadingMore(false);
        });

      return controller;
    },
    [sort, genre]
  );

  useEffect(() => {
    const controller = load(1, false);

    return () => controller.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    if (
      loadingMore ||
      status === 'loading' ||
      !data ||
      page >= data.totalPages
    ) {
      return;
    }

    load(page + 1, true);
  }, [loadingMore, status, data, page, load]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '400px',
      }
    );

    const target = observerRef.current;

    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  function changeGenre(value) {
    setGenre(value);
  }

  function changeSort(value) {
    setSort(value);
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover movies</h1>
          <p className="text-sm text-slate-400">Browse popular titles and filter by genre.</p>
        </div>
        <FilterBar
          genres={genres}
          genre={genre}
          sort={sort}
          onGenreChange={changeGenre}
          onSortChange={changeSort}
        />
      </div>

      {status === 'loading' && <LoadingSkeleton count={10} />}
      {status === 'error' && (
        <ErrorState onRetry={load} />
      )}
      {status === 'done' && data && (
        data.results.length === 0 ? (
          <EmptyState
            title="No movies found"
            message="Try a different genre or sort option."
          />
        ) : (
          <>
            <MovieGrid movies={data.results} />

            <div
              ref={observerRef}
              className="flex min-h-20 items-center justify-center"
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
                  Loading more movies...
                </div>
              )}

              {!loadingMore && page >= data.totalPages && (
                <span className="py-6 text-sm text-slate-500">
                  You've reached the end.
                </span>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}