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

The catalog requires a configured PostgreSQL database and MusicBrainz User-Agent. Configure `DATABASE_URL`, `DIRECT_URL`, and `MUSICBRAINZ_USER_AGENT` in your local environment before using catalog routes.

## Available scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Run the production server
npm run lint      # Run ESLint
npm run typecheck # Run the TypeScript compiler
```

## Product constraints

- MusicBrainz MBIDs are the canonical external identifiers for artists and release groups.
- Third-party artwork is not publicly displayed until its specific rights and attribution requirements have been reviewed and cleared.
- Original SoundScape artwork is the fallback when no cleared image is available.
- The MVP is free-first and excludes playback and streaming integrations.

### Artist discography

Artist detail pages include a discography section sourced from MusicBrainz release groups. Results are matched by the artist MusicBrainz ID, synchronized into the local catalog, and displayed in release-date order with links to the internal album detail pages.

### Genre exploration

The `/genres` route synchronizes the curated MusicBrainz genre vocabulary from `/ws/2/genre/all?fmt=txt`, independently of which artists or albums have already been visited. The plain-text endpoint returns the complete vocabulary in one request. The vocabulary is refreshed at most once per 24 hours per server process and is cached by the MusicBrainz HTTP client. Artist and release-group genre associations are imported with `inc=genres`; free-form `inc=tags` values are not used as genres. Existing legacy tag records outside the curated vocabulary are removed during the next successful genre-catalog synchronization. Genre pages show local SoundScape artist and album counts only; they do not imply complete MusicBrainz coverage. No Prisma schema migration is required for this slice because the existing genre tables are reused.

### Artist relationships

Artist detail pages request MusicBrainz `artist-rels` and persist a deliberately small subset of relationship types: band membership, collaboration, and supporting musicians. Direction is translated into a source-relative relationship label before persistence, so the existing `artist_relationships` schema can be reused without a migration. Relationship sections are shown only when MusicBrainz supplies a supported relationship; they are catalog relationships, not similarity recommendations. Provider failures do not block the artist page.
