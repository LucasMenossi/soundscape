# 10 — Phase 3: Collections Foundation

## Delivered in this slice

- Added `Collection`, owned by the existing `User` persistence entity.
- Added `CollectionItem`, supporting both canonical artists and albums in the same collection.
- Added a database check constraint requiring exactly one matching catalog target for each item.
- Added per-collection unique indexes to prevent adding the same artist or album more than once.
- Added collection and item domain types, repository contract, Prisma repository, application service, and composition root.
- Added service tests for input validation, user-scoped deletion, ownership checks, duplicate prevention, and item creation.
- Collections are private to their owner; no public sharing or visibility model is included.
- Item ordering is represented by a `position` field. Reordering use cases and UI remain deferred.

## Follow-up experience slice

The CRUD and item-management UI is documented in `11-phase-3-collections-experience.md`. The current application includes collection list/detail routes, create/edit/delete actions, and add/remove item flows.

## Deliberately not included

- No public collections, sharing, collaboration, cover customization, or smart/dynamic collections.
- No drag-and-drop reordering; the `position` field is retained for a later increment.
- No authentication, credentials, sessions, or auth provider.
- No temporary or anonymous identity mechanism. Services receive `userId` explicitly, consistent with the Personal Library foundation.

Authentication integration remains the final Phase 3 increment.

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
