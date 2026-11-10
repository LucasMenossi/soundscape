# ADR 0006: Artwork providers keyed by MusicBrainz identifiers

- Status: Accepted
- Date: 2026-11-09

## Context

The Wikimedia Commons filename-search implementation produced visually poor artist results and did not reliably find album covers. Album title and artist-name text in a file name were not reliable evidence that the image was the correct cover.

## Decision

- Resolve artist/band images from TheAudioDB using the canonical MusicBrainz artist MBID. Prefer the artist thumbnail, then fanart.
- Resolve album front covers from Cover Art Archive using the MusicBrainz release-group MBID. Prefer the 500px front-cover thumbnail.
- Disable generic Wikimedia Commons filename search for automatic image selection.
- Keep the original SoundScape artwork as the fallback when a provider has no image or is unavailable.
- Cache successful and empty lookups for seven days; reset existing search timestamps when switching provider strategy.

## Consequences

The provider lookup is tied to catalog identity instead of fuzzy filename relevance. Artist and album pages are more likely to show the expected image. Provider coverage is not guaranteed, so the original SoundScape artwork remains necessary.
