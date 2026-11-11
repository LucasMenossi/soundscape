# Button semantics and error-boundary logging fix

## Changes

- Replaced Base UI `Button` instances that rendered Next.js `Link` elements with semantic `Link` elements styled using the shared `buttonVariants` class utility.
- Kept the retry control as a real button because it performs an action (`reset`).
- Ignored Next.js' `NEXT_DEVTOOLS_SIMULATED_ERROR` sentinel in the route-error diagnostic logger. This sentinel is used when intentionally testing error boundaries in development; it is not an application failure.
- Prevented duplicate logging of the same error object when React Strict Mode re-runs effects in development.

## Files

- `src/components/feedback/route-error.tsx`
- `src/app/not-found.tsx`

## Validation

Source-level changes were inspected. Run the project's lint, typecheck, tests, and build locally to validate against the installed dependency versions.
