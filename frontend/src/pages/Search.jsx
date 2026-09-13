import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

// Search page. Input is debounced; each request is cancellable via
// AbortController; a request-id guard ensures a slow older response can't
// overwrite a newer one (race-condition protection). The query is mirrored to
// the URL so results are shareable and survive refresh.
export default function Search() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const [page, setPage] = useState(Number(params.get('page') || 1));
  const debounced = useDebounce(term, 400);

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | error | done
  const latest = useRef(0);

  // Keep the URL in sync.
  useEffect(() => {
    const next = {};
    if (debounced) next.q = debounced;
    if (page > 1) next.page = String(page);
    setParams(next, { replace: true });
  }, [debounced, page, setParams]);

  // Reset to page 1 when the (debounced) term changes.
  useEffect(() => { setPage(1); }, [debounced]);

  useEffect(() => {
    if (!debounced.trim()) {
      setData(null);
      setStatus('idle');
      return;
    }
    const requestId = ++latest.current;
    const controller = new AbortController();
    setStatus('loading');
    api.search({ query: debounced, page }, controller.signal)
      .then((res) => {
        if (requestId === latest.current) { setData(res); setStatus('done'); }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (requestId === latest.current) setStatus('error');
      });
    return () => controller.abort();
  }, [debounced, page]);

  function retry() { setTerm((t) => t); setStatus('loading'); setPage((p) => p); }

  return (
    <div className="mx-auto max-w-8xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      <div className="mb-6 max-w-xl">
        <SearchBar value={term} onChange={setTerm} autoFocus />
      </div>

      {status === 'idle' && (
        <EmptyState title="Search for a movie" message="Start typing a title to see results." />
      )}
      {status === 'loading' && <LoadingSkeleton count={10} />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'done' && data && (
        data.results.length === 0 ? (
          <EmptyState title="No movies found" message={`No results for "${debounced}".`} />
        ) : (
          <>
            <MovieGrid movies={data.results} />
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )
      )}
    </div>
  );
}
