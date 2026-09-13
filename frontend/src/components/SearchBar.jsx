export default function SearchBar({ value, onChange, placeholder = 'Search movies…', autoFocus }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-panel py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-white/30"
      />
    </div>
  );
}
