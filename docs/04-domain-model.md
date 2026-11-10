# 04 — Domain Model

## Catalog identity

- `Artist` is internally identified by a database ID and externally mapped to a unique MusicBrainz artist MBID.
- `Album` represents a MusicBrainz release group and is mapped to a unique release-group MBID.
- Artist names and album titles are not unique identifiers.

## Genre versus community tag

These concepts must remain separate:

### Genre

- A `Genre` is part of the curated SoundScape vocabulary.
- MusicBrainz `inc=genres` values are mapped through the SoundScape canonicalization/alias table.
- Only canonical SoundScape genres are persisted in `Genre`, `ArtistGenre`, and `AlbumGenre`.
- Genres are navigable through `/genres` and `/genres/[slug]`.

### Tag

- A `Tag` is a free-form community-supplied MusicBrainz label returned by `inc=tags`.
- Tags are fetched through the dedicated `MusicBrainzTagProvider` and displayed as contextual labels.
- Tags are not persisted as `Genre`, do not create genre routes, and must not be used to pollute the curated genre vocabulary.
- Examples include `1990s`, `seen live`, and `female vocalists`.
- Current implementation fetches tags on artist/album page requests and relies on the provider HTTP cache. Persistent tag storage is intentionally not part of this slice.

## Artist relationships

`ArtistRelationship` stores directed catalog relationships from MusicBrainz `artist-rels`, linked to canonical local Artist records. The artist detail page groups these explicit catalog facts by relationship type and links to the related artist. They are not similarity scores or recommendations. Successful synchronization is cached in-process for 24 hours; persisted edges remain available when the provider is unavailable.

## Artwork assets

`ArtworkAsset` stores third-party artwork provenance for exactly one catalog entity (`artistId` or `albumId`). It preserves source provider/file identity, source page, image URL, description, creator, credit, license metadata, dimensions, automatic relevance score, and selection reason.

- `PENDING` is the default for candidates not selected for public display.
- `AUTO_APPROVED` means the provider returned an image associated with the canonical MusicBrainz identifier. It is not a claim of human review.
- `CLEARED` is retained for legacy explicitly reviewed records.
- `REJECTED` records a candidate that must not be displayed.
- Public display is centralized in the server-side resolver, which validates status and HTTPS source/image URLs.
- Artist and album searches are cached for seven days, including successful searches with no qualifying result.
- Artist images are resolved through TheAudioDB by MusicBrainz artist MBID. Album front covers are resolved through Cover Art Archive by release-group MBID. Wikimedia Commons filename matching is disabled due to poor visual relevance.
- No manual image-review workflow is required for the MVP.

See [Artwork Enablement](18-artwork-enablement.md) and [ADR 0006](adr/0006-automatic-rights-constrained-artwork.md).

## Personal curation

`User`, `Favorite`, `Collection`, and `CollectionItem` support authenticated personal curation. Ownership is scoped to the authenticated user and enforced at application service/repository boundaries. Collections can contain artists and albums, with database uniqueness constraints preventing duplicate catalog entries within one collection.
