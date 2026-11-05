# 15 — Authentication-aware navigation and form UX

## Navigation behavior

The site header is session-aware:

- Anonymous visitors see public catalog navigation (`Genres`, `Explore catalog`) plus `Sign in` and `Sign up`.
- Anonymous visitors do not see `My library` or `Collections`.
- Authenticated visitors see `My library`, `Collections`, and `Sign out`.
- Authenticated visitors do not see `Sign in` or `Sign up`.
- At narrow viewport widths, navigation labels collapse to icons with accessible labels.

Hiding personal navigation is a presentation decision only. Server-side route protection remains authoritative.

## Protected route redirects

`requireCurrentUser(returnTo)` accepts an internal destination and redirects anonymous visitors to:

`/sign-in?callbackURL=<encoded returnTo>`

Protected pages pass their own path:

- `/library`
- `/collections`
- `/collections/[collectionId]`

After successful sign-in, the existing safe callback URL handling sends the visitor back to the requested destination. The default destination for personal mutations remains `/library`.

## Authentication form presentation

Sign-in and sign-up use the same visual structure:

- Card-based form container with consistent page width and padding.
- Labels are explicit block/grid children, avoiding the inline text-node spacing issue.
- A consistent gap separates each label from its input and each field from the next.
- Inputs include contextual placeholders and autocomplete attributes.
- Submission errors use a visible alert treatment.
- The submit button spans the form width and exposes the pending state.
- Sign-in and sign-up links remain available below the form.

## Validation

Run:

```bash
npm run typecheck
npm run test
npm run build
```

Also verify both anonymous and authenticated header states, protected-route callback preservation, and the sign-in/sign-up layouts at mobile and desktop widths.
