# 14 — Authentication implementation

**Status:** Better Auth integration is implemented. The local environment has successfully generated Prisma Client, applied the database migration, and completed sign-up/sign-in. The latest navigation and form UX refinements are included in this revision; run the full local validation suite before release.

## Implemented

- Better Auth email/password authentication using the existing Prisma 7 client and PostgreSQL.
- Email verification is disabled; sign-up establishes a session immediately.
- No SMTP transport, email sender, verification template, or email confirmation page.
- Sign-up and sign-in pages, sign-out control, and session-aware header navigation. Anonymous visitors do not see Library or Collections links; authenticated visitors do not see Sign in or Sign up.
- Better Auth API route at `/api/auth/*`.
- Server-side `getOptionalCurrentUser()` and `requireCurrentUser()` adapters.
- Public artist and album pages remain accessible anonymously; personal actions are shown only to authenticated users.
- Library and collection pages plus favorite/collection server actions derive the user from the server session. Protected pages preserve their requested path in the sign-in `callbackURL`.
- The shared `local-library` runtime resolver was removed.
- Existing legacy workspace data remains unassigned; it is not transferred to the first registrant.

## Required setup

1. Run `npm install` to refresh the lockfile and install dependencies.
2. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (at least 32 random characters), `APP_URL`, and `AUTH_TRUSTED_ORIGINS`.
3. Apply the migration with `npm run db:deploy` (or `npm run db:migrate` locally), then run `npm run db:generate`.
4. Start the app with `npm run dev`. No email service is required.

## Migration note

The Better Auth migration preserves the existing workspace row and its foreign keys. Do not attach that row to a new registrant automatically. If legacy data should belong to a specific person, perform a separately reviewed ownership migration.

## Verification checklist

1. Run Prisma schema validation and generate the Prisma Client.
2. Apply the migration to a database with existing catalog and personal-library data.
3. Confirm the legacy user row, favorites, and collections remain intact.
4. Register a new account and confirm the session is created immediately without sending an email.
5. Sign out and sign in again with the new account.
6. Confirm anonymous visitors can browse artist and album pages.
7. Confirm anonymous visitors are redirected from `/library` and `/collections`, then returned to the originally requested page after sign-in.
8. Create two users and verify favorites and collections cannot be read or modified across users.
9. Run lint, typecheck, unit tests, and a production build.

## Known follow-up work

- Add automated integration and browser tests for the checklist above.
- Validate the hand-authored Better Auth Prisma models against the installed Better Auth CLI output before production migration.
- Configure shared rate-limit storage or gateway-level limits before multi-instance production deployment.
- Evaluate password recovery, account deletion, and email change only when product requirements call for them.
