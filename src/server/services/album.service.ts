import "server-only";

import type { Album, AlbumWithPrimaryArtist } from "@/server/domain/album";
import type {
  AlbumReleaseDetails,
  AlbumReleaseEdition,
} from "@/server/domain/album-release";
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
    const syncedReleaseGroupIds =
      await this.syncArtistDiscography(musicBrainzArtistId);
    const persistedAlbums =
      await this.repository.findByPrimaryArtistId(artistId);

    return persistedAlbums.filter((album) =>
      syncedReleaseGroupIds.has(album.musicBrainzReleaseGroupId),
    );
  }

  async getAlbumsByArtistPage(
    artistId: string,
    musicBrainzArtistId: string,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<{
    albums: AlbumWithPrimaryArtist[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const pageSize = Math.min(Math.max(options.pageSize ?? 12, 1), 50);
    const page = Math.max(options.page ?? 1, 1);
    const syncedReleaseGroupIds =
      await this.syncArtistDiscography(musicBrainzArtistId);
    const ids = [...syncedReleaseGroupIds];
    const start = (page - 1) * pageSize;
    const albums = await this.repository.findByPrimaryArtistIdPage(
      artistId,
      ids,
      { skip: start, take: pageSize },
    );

    return {
      albums,
      total: ids.length,
      page,
      pageSize,
    };
  }

  private async syncArtistDiscography(
    musicBrainzArtistId: string,
  ): Promise<Set<string>> {
    const validatedMusicBrainzArtistId =
      musicBrainzArtistIdSchema.parse(musicBrainzArtistId);
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

    // Only include release groups returned by the current provider response.
    // Older syncs may have persisted singles, compilations or live releases.
    return new Set(
      syncedAlbums.map((album) => album.musicBrainzReleaseGroupId),
    );
  }

  async getAlbumReleaseOverview(albumId: string): Promise<{
    releases: AlbumReleaseEdition[];
    selectedRelease: AlbumReleaseDetails | null;
  } | null> {
    const album = await this.repository.findById(albumId);
    if (!album) return null;

    const releases = await this.provider.getAlbumReleases(
      album.musicBrainzReleaseGroupId,
    );
    const initialRelease = releases[0];

    if (!initialRelease) {
      return { releases, selectedRelease: null };
    }

    let selectedRelease: AlbumReleaseDetails | null = null;
    try {
      selectedRelease = await this.provider.getReleaseDetails(
        initialRelease.id,
      );
    } catch (error) {
      // Keep edition metadata available even if the selected release's
      // recordings endpoint is temporarily unavailable.
      console.error("[SoundScape] Failed to load initial release tracklist", {
        albumId,
        releaseId: initialRelease.id,
        error,
      });
    }

    return { releases, selectedRelease };
  }

  async getAlbumReleaseDetails(
    albumId: string,
    releaseId: string,
  ): Promise<AlbumReleaseDetails | null> {
    const album = await this.repository.findById(albumId);
    if (!album) return null;

    const releases = await this.provider.getAlbumReleases(
      album.musicBrainzReleaseGroupId,
    );
    const belongsToAlbum = releases.some((release) => release.id === releaseId);

    if (!belongsToAlbum) return null;

    return this.provider.getReleaseDetails(releaseId);
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
