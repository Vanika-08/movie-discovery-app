import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const [page, setPage] = useState(Number(params.get('page') || 1));
  const debounced = useDebounce(term, 400);

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const latest = useRef(0);

  useEffect(() => {
    const next = {};
    if (debounced) next.q = debounced;
    if (page > 1) next.page = String(page);
    setParams(next, { replace: true });
  }, [debounced, page, setParams]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const load = useCallback(
    (pageNumber = 1, isLoadMore = false) => {
      if (!debounced.trim()) {
        setData(null);
        setStatus('idle');
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setStatus('loading');
      }

      const requestId = ++latest.current;
      const controller = new AbortController();

      api.search(
        {
          query: debounced,
          page: pageNumber,
        },
        controller.signal
      )
        .then((res) => {
          if (requestId !== latest.current) return;

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
          if (err.name === 'AbortError') return;

          if (requestId === latest.current) {
            setStatus('error');
          }
        })
        .finally(() => {
          if (requestId === latest.current) {
            setLoadingMore(false);
          }
        });

      return controller;
    },
    [debounced]
  );

  useEffect(() => {
    const controller = load(1, false);

    return () => {
      if (controller) controller.abort();
    };
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

  function retry() {
    load(1, false);
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>

      <div className="mb-6 max-w-xl">
        <SearchBar value={term} onChange={setTerm} autoFocus />
      </div>

      {status === 'idle' && (
        <EmptyState
          title="Search for a movie"
          message="Start typing a title to see results."
        />
      )}

      {status === 'loading' && <LoadingSkeleton count={10} />}

      {status === 'error' && <ErrorState onRetry={retry} />}

      {status === 'done' && data && (
        data.results.length === 0 ? (
          <EmptyState
            title="No movies found"
            message={`No results for "${debounced}".`}
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