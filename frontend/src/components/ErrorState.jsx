export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-16 text-center">
      <div className="mb-2 text-3xl">⚠️</div>
      <p className="font-semibold text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
}
