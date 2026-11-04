import "server-only";

import { z } from "zod";
import type { GenreRepository } from "@/server/repositories/genre.repository";
import type { MusicBrainzGenreProvider } from "@/server/providers/musicbrainz/genre.provider";
import { canonicalizeGenres } from "@/server/domain/genre-taxonomy";

const idSchema = z.string().uuid();
const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const GENRE_CATALOG_TTL_MS = 24 * 60 * 60 * 1000;

export class GenreService {
  private catalogSyncedAt = 0;
  private catalogSyncPromise: Promise<void> | null = null;

  constructor(
    private readonly repository: GenreRepository,
    private readonly provider: MusicBrainzGenreProvider,
    private readonly catalogTtlMs = GENRE_CATALOG_TTL_MS,
  ) {}

  async syncGenreCatalog(force = false): Promise<void> {
    if (!force && Date.now() - this.catalogSyncedAt < this.catalogTtlMs) return;
    if (this.catalogSyncPromise) return this.catalogSyncPromise;

    const syncPromise = (async () => {
      const genres = canonicalizeGenres(await this.provider.getAllGenres());
      if (genres.length === 0) {
        throw new Error("MusicBrainz returned an empty genre catalog");
      }
      await this.repository.syncGenreCatalog(genres);
      this.catalogSyncedAt = Date.now();
    })().finally(() => {
      this.catalogSyncPromise = null;
    });

    this.catalogSyncPromise = syncPromise;
    return syncPromise;
  }

  async syncArtistGenres(
    artistId: string,
    musicBrainzArtistId: string,
  ): Promise<void> {
    idSchema.parse(musicBrainzArtistId);
    const genres = canonicalizeGenres(
      await this.provider.getArtistGenres(musicBrainzArtistId),
    );
    await this.repository.syncArtistGenres(artistId, genres);
  }

  async syncAlbumGenres(
    albumId: string,
    musicBrainzReleaseGroupId: string,
  ): Promise<void> {
    idSchema.parse(musicBrainzReleaseGroupId);
    const genres = canonicalizeGenres(
      await this.provider.getReleaseGroupGenres(musicBrainzReleaseGroupId),
    );
    await this.repository.syncAlbumGenres(albumId, genres);
  }

  getArtistGenres(artistId: string) {
    return this.repository.getArtistGenres(artistId);
  }
  getAlbumGenres(albumId: string) {
    return this.repository.getAlbumGenres(albumId);
  }

  async listGenres() {
    try {
      await this.syncGenreCatalog();
    } catch {
      // Keep serving the last successfully synchronized catalog during provider outages.
    }
    return this.repository.listGenres();
  }

  async getGenreBySlug(slug: string) {
    try {
      await this.syncGenreCatalog();
    } catch {
      // A previously synchronized catalog remains usable during provider outages.
    }
    return this.repository.findBySlug(slugSchema.parse(slug));
  }
}
