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

The existing `ArtistRelationship` model and repository implementation are retained, but relationship synchronization and UI presentation are deferred. Artist detail pages do not request MusicBrainz `artist-rels`. If reintroduced, relationship labels must preserve source-relative direction and must not be presented as similarity recommendations.

## Personal curation

`User`, favorites, collections, and collection items remain planned for Phase 3. Their ownership and uniqueness constraints must be enforced at the database and service/repository boundaries.
