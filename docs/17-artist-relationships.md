# 17 — Artist Relationships

## Purpose

Expose explicit artist-to-artist relationships recorded by MusicBrainz. This is catalog context and navigation, not a recommendation or similarity system.

## Data flow

1. The artist detail route requests MusicBrainz `artist/{mbid}?inc=artist-rels` through `MusicBrainzArtistProvider`.
2. Zod validates the upstream response and the mapper keeps supported relationship types.
3. `ArtistService` applies an in-process 24-hour refresh window before requesting synchronization again.
4. `PrismaArtistRepository` upserts target artists and replaces the MusicBrainz relationship edges for the source artist in a transaction.
5. The route reads persisted relationships and renders groups with internal `/artists/{id}` links.

If synchronization fails, the page logs the failure and continues using relationships already persisted in the database. If there are no persisted relationships, the section is omitted.

## Presentation

Relationships are grouped by normalized relationship type (band membership, membership in a band, collaboration, supporting artist, supported artist, subgroup, former name, and fallback relationship categories). Artists are sorted alphabetically within each group and duplicate artist links are suppressed within a group.

## Cache behavior

The service instance keeps a process-local 24-hour successful-sync timestamp per source artist. The MusicBrainz HTTP client separately caches successful provider responses. A process restart clears the in-memory sync timestamps; persisted relationship rows remain available and are refreshed on the next artist page visit.

## Scope boundaries

- No similarity scoring or algorithmic recommendations.
- No inference of relationships from shared genres, tags, or albums.
- Only relationship types explicitly supported by the mapper are persisted.
- Missing relationship data does not make the artist page unavailable.
