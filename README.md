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

The database and authentication variables are templates for upcoming implementation phases. A working database is not required for the current static foundation page.

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
