// Grid of shimmering placeholder cards shown while movies load.
export default function LoadingSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-panel">
          <div className="poster w-full animate-pulse bg-panel2" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-panel2" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-panel2" />
          </div>
        </div>
      ))}
    </div>
  );
}
