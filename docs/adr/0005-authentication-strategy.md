# ADR 0005 — Use Better Auth for Email/Password Authentication

- Status: Accepted
- Date: 2026-11-05
- Decision owners: SoundScape project
- Scope: MVP authentication foundation

## Context

SoundScape is a Next.js App Router application using TypeScript, PostgreSQL, and Prisma ORM 7. Favorites and collections require a stable, authenticated owner per visitor. The previous shared `local-library` identity is not suitable for a public multi-user application.

Personal application services already accept an explicit internal `userId`. Authentication should resolve that identity at the server boundary without coupling domain services to an authentication vendor.

## Decision

Adopt **Better Auth** for email-and-password authentication.

### Authentication method

- Email and password are the only authentication method in the MVP.
- Email verification is not required. A successful sign-up creates the account and establishes a session immediately.
- No confirmation email, SMTP transport, password-reset email, OAuth, passkeys, or magic links are included in this increment.
- Password reset and account lifecycle features can be evaluated separately if product needs justify them.

### Persistence

- Store users, sessions, accounts, and Better Auth verification records in the existing PostgreSQL database. The verification table remains part of the adapter schema for compatibility/future auth features; it is not used to gate MVP sign-in.
- Use Better Auth's Prisma adapter with the existing Prisma 7 client.
- Extend the existing `User` model rather than replacing it.
- Preserve existing `Favorite.userId` and `Collection.userId` relations to the same internal `User.id`.
- Application services continue to receive an internal `userId` and remain independent of Better Auth.

### Server/client boundary

- Create one server-side Better Auth instance and expose it through a Next.js App Router catch-all route.
- Use the client helper only for interactive sign-up, sign-in, sign-out, and session UI.
- Resolve the current user on the server from request headers/session.
- Never accept a user ID from form data, query parameters, client state, or action arguments as the acting identity.
- Keep `FavoriteService` and `CollectionService` independent of Better Auth.

### Security defaults

- Require a high-entropy `AUTH_SECRET` in every deployed environment.
- Configure the canonical application base URL and explicit trusted origins.
- Keep secure, HTTP-only session cookies and Better Auth's CSRF/origin protections enabled.
- Keep bounded rate limits for authentication endpoints.
- Use generic sign-in errors and safe same-origin callback URLs.
- Enforce ownership in services/repositories; client-provided IDs must never determine the acting user.
- Because email ownership is not verified, the product must not treat the email address as a verified contact channel or use it for sensitive recovery flows.

## Consequences

### Positive

- No email provider, SMTP credentials, mail-catcher, verification templates, or email-delivery operations are needed for MVP authentication.
- Users can create an account and immediately use their personal library.
- Avoids maintaining custom password hashing, session issuance, and cookie handling.
- Preserves application-service independence from the authentication provider.

### Trade-offs

- Users can register with an email address they do not control.
- There is no automated password recovery in this increment; users who forget their password may lose access until a separately designed recovery flow exists.
- Adds Better Auth and its Prisma adapter as dependencies.
- Better Auth schema changes and upgrades must be reviewed and tested.

## Data migration and legacy workspace handling

The existing shared workspace identity and its favorites/collections must not be assigned automatically to the first account that signs up. Before applying the authentication migration to an environment containing workspace data, take a backup, inventory rows owned by the workspace identity, and explicitly decide whether they remain quarantined, are disposable, or are assigned through a controlled migration. No silent transfer is permitted.

## References

- Better Auth Prisma adapter documentation: https://better-auth.com/docs/adapters/prisma
- Better Auth email/password documentation: https://better-auth.com/docs/authentication/email-password
- Better Auth security documentation: https://better-auth.com/docs/reference/security
- Prisma guide for Better Auth + Next.js + Prisma 7: https://www.prisma.io/docs/guides/authentication/better-auth/nextjs
