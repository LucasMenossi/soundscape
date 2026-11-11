# Loading and error states

## App Router conventions

- `src/app/loading.tsx` provides a generic fallback while a route segment is loading.
- Route-level `loading.tsx` files provide a matching skeleton for catalog, detail, library, collection, and authentication routes.
- `src/app/error.tsx` is the root route error boundary. `src/app/global-error.tsx` is reserved for failures in the root layout itself.
- Route-level `error.tsx` boundaries provide contextual recovery messages for data-heavy catalog and personal-library routes.
- `src/app/not-found.tsx` is the shared 404 experience used by `notFound()` from artist, album, genre, and collection routes.

## Shared UI

`PageLoading` centralizes the skeleton variants. It uses the shared `MainContent` landmark and announces the loading state to assistive technology without exposing decorative skeleton blocks.

`RouteError` centralizes retry and navigation actions. It logs the error and optional Next.js digest to the browser console, but does not render raw exception messages to users. The `reset` callback asks the App Router to retry rendering the segment.

## Adding a route

Prefer adding a route-specific `loading.tsx` only when its shape materially differs from the root fallback. Reuse `PageLoading` variants rather than duplicating skeleton markup. Add a route-level `error.tsx` only when a contextual recovery message is useful; otherwise the root `error.tsx` is sufficient.
