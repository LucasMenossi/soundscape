# 06 — Artwork and Image Sources

## Product decision

SoundScape is a portfolio and learning project. The visual experience prioritizes recognizable artist photos and actual album front covers over broad search results. Provider selection is based on canonical MusicBrainz identifiers, not fuzzy filename matching. This implementation is intended for portfolio/demo use; review provider terms and image-use permissions before commercial or high-traffic deployment.

## Providers

| Entity | Provider | Lookup key | Selection |
|---|---|---|---|
| Artist / band | TheAudioDB | MusicBrainz artist MBID | `strArtistThumb`, then fanart fallback |
| Album | Cover Art Archive | MusicBrainz release-group MBID | `front=true`, preferring 500px thumbnail |

Wikimedia Commons is no longer part of automatic artwork selection. Its generic file search returned visually unrelated artist imagery and almost no useful album covers.

## Fallback behavior

When a provider has no image, returns an invalid URL, or is unavailable, the UI uses the original deterministic SoundScape SVG/CSS artwork. Provider failure must never prevent artist or album pages from rendering.

## Caching

Successful and empty lookups are cached for seven days in the database. A migration resets existing artwork search timestamps so that entities previously searched through the old Commons strategy are refreshed by the new providers.

## Notes

This provider setup is intended for a portfolio project and development demonstration. Before turning SoundScape into a commercial or high-traffic public service, review the providers' current terms, attribution requirements, hotlinking rules, and image-use permissions.
