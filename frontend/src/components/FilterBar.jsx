import { useEffect, useRef, useState } from 'react';

function Dropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) || null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 min-w-[145px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-panel px-3 text-sm text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-panel2 focus:outline-none"
      >
        <span className="truncate">
          {selectedOption?.label || placeholder}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
       <div className="custom-scrollbar absolute right-0 top-[calc(100%+6px)] z-50 max-h-52 w-[145px] overflow-y-auto rounded-xl border border-white/10 bg-panel p-1.5 shadow-2xl shadow-black/40">
          {options.map((option) => {
            const active = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {option.label}

                {active && (
                  <span className="ml-auto text-xs text-red-400">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  genres,
  genre,
  sort,
  onGenreChange,
  onSortChange,
}) {
  const genreOptions = [
    { value: '', label: 'All genres' },
    ...genres.map((g) => ({
      value: g.id,
      label: g.name,
    })),
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most popular' },
    { value: 'vote_average.desc', label: 'Top rated' },
    { value: 'release_date.desc', label: 'Newest' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown
        value={genre}
        options={genreOptions}
        onChange={onGenreChange}
        placeholder="All genres"
      />

      <Dropdown
        value={sort}
        options={sortOptions}
        onChange={onSortChange}
        placeholder="Sort by"
      />
    </div>
  );
}