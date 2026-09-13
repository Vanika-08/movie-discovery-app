export default function EmptyState({ title = 'Nothing here', message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-panel/50 px-6 py-16 text-center">
      <div className="mb-2 text-3xl">🎬</div>
      <p className="font-semibold">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>}
    </div>
  );
}
