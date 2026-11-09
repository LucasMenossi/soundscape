# 16 — npm peer dependency resolution

## Problem

The project previously used `vitest@3.2.7`. Its Vite compatibility range ends at Vite 7. Better Auth (`better-auth@1.7.18`) declares SvelteKit as an optional peer dependency. npm resolves the latest compatible SvelteKit major (`@sveltejs/kit@3.1.1`), which requires Vite 8. This produced an `ERESOLVE` conflict between Vite 8 and Vitest 3's Vite 7 peer range.

SoundScape is a Next.js application and does not use SvelteKit directly. However, npm still considers Better Auth's optional peer dependency during dependency-tree resolution.

## Decision

Align the test toolchain with the Vite version required by the optional SvelteKit peer:

- `vitest`: `^4.1.11`
- `vite`: `^8.3.6` as an explicit development dependency
- Node.js: `^20.19.0 || >=22.12.0`

Vitest 4.1 added Vite 8 support. Declaring Vite directly also makes the Vite version used by Vitest explicit instead of relying on a transitive dependency.

No `--legacy-peer-deps`, `--force`, npm override, SvelteKit application integration, or dependency metadata patch is required.

## Installation

The package manifest has been updated. Regenerate the lockfile once from the project root:

```bash
npm install
```

Then verify the resolved versions:

```bash
npm ls vitest vite @sveltejs/kit
```

Expected major versions:

- Vitest 4
- Vite 8
- SvelteKit 3 may appear as an optional peer selected by npm; SoundScape does not import or configure it.

Run the project checks:

```bash
npm run typecheck
npm run test
npm run build
```

Commit the regenerated `package-lock.json` together with `package.json`. Future clean installs can use:

```bash
npm ci
```

## Notes

- The existing `vitest.config.ts` uses standard APIs retained by Vitest 4; no config migration was needed from static inspection.
- The current test suite does not configure coverage providers or custom Vitest reporters, so the main documented Vitest 4 coverage migration does not appear applicable.
- The upgrade has not been executed in this environment because npm registry access is unavailable. Treat the clean install and test/build commands above as required verification before merging.
