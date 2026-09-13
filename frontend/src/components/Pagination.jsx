export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (page > 3) {
      pages.push('...');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-panel text-slate-400 transition hover:border-white/20 hover:bg-panel2 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((item, index) =>
        item === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="grid h-9 w-7 place-items-center text-sm text-slate-500"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition ${
              page === item
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'border border-white/10 bg-panel text-slate-400 hover:border-white/20 hover:bg-panel2 hover:text-white'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-panel text-slate-400 transition hover:border-white/20 hover:bg-panel2 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}