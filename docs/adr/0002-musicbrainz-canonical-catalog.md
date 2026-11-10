# ADR 0002 — Use MusicBrainz as the Canonical Catalog Identity

- Status: Accepted
- Date: 2026-11-03

## Context

The image PoC found all five test artists and all ten test albums in MusicBrainz. The product needs stable identity beyond display names.

## Decision

Use MusicBrainz artist MBIDs and release-group MBIDs as canonical external identifiers. Normalize provider responses into SoundScape domain entities.

## Consequences

- Internal database IDs remain stable for application routes and relations.
- Provider MBIDs are unique external keys.
- Search matches must be validated; a high search score alone is insufficient.
- Provider rate limits, cache, and outages must be handled centrally.
