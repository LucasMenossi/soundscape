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

Until authentication is implemented as the final Phase 3 increment, the application uses one local workspace owner. Development defaults to `local-library`; set `SOUNDSCAPE_LIBRARY_USER_ID` explicitly in production. This is a single shared workspace, not a visitor-specific anonymous identity. The future auth adapter will resolve the current user server-side and pass its ID to the existing services.

## Collections foundation

The Phase 3 Collections experience adds `/collections` and `/collections/[collectionId]` for creating, editing, deleting, and viewing private collections. Artists and albums can be added from their catalog detail pages and removed from collection detail. Collection actions run through server actions and the Collection application service. Authentication remains deferred until the end of Phase 3.

Collection actions use a compact collection picker. Success, duplicate-item information, and unexpected failures are presented with shadcn Sonner toasts, keeping feedback outside the page layout.

### Date formatting

MusicBrainz partial dates are displayed according to their available precision: `YYYY` remains a year, `YYYY-MM` becomes a month and year, and `YYYY-MM-DD` becomes a readable full date. Artist life-span dates and album first-release dates share the same formatter, without timezone shifts.


### Collection picker layout stability

The collection picker is anchored to its trigger using a relatively positioned, fixed-width wrapper. Its list opens as an absolutely positioned overlay, so opening it does not push the artist/album metadata or other page content down. Feedback remains handled by Sonner and does not occupy inline layout space.
