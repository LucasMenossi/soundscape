# 21 — Album release editions and tracklists

## Goal

Complete the album detail journey by distinguishing the canonical album (MusicBrainz Release Group) from its concrete release editions (MusicBrainz Releases).

## What the page displays

- A selectable list of release editions belonging to the album's canonical release group.
- Release date, country, status, barcode, packaging, label, catalog number, and media formats when MusicBrainz provides them.
- A tracklist grouped by medium/disc, including track number, title, and duration when available.
- A loading state while a different edition is fetched, plus a retry action if track details are temporarily unavailable.
- Explicit empty states when the catalog has no release editions or track data.

## Data flow

1. `AlbumService` loads the persisted album and its MusicBrainz release-group MBID.
2. `MusicBrainzAlbumProvider.getAlbumReleases` looks up the release group with `inc=releases` and maps the returned edition summaries into domain types.
3. The earliest dated edition is selected as the initial edition. This is a deterministic default, not a claim that it is the most popular or definitive edition.
4. `MusicBrainzAlbumProvider.getReleaseDetails` looks up the selected release with `inc=recordings+labels` and maps media and tracks.
5. The client-side `AlbumReleaseExplorer` lets the user switch editions through `GET /api/albums/{albumId}/releases/{releaseId}`.
6. The API verifies that the requested release belongs to the requested album before returning its details.

## Persistence and caching

Release editions and tracklists are not duplicated into Prisma in this implementation. MusicBrainz remains the source of truth, and the existing provider HTTP cache reduces repeat requests. This avoids introducing a new persistence model before cache freshness and catalog update requirements are established.

## Data limitations

MusicBrainz data is community-maintained and may be incomplete. Country, barcode, label, catalog number, format, track duration, or even the tracklist itself may be missing. The UI omits unavailable metadata and provides explicit empty states instead of inventing values.

The release selector is limited to the first 100 editions returned after deterministic sorting. The earliest dated edition is used as the initial selection.

## Validation

- Provider tests cover release-edition mapping and tracklist mapping, including duration fallback from the recording when a track duration is absent.
- Service tests cover initial edition selection and reject release IDs that do not belong to the requested album.
- The catalog E2E journey checks that the album page exposes the release-editions and tracklist section.

No Prisma migration is required.
