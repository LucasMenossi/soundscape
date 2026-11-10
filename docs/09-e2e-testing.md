# 09 — End-to-End Testing

## Purpose

Playwright exercises SoundScape through a real browser and a local Next.js development server. It does not deploy the application.

The E2E suite uses a dedicated Neon branch so test accounts and collections cannot affect the development database.

## One-time setup

1. Create a separate Neon branch for E2E tests. Do not use the branch configured in `.env.local`.
2. Copy `.env.e2e.example` to `.env.e2e`.
3. Set `E2E_DATABASE_URL` to the branch's pooled connection string (`-pooler`).
4. Set `E2E_DIRECT_URL` to the same branch/database's direct connection string (without `-pooler`).
5. Generate `E2E_AUTH_SECRET` with `openssl rand -base64 32`.
6. Set `E2E_DATABASE_ISOLATED="true"` only after verifying that this is a separate branch.
7. Install the new development dependency and browser:

   ```bash
   npm install
   npx playwright install chromium
   ```

`npm install` updates `package-lock.json` with the Playwright dependency. No deployment is involved.

## Run

```bash
npm run test:e2e
```

The guarded runner:

- Requires `.env.e2e`.
- Validates that pooled and direct URLs point to the same Neon branch and database.
- Compares the E2E branch with the branch in `.env.local` / `.env` and refuses to run if they match.
- Generates Prisma Client.
- Applies existing migrations to the dedicated E2E branch.
- Starts Next.js locally on `http://127.0.0.1:3100`.
- Runs the Playwright Chromium suite.

Do not run `npx playwright test` directly; use `npm run test:e2e` so the database safety checks and E2E environment are applied.

## Current coverage

- Public homepage renders the discovery entry points.
- Empty catalog search state renders without calling MusicBrainz.
- Unauthenticated visitors are redirected from the personal library to sign-in.
- A user can sign up, open their library, create/edit/delete a collection, and sign out.
- The genre catalog can be filtered and a genre detail page can be opened.
- Catalog search can open an artist detail page, navigate to an album, and return to the artist.
- An authenticated user can favorite an artist and an album, add both to a collection, remove a collection item, and remove a favorite from the library.

The account and library journeys create uniquely named users in the dedicated E2E branch. They deliberately do not delete users automatically; the test database is isolated and can be reset by recreating the Neon branch.

## External catalog dependency

The catalog discovery and library journeys use the real MusicBrainz integration and search for **Radiohead**. The E2E environment therefore needs outbound network access to MusicBrainz. These tests validate the integration as experienced in the browser, rather than mocking provider responses. Artwork is not asserted because image-provider availability is not required for the catalog and library journeys.

## Safety and data

- E2E tests do not truncate tables or delete existing user records.
- Collection CRUD is performed only by the test user created during that run.
- The runner never uses `DATABASE_URL` or `DIRECT_URL` from `.env.local` for the E2E server or migrations.
- Keep `.env.e2e` out of version control.
