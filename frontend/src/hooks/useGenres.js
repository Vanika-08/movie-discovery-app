import { useEffect, useState } from 'react';
import { api } from '../services/api';

// Loads the genre list once for the filter dropdown.
export function useGenres() {
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    let active = true;
    api.genres()
      .then((data) => { if (active) setGenres(data.genres || []); })
      .catch(() => { if (active) setGenres([]); });
    return () => { active = false; };
  }, []);
  return genres;
}
