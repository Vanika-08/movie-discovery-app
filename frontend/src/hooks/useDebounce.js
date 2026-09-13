import { useEffect, useState } from 'react';

// Returns a debounced copy of a value that only updates after `delay` ms of no
// changes. Used so we don't fire a search request on every keystroke.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
