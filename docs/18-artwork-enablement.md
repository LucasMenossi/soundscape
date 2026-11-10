# Artwork Provider Enablement

## Artist and band imagery

Artist pages resolve the MusicBrainz artist MBID and query TheAudioDB's `artist-mb.php` endpoint. The resolver prefers `strArtistThumb`; if absent, it falls back to available artist fanart fields. The provider is matched by MBID rather than a fuzzy artist-name search.

## Album covers

Album pages resolve the MusicBrainz release-group MBID and query Cover Art Archive's release-group endpoint. The resolver selects an image marked as the front cover and prefers the 500px thumbnail, then a larger thumbnail, then the original image. It does not use a generic Commons filename search.

## Caching and fallback

Successful and empty provider lookups are cached for seven days. The artwork cache-refresh migration clears timestamps created by the previous Wikimedia Commons implementation. Provider failures and missing images are non-fatal; the UI displays original SoundScape artwork.

## Configuration

`THEAUDIODB_API_KEY` is optional and defaults to TheAudioDB's public test key `2`. Configure a provider key if one is available. Cover Art Archive does not require an API key.

## Verification

The provider tests cover MBID lookup, artist-thumbnail preference, front-cover selection, missing-image responses, and artwork resolution. Run `npm run db:deploy`, `npm run db:generate`, `npm run typecheck`, `npm run test`, and `npm run build`.
