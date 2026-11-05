# 10 — Phase 3: Collections Foundation

## Delivered in this slice

- Added `Collection`, owned by the existing `User` persistence entity.
- Added `CollectionItem`, supporting both canonical artists and albums in the same collection.
- Added a database check constraint requiring exactly one matching catalog target for each item.
- Added per-collection unique indexes to prevent adding the same artist or album more than once.
- Added collection and item domain types, repository contract, Prisma repository, application service, and composition root.
- Added service tests for input validation, user-scoped deletion, ownership checks, duplicate prevention, and item creation.
- Collections are private to their owner; no public sharing or visibility model is included.
- Item ordering is represented by a `position` field. Reordering use cases and UI are deferred to the collection experience slice.

## Deliberately not included

- No collection CRUD UI, collection detail route, or item management UI yet.
- No public collections, sharing, collaboration, cover customization, or smart/dynamic collections.
- No authentication, credentials, sessions, or auth provider.
- No temporary or anonymous identity mechanism. Services receive `userId` explicitly, consistent with the Personal Library foundation.

The next slice will add collection creation/editing/deletion and adding/removing catalog items through the application service. The authentication integration remains the final Phase 3 increment.

## Database migration

Migration: `20261105160000_add_collections_foundation`

After replacing the project files, run:

```bash
npx prisma migrate dev
npx prisma generate
npm run test
npm run typecheck
npm run lint
```

The migration adds `collections`, `collection_items`, and the `CollectionItemEntityType` enum. It does not modify existing catalog, user, or favorite rows.
