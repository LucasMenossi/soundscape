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
import { z } from "zod";

const musicBrainzArtistIdSchema = z.string().uuid();

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

  async getAlbumsByArtist(
    artistId: string,
    musicBrainzArtistId: string,
  ): Promise<AlbumWithPrimaryArtist[]> {
    const validatedMusicBrainzArtistId = musicBrainzArtistIdSchema.parse(
      musicBrainzArtistId,
    );
    const response = await this.provider.searchAlbumsByArtist(
      validatedMusicBrainzArtistId,
      { limit: 100, offset: 0 },
    );

    const syncedAlbums = await Promise.all(
      response.results
        .filter(
          ({ album }) =>
            album.primaryArtist.musicBrainzId === validatedMusicBrainzArtistId,
        )
        .map(({ album }) => this.repository.upsertFromCatalog(album)),
    );

    const syncedReleaseGroupIds = new Set(
      syncedAlbums.map((album) => album.musicBrainzReleaseGroupId),
    );
    const persistedAlbums = await this.repository.findByPrimaryArtistId(artistId);

    // Older syncs may have persisted singles, compilations or live releases.
    // Only return records included in the current, filtered provider response.
    return persistedAlbums.filter((album) =>
      syncedReleaseGroupIds.has(album.musicBrainzReleaseGroupId),
    );
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
