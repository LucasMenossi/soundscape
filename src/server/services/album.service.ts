import "server-only";

import type {
  Album,
  AlbumWithPrimaryArtist,
} from "@/server/domain/album";
import type { AlbumRepository } from "@/server/repositories/album.repository";
import type {
  AlbumCatalogProvider,
  AlbumCatalogSearchOptions,
} from "@/server/providers/musicbrainz/album-catalog.provider";

export interface PersistedAlbumSearchResult {
  album: Album;
  primaryArtistName: string;
  score: number | null;
}

export interface PersistedAlbumSearchResponse {
  count: number;
  offset: number;
  results: PersistedAlbumSearchResult[];
}

export class AlbumService {
  constructor(
    private readonly repository: AlbumRepository,
    private readonly provider: AlbumCatalogProvider,
  ) {}

  async searchAlbums(
    query: string,
    options?: AlbumCatalogSearchOptions,
  ): Promise<PersistedAlbumSearchResponse> {
    const response = await this.provider.searchAlbums(query, options);

    const results = await Promise.all(
      response.results.map(async ({ album, score }) => ({
        album: await this.repository.upsertFromCatalog(album),
        primaryArtistName: album.primaryArtist.name,
        score,
      })),
    );

    return {
      count: response.count,
      offset: response.offset,
      results,
    };
  }

  async getAlbumById(id: string): Promise<Album | null> {
    return this.repository.findById(id);
  }

  async getAlbumWithPrimaryArtist(
    id: string,
  ): Promise<AlbumWithPrimaryArtist | null> {
    return this.repository.findByIdWithPrimaryArtist(id);
  }
}
