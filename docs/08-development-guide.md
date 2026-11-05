# 08 — Development Guide

## Local setup

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
```

Configure both `DATABASE_URL` (application/pool connection) and `DIRECT_URL` (Prisma CLI/direct connection), plus `MUSICBRAINZ_USER_AGENT`.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

## Current catalog behavior

- MusicBrainz is accessed only from server-side providers.
- Successful HTTP responses are cached; transient failures are not cached as successful data.
- MusicBrainz requests use a process-level rate limiter and bounded retries for 408, 429, 500, 502, 503, and 504, with exponential backoff, jitter, and `Retry-After`.
- Genre catalog values are canonicalized to the SoundScape allowlist.
- Artist and album community tags remain separate from the genre taxonomy.
- Genre artist/album lists and artist discography are paginated in the UI.

## Engineering conventions

- Keep provider DTOs separate from domain models.
- Validate external provider payloads before use.
- Keep Prisma and provider access server-only.
- Use Server Components for initial catalog reads.
- Do not expose unreviewed third-party artwork.
- Log optional enrichment failures while preserving the core catalog page.
- Add tests alongside each behavior change.
