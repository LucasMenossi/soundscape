# ADR 0003 — Rights-Aware Artwork Resolution

- Status: Superseded for MVP operations by [ADR 0006](0006-automatic-rights-constrained-artwork.md)
- Date: 2026-11-03

## Context

The image PoC demonstrated useful artist-image discovery from Wikimedia Commons and album-art discovery from Cover Art Archive. Discovery and catalog approval do not independently establish reuse rights. The initial proposal required per-file human relevance and license review before public display.

## Original decision

All third-party artwork was treated as unknown until individually reviewed. Public pages could display only original SoundScape artwork or a third-party asset explicitly marked cleared with attribution metadata recorded. Artwork selection was centralized in a server-side resolver.

## Current decision

The MVP does not require per-image human review. Artist images are automatically selected from Wikimedia Commons only when the strict metadata-based license allowlist, attribution, quality, URL, and exact-title relevance checks pass. The system records `AUTO_APPROVED` distinctly from human `CLEARED`. Album covers from Cover Art Archive and TheAudioDB remain disabled because the project has not established a reuse basis. Original SoundScape artwork is the automatic fallback.

See ADR 0006 and `docs/06-artwork-and-image-policy.md` for the current policy.
