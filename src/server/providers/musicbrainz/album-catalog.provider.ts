import type { AlbumCatalogData } from "@/server/domain/album";

export interface AlbumCatalogSearchOptions {
  limit?: number;
  offset?: number;
}

export interface AlbumCatalogSearchResult {
  album: AlbumCatalogData;
  score: number | null;
}

export interface AlbumCatalogSearchResponse {
  count: number;
  offset: number;
  results: AlbumCatalogSearchResult[];
}

export interface AlbumCatalogProvider {
  searchAlbums(
    query: string,
    options?: AlbumCatalogSearchOptions,
  ): Promise<AlbumCatalogSearchResponse>;
}
