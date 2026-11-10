# 03 — Technical Architecture

## 1. Agreed stack

| Area | Technology | Responsibility |
|---|---|---|
| Web application | Next.js App Router | Routing, server rendering, route handlers, server-side data access |
| Language | TypeScript | Static typing across application and domain boundaries |
| UI | Tailwind CSS + shadcn/ui | Styling and accessible component primitives |
| Server-state client cache | TanStack Query | Client-side caching, refetching, mutations, pagination/infinite queries where useful |
| Client UI state | Zustand | Small shared client-only state; do not duplicate server data here |
| Database | PostgreSQL | Users, favorites, library, collections, normalized catalog cache where needed |
| ORM | Prisma | Schema, migrations, and typed database access |
| Unit/integration tests | Vitest | Domain logic, provider adapters, services, components as appropriate |
| E2E tests | Playwright | Critical user journeys in a real browser |

## 2. High-level boundaries

Use a modular monolith for the MVP. Do not introduce microservices or a separate backend service without a demonstrated need.

```text
Browser
  └─ Next.js App Router
      ├─ Route segments / Server Components
      ├─ Client components
      │   ├─ TanStack Query (remote state and mutations)
      │   └─ Zustand (ephemeral UI state only)
      ├─ Application services / use cases
      ├─ Domain model and provider interfaces
      ├─ Infrastructure adapters
      │   ├─ MusicBrainz catalog adapter
      │   ├─ Wikimedia media metadata adapter
      │   ├─ Cover Art Archive discovery adapter
      │   └─ Artwork resolver / fallback generator
      └─ Persistence
          └─ PostgreSQL via Prisma
```

## 3. Architectural rules

1. UI components must not call MusicBrainz, Commons, or CAA directly.
2. Provider-specific response shapes must not leak into page components.
3. Application services depend on provider interfaces, not concrete HTTP clients.
4. MusicBrainz MBIDs are external identity keys; store them explicitly and enforce uniqueness.
5. Use server-side provider access for catalog requests. Do not expose provider credentials or internal rate-limit controls to the browser.
6. TanStack Query owns client remote-state caching. Zustand is for transient interface state, not catalog entities or user records fetched from the server.
7. Prisma/database access stays on the server.
8. Keep provider-specific rate limiting, retry, timeout, and cache policies inside infrastructure adapters.
9. Optional provider fields are nullable. Absence of optional data is not an exceptional condition.
10. Image selection is centralized in an artwork resolver that enforces rights status before returning a displayable asset.

## 4. Suggested application structure

```text
src/
  app/
    (public)/
      page.tsx
      search/page.tsx
      artists/[artistId]/page.tsx
      albums/[albumId]/page.tsx
      genres/[genreSlug]/page.tsx
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
    (account)/
      library/page.tsx
      collections/page.tsx
      collections/[collectionId]/page.tsx
    api/                       # only when a route handler is required
  components/
    ui/
    layout/
    search/
    artist/
    album/
    collection/
  features/
    auth/
    search/
    artists/
    albums/
    library/
    collections/
  server/
    services/
    repositories/
    providers/
      musicbrainz/
      wikimedia/
      cover-art-archive/
    artwork/
    db/
  lib/
    env.ts
    query-client.ts
    utils.ts
  stores/                      # Zustand UI-only stores
  types/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
```

This is a proposed organization, not a requirement to create every folder at project initialization. Create modules as their first implementation slice is delivered.

## 5. Rendering and data fetching

- Use Server Components for initial catalog reads and SEO-friendly entity pages.
- Use Client Components for interactive search controls, filters, collection editing, and optimistic interactions where appropriate.
- Use TanStack Query when client-side refetching, pagination, infinite scrolling, or mutation lifecycle materially helps.
- Avoid fetching the same catalog entity independently in multiple layers; define service/query boundaries and reuse them.
- Keep internal URLs stable even if provider identifiers or provider choice later changes.

## 6. Caching strategy

Separate three cache layers:

1. **Provider HTTP cache:** protects upstream APIs and reduces rate-limit pressure. Cache successful catalog responses with TTL; never cache transient failures as successful data.
2. **Application/database cache:** persist normalized catalog entities and external IDs when needed for fast repeat reads and user references.
3. **Browser query cache:** TanStack Query for interactive client data.

Initial TTL values should be configurable and revisited based on provider terms and observed change frequency. Do not assume the PoC's seven-day MusicBrainz file-cache TTL is automatically the production TTL.

## 7. Error handling

- Distinguish not-found, validation, authentication/authorization, rate-limit, upstream-unavailable, timeout, and unexpected errors.
- Retry only transient upstream failures, with bounded exponential backoff, jitter, and `Retry-After` support.
- Do not retry non-idempotent database mutations blindly.
- Show partial pages when non-critical enrichment providers fail.
- Log provider name, operation, status, latency, retry count, and correlation/request ID; do not log secrets or unnecessary personal data.
