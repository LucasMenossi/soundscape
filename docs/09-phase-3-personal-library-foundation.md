# 09 — Phase 3: Personal Library Foundation

## Delivered in this slice

- Added a minimal `User` persistence entity as the future ownership anchor. It contains no credentials, provider IDs, sessions, or authentication behavior.
- Added `Favorite` with `ARTIST` / `ALBUM` entity types.
- Added PostgreSQL constraints to require exactly one matching catalog target and prevent duplicate favorites for the same user/entity.
- Added a domain model, repository contract, Prisma repository, application service, and composition root.
- Added service tests for add, duplicate prevention, input validation, and user-scoped removal.
- Updated the Phase 3 roadmap so authentication remains the final implementation slice.

## Deliberately not included

- No sign-up, sign-in, sign-out, credentials, sessions, OAuth, or auth provider.
- The follow-up Personal Library slice adds server actions and UI for favorites.
- No anonymous-user identity, browser-local fallback, or temporary session mechanism.
- No collections yet; they follow the Personal Library experience.

The service receives `userId` explicitly. When authentication is implemented at the end of Phase 3, a server-side auth adapter will resolve the current user and pass that ID into application services. Repositories and UI components must not parse auth cookies or provider-specific session objects.

## Database migration

Migration: `20261105150000_add_personal_library_foundation`

After replacing the project files, run:

```bash
npx prisma migrate dev
npx prisma generate
npm run test
npm run typecheck
npm run lint
```

The migration adds `users`, `favorites`, the `FavoriteEntityType` enum, foreign keys, unique indexes, and a CHECK constraint. No existing catalog rows are modified.


## Personal Library experience slice

- Added `/library` with separate artist and album lists, saved counts, and empty states.
- Added favorite toggles to artist and album detail pages and removal actions in the library.
- All mutations use a server action and the existing FavoriteService; the browser never supplies an authenticated user identity.
- Until authentication is delivered at the end of Phase 3, the app uses one configured local workspace ID (`SOUNDSCAPE_LIBRARY_USER_ID`). In development it defaults to `local-library`; production requires an explicit environment value. This is a single shared workspace, not per-visitor identity or authentication.
- When auth is added, replace the local workspace resolver with a server-side current-user adapter without changing the favorite domain or repository contracts.
