export default function RouteLoading({ label = "page" }) {
  return (
    <main
      aria-busy="true"
      aria-label={`Loading ${label}`}
      className="min-h-[70vh] bg-[#080808] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        <p className="sr-only" role="status">
          Loading {label} content
        </p>
        <div className="motion-safe:animate-pulse">
          <div className="mb-5 h-3 w-28 bg-white/10" />
          <div className="h-10 max-w-xl bg-white/10 sm:h-14" />
          <div className="mt-3 h-10 max-w-md bg-white/10 sm:h-14" />
          <div className="mt-7 h-3 max-w-lg bg-white/[0.06]" />
          <div className="mt-3 h-3 max-w-sm bg-white/[0.06]" />
          <div className="mt-12 min-h-48 border border-white/[0.08] bg-white/[0.02] sm:min-h-64" />
        </div>
      </div>
    </main>
  );
}
