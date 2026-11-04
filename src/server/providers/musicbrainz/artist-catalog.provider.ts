import type { ArtistCatalogData } from "@/server/domain/artist";

export interface ArtistCatalogSearchOptions {
  limit?: number;
  offset?: number;
}

export interface ArtistCatalogSearchResult {
  artist: ArtistCatalogData;
  score: number | null;
}

export interface ArtistCatalogSearchResponse {
  count: number;
  offset: number;
  results: ArtistCatalogSearchResult[];
}

export interface ArtistCatalogProvider {
  searchArtists(
    query: string,
    options?: ArtistCatalogSearchOptions,
  ): Promise<ArtistCatalogSearchResponse>;

  getArtist(musicBrainzId: string): Promise<ArtistCatalogData | null>;
}
