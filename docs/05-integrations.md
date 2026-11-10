# 05 — External Integrations

## 1. MusicBrainz — primary catalog

**Role:** canonical discovery catalog and identity source for artists and release groups.

Use for:
- Artist search and MBID resolution.
- Release-group/album search and MBID resolution.
- Artist discography and release-group relationships where available.
- Artist relationships and tags/genres where available.

Implementation requirements:
- Use a descriptive, identifiable `User-Agent` with application name, version, and contact URL/email.
- Respect MusicBrainz rate limits; the PoC uses 1.1 seconds between requests as a conservative process-level pace.
- Add bounded retries for transient statuses and network failures; honor `Retry-After`.
- Cache successful responses and avoid caching failed responses as valid data.
- Normalize external data into SoundScape domain types before returning it to application services.
- Treat scores/search ordering as candidate ranking, not proof of exact identity. Verify MBID and normalized artist/title match before associating results.

## 2. TheAudioDB — artist imagery

**Role:** artist and band image source.

- Query `artist-mb.php` using the canonical MusicBrainz artist MBID.
- Prefer `strArtistThumb`; use artist fanart fields as a fallback.
- The provider is optional enrichment; missing results must fall back to original SoundScape artwork.
- `THEAUDIODB_API_KEY` is optional and defaults to the public test key `2`.

## 3. Cover Art Archive — album artwork

**Role:** album front-cover source.

- Query the release-group endpoint using the canonical MusicBrainz release-group MBID.
- Select an image marked `front`; prefer the 500px thumbnail.
- Do not use fuzzy title/artist filename searches to identify album covers.
- Missing images and provider failures fall back to original SoundScape artwork.

## 4. Wikimedia Commons — disabled for automatic artwork

The initial Commons filename-search implementation returned visually unrelated artist imagery and almost no useful album covers. It is not used for automatic artist or album selection. The provider code is retained only if a future implementation adds a better discovery and validation strategy.

## 5. Provider interfaces

Define domain-facing interfaces similar to:

```ts
interface MusicCatalogProvider {
  searchArtists(query: string): Promise<ArtistSearchResult[]>;
  getArtist(musicBrainzId: string): Promise<Artist | null>;
  searchAlbums(query: string): Promise<AlbumSearchResult[]>;
  getAlbum(releaseGroupId: string): Promise<Album | null>;
  getArtistDiscography(artistId: string, options?: PaginationOptions): Promise<Paginated<Album>>;
  getArtistRelationships(artistId: string): Promise<ArtistRelationship[]>;
}

interface ArtistImageProvider {
  findArtistImages(artistId: string): Promise<ArtworkCandidate[]>;
}

interface AlbumArtworkProvider {
  findAlbumArtwork(releaseGroupId: string): Promise<ArtworkCandidate[]>;
}
```

These are conceptual contracts. Final method signatures should follow actual endpoint needs and normalized domain types.

## 6. Resilience and observability

- Configure timeout, per-provider rate limit, retry count, retryable statuses, and cache TTL independently.
- Retry `408`, `429`, `500`, `502`, `503`, `504` and transient network errors with bounded exponential backoff and jitter.
- Honor `Retry-After` when present.
- Do not let one optional provider failure prevent an artist or album page from rendering.
- Record provider latency, result count, cache hit/miss, retry count, and final status.
- Add provider contract tests with fixtures so API changes are caught without relying on live services for every test run.


### Cover Art Archive URL handling

Cover Art Archive JSON metadata may return image and thumbnail URLs with an
`http://` scheme. The provider normalizes URLs to HTTPS only for the known
`coverartarchive.org` and `archive.org` hosts before returning them to the UI.
Those hosts are explicitly allowlisted in `next.config.ts`. When this behavior
changes, album artwork search timestamps are reset so previously empty results
are retried.

### Artist discography artwork

The artist detail page resolves album artwork through the same `ArtworkService`
used by album detail pages. It reuses persisted automatic selections and the
provider search TTL, so the artist page does not maintain a separate artwork
catalog. If an album has no displayable cover (or its provider lookup fails),
the discography card keeps the SoundScape disc fallback.
