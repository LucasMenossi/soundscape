# SoundScape

SoundScape is a music-discovery and personal-curation application. It helps people explore artists, albums, genres, and relationships between artists.

The MVP is not a streaming service: it does not play music, integrate with Spotify, or require a paid streaming subscription.

## Technology

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn/ui
- TanStack Query for client-side server state
- Zustand for ephemeral client UI state
- PostgreSQL and Prisma
- Vitest and Playwright

## Getting started

### Requirements

- Node.js LTS compatible with the installed Next.js version
- npm
- PostgreSQL (needed when database-backed features are introduced)

### Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The catalog requires a configured PostgreSQL database and MusicBrainz User-Agent. Configure ``DATABASE_URL`, `DIRECT_URL`, and `MUSICBRAINZ_USER_AGENT` in your local environment before using catalog routes.

## Available scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Run the production server
npm run lint      # Run ESLint
npm run typecheck # Run the TypeScript compiler
npm run test      # Run Vitest
```

## Product constraints

- MusicBrainz MBIDs are the canonical external identifiers for artists and release groups.
- Third-party artwork is not publicly displayed until its specific rights and attribution requirements have been reviewed and cleared.
- Original SoundScape artwork is the fallback when no cleared image is available.
- The MVP is free-first and excludes playback and streaming integrations.

### Artist discography

Artist detail pages include a discography section sourced from MusicBrainz release groups. Results are matched by the artist MusicBrainz ID, synchronized into the local catalog, and displayed in release-date order with links to the internal album detail pages.

### Genres and community tags

SoundScape keeps two distinct kinds of catalog metadata:

- **Genres** use the curated SoundScape vocabulary, mapped from MusicBrainz `inc=genres`. They are persisted, navigable, and used for browse routes and genre associations.
- **Community tags** come from MusicBrainz `inc=tags`. They are fetched separately and displayed as contextual labels; they are not persisted as genres and do not create browse routes. Values such as `1990s`, `seen live`, and `female vocalists` therefore cannot pollute the genre taxonomy.

Genre detail pages paginate local artist and album associations. Counts represent the complete local catalog, while each page returns a bounded slice.

### Discography

Artist pages display studio albums from MusicBrainz release groups. The provider retrieves the matching release-group catalog, persists canonical records, and the page presents it in 12-item pages. Singles, EPs, compilations, live albums and other secondary release types are excluded.

### Deferred artist connections

Artist relationship synchronization and presentation are currently deferred. The existing domain/repository work is retained for possible future use, but artist pages do not request `artist-rels` or render relationship sections. SoundScape does not present these catalog relationships as recommendations.


### MusicBrainz resilience

The MusicBrainz HTTP client applies the configured request interval, timeout, bounded retries, exponential backoff with jitter, and `Retry-After` handling. HTTP `408`, `429`, `500`, `502`, `503`, and `504` are treated as retryable. Only successful parsed responses are cached.


### Personal Library (Phase 3)

The `/library` page lists saved artists and albums. Artist and album detail pages include an add/remove favorite action; saved items can also be removed directly from the library. Mutations run through server actions and the Favorite application service.

Authentication uses Better Auth with email/password and immediate sign-in after registration. Email verification and email delivery are intentionally out of scope for the MVP. The current user is resolved from the server-side session for every personal page and mutation. Configure `AUTH_SECRET`, `APP_URL`, and `AUTH_TRUSTED_ORIGINS`. The previous `local-library` workspace row is preserved as an unassigned legacy record; it is not transferred to the first registrant.

## Collections foundation

The Phase 3 Collections experience adds `/collections` and `/collections/[collectionId]` for creating, editing, deleting, and viewing private collections. Artists and albums can be added from their catalog detail pages and removed from collection detail. Collection actions run through server actions and the Collection application service. Authentication remains deferred until the end of Phase 3.

Collection actions use a compact collection picker. Success, duplicate-item information, and unexpected failures are presented with shadcn Sonner toasts, keeping feedback outside the page layout.

### Date formatting

MusicBrainz partial dates are displayed according to their available precision: `YYYY` remains a year, `YYYY-MM` becomes a month and year, and `YYYY-MM-DD` becomes a readable full date. Artist life-span dates and album first-release dates share the same formatter, without timezone shifts.


### Collection picker layout stability

The collection picker is anchored to its trigger using a relatively positioned, fixed-width wrapper. Its list opens as an absolutely positioned overlay, so opening it does not push the artist/album metadata or other page content down. Feedback remains handled by Sonner and does not occupy inline layout space.


## Architecture decisions

- [ADR 0005 — Authentication strategy](docs/adr/0005-authentication-strategy.md)
- [Authentication implementation plan](docs/13-auth-implementation-plan.md)


## Authentication setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (at least 32 random characters), `APP_URL`, and `AUTH_TRUSTED_ORIGINS`.
3. Apply the migration with `npm run db:deploy` (or `npm run db:migrate` locally), then run `npm run db:generate`.
4. Start the app. Registration does not require an email service.

Authentication endpoints are served at `/api/auth/*`. Public artist and album pages remain available without a session. `/library`, `/collections`, and their mutations require an authenticated user.


See [Authentication implementation](docs/14-authentication-implementation.md) for the implementation status, environment setup, migration notes, and verification checklist.
