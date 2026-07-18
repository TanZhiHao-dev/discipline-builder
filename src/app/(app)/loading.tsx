import { Skeleton } from "@/components/ui/skeleton";

/**
 * Instant navigation shell. Because this file exists, clicking any nav link
 * paints this skeleton immediately (Suspense boundary) instead of freezing on
 * the old page until the server finishes every DB query — and it lets Next
 * prefetch these dynamic routes up to the boundary, so the click feels instant.
 */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6" aria-busy>
      {/* page title */}
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-2 h-4 w-72" />

      {/* stat cards row */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* main content block */}
      <div className="mt-6 space-y-3">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-5/6 rounded-lg" />
        <Skeleton className="h-11 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}
