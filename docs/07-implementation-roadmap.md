# 07 — Implementation Roadmap

This roadmap reflects the implementation state in this repository after the catalog exploration consolidation.

## Phase 0 — Application foundation

**Status: implemented baseline; deployment/E2E exit criteria remain open.**

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.
- PostgreSQL and Prisma migration workflow.
- ESLint, TypeScript typecheck, and Vitest.
- Application shell and public route patterns.

Remaining verification: Playwright setup, preview deployment, and full CI validation.

## Phase 1 — Catalog foundation

**Status: implemented.**

- MusicBrainz HTTP client with identifiable User-Agent, timeout, rate limiting, retry, and successful-response cache.
- Artist and release-group search.
- Canonical artist and album persistence using MBIDs.
- Stable internal artist and album routes.

## Phase 2 — Exploration experience

**Status: core implementation present; final acceptance validation remains open.**

- Artist detail pages and studio discography.
- Album detail pages.
- Curated genre vocabulary, genre associations, and browse routes.
- Independent pagination for genre artist and album lists.
- Twelve-item pages for artist discography.
- Community tags are fetched separately from genres and shown as non-navigable context.
- Artist relationship synchronization and presentation are deferred; artist pages do not call `artist-rels`.
- Original CSS-based artwork fallback.

Exit validation still required: local browser walkthrough, empty/error-state review, and E2E coverage for search, artist, album, and genre navigation.

## Phase 3 — Authentication and personal curation

**Status: Personal Library and Collections experiences implemented; authentication remains.**

- Personal Library page with separate artist and album sections.
- Favorite and remove actions from artist and album detail pages.
- User-scoped persistence through the Favorite application service and repository.
- A single configured local workspace is used until authentication is implemented; it is not an authentication or anonymous-session mechanism.
- Private collection list/detail routes with create, update, delete, add-item, and remove-item flows.
- Artists and albums can be added to collections from their catalog detail pages.
- Authentication and authorization integration remain the final Phase 3 increment.

## Phase 4 — Artwork enablement

**Status: not started.**

- Wikimedia Commons candidate ingestion.
- Per-file human relevance and rights review.
- Central artwork resolver and attribution UX.
- Unknown or uncleared third-party artwork remains unavailable to public UI.

## Phase 5 — Quality and MVP release

**Status: not started.**

- Playwright E2E coverage for critical journeys.
- Accessibility and responsive review.
- Provider outage/rate-limit tests and observability.
- Privacy, security, data retention, and deployment review.

## Deferred

- Artist relationship presentation and related-artist recommendations.
- Similarity/recommendation algorithms.
- Mood discovery, listening history, playback, streaming, and social features.

### Phase 3 — Collections foundation slice

- Collection persistence scoped to the owning user.
- Collections can contain artists and albums in one ordered item list.
- Application service supports create, update, delete, list, detail, add item, and remove item.
- Database constraints prevent duplicate catalog items per collection and enforce exactly one catalog target per item.
- Collection CRUD UI and item-management UI are implemented in `/collections` and `/collections/[collectionId]`.
- Authentication remains the final Phase 3 increment.
