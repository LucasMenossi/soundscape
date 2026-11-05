# 13 — Authentication implementation plan

**Architecture decision:** [ADR 0005 — Better Auth, email and password, no email verification](adr/0005-authentication-strategy.md).

## Goal

Give every visitor a distinct account so favorites and collections are private to that account. Authentication must remain outside catalog-domain services.

## MVP decisions

- Better Auth with the existing PostgreSQL database and Prisma 7 adapter.
- Email/password sign-up and sign-in.
- Successful sign-up establishes a session immediately; no email confirmation is sent or required.
- No SMTP/email provider, password-reset email, OAuth, passkeys, or magic links.
- Server-side session resolution for protected pages and mutations.
- Public artist and album pages remain browseable anonymously.
- `/library`, `/collections`, collection detail, and personal mutations require an authenticated user.

## Implementation structure

- `src/lib/auth/auth.ts`: Better Auth server instance.
- `src/lib/auth/auth-client.ts`: browser client.
- `src/lib/auth/current-user.ts`: `getOptionalCurrentUser()` and `requireCurrentUser()`.
- `src/app/api/auth/[...all]/route.ts`: Better Auth route handler.
- `src/components/auth/auth-form.tsx`: sign-up and sign-in forms.

No email delivery module is required.

## Persistence

- Extend the existing `User` model; do not replace it.
- Add Better Auth `Session` and `Account` models and its `Verification` adapter model. The `Verification` table is retained for adapter compatibility/future auth features but is not part of the MVP sign-up flow.
- Preserve `Favorite.userId` and `Collection.userId` relations to `User.id`.
- Keep service methods accepting explicit `userId`; derive it from the server session in the page/action layer only.

## Call-site rules

### Public catalog pages

Artist and album detail pages use `getOptionalCurrentUser()`. Anonymous visitors can browse normally; authenticated users see personal actions.

### Personal pages and actions

Library and collection pages use `requireCurrentUser()` before reading user-scoped records. Every favorite and collection mutation calls `requireCurrentUser()` server-side. Never accept `userId` from form data, hidden fields, URL parameters, or client state.

### Legacy shared data

Remove the request-time `local-library` shared-user resolver. Preserve any legacy row and its data without assigning it to the first registrant. Any ownership transfer must be a separate, explicit migration.

## Security requirements

- High-entropy `AUTH_SECRET` (at least 32 characters).
- Canonical `APP_URL` and explicit `AUTH_TRUSTED_ORIGINS`.
- Keep Better Auth origin/CSRF protections enabled and use secure HTTP-only cookies in production.
- Rate-limit sign-up and sign-in.
- Use generic invalid-credential feedback and validate callback URLs as same-origin relative paths.
- Enforce resource ownership in application services/repositories.
- Do not treat the submitted email as verified. Do not use it for password recovery until a verified recovery mechanism is implemented.

## Acceptance criteria

1. A visitor can create an account with name, email, and password without receiving an email.
2. Successful sign-up establishes a session and routes the user to the requested safe destination.
3. A registered user can sign in and sign out.
4. Anonymous visitors can browse artist and album catalog pages.
5. Anonymous visitors are redirected from personal library and collection pages.
6. All personal server actions derive the acting user from the server session.
7. Two users cannot read, modify, or delete each other's favorites or collections.
8. Existing legacy workspace data is not silently transferred.

## Validation checklist

- Validate Prisma schema and generate the Prisma Client.
- Apply the migration to a database with existing catalog and library data.
- Test sign-up, immediate session creation, sign-in, and sign-out.
- Test anonymous access to catalog pages and protection of personal pages/actions.
- Test cross-user isolation with at least two accounts.
- Run lint, typecheck, unit tests, and production build.
