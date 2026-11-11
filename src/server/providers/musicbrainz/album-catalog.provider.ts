import type { AlbumCatalogData } from "@/server/domain/album";
import type {
  AlbumReleaseDetails,
  AlbumReleaseEdition,
} from "@/server/domain/album-release";

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

  searchAlbumsByArtist(
    musicBrainzArtistId: string,
    options?: AlbumCatalogSearchOptions,
  ): Promise<AlbumCatalogSearchResponse>;

  getAlbumReleases(
    musicBrainzReleaseGroupId: string,
  ): Promise<AlbumReleaseEdition[]>;

  getReleaseDetails(musicBrainzReleaseId: string): Promise<AlbumReleaseDetails>;
}
