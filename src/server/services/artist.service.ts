import "server-only";

import { z } from "zod";

import type { Artist, ArtistRelationship } from "@/server/domain/artist";
import type { ArtistRepository } from "@/server/repositories/artist.repository";
import type { ArtistCatalogProvider } from "@/server/providers/musicbrainz/artist-catalog.provider";

const musicBrainzIdSchema = z.string().uuid();
const DEFAULT_RELATIONSHIPS_SYNC_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_RELATIONSHIP_SYNC_CACHE_ENTRIES = 1_000;

export interface PersistedArtistSearchResult {
  artist: Artist;
  score: number | null;
}

export interface PersistedArtistSearchResponse {
  count: number;
  offset: number;
  results: PersistedArtistSearchResult[];
}

export class ArtistService {
  private readonly relationshipsSyncedAt = new Map<string, number>();
  private readonly relationshipsSyncInFlight = new Map<string, Promise<void>>();

  constructor(
    private readonly repository: ArtistRepository,
    private readonly provider: ArtistCatalogProvider,
  ) {}

  async searchArtists(
    query: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<PersistedArtistSearchResponse> {
    const response = await this.provider.searchArtists(query, options);

    const results = await Promise.all(
      response.results.map(async ({ artist, score }) => ({
        artist: await this.repository.upsertFromCatalog(artist),
        score,
      })),
    );

    return {
      count: response.count,
      offset: response.offset,
      results,
    };
  }

  async getArtistById(id: string): Promise<Artist | null> {
    return this.repository.findById(id);
  }

  async syncArtistRelationships(
    artistId: string,
    musicBrainzId: string,
  ): Promise<void> {
    const validatedId = musicBrainzIdSchema.parse(musicBrainzId);
    const lastSyncedAt = this.relationshipsSyncedAt.get(artistId);

    if (
      lastSyncedAt !== undefined &&
      Date.now() - lastSyncedAt < DEFAULT_RELATIONSHIPS_SYNC_TTL_MS
    ) {
      return;
    }

    const existingSync = this.relationshipsSyncInFlight.get(artistId);
    if (existingSync) {
      await existingSync;
      return;
    }

    const syncPromise = (async () => {
      const relationships =
        await this.provider.getArtistRelationships(validatedId);
      await this.repository.syncRelationships(artistId, relationships);

      if (
        this.relationshipsSyncedAt.size >= MAX_RELATIONSHIP_SYNC_CACHE_ENTRIES
      ) {
        const oldestArtistId = this.relationshipsSyncedAt.keys().next().value;
        if (oldestArtistId) this.relationshipsSyncedAt.delete(oldestArtistId);
      }

      this.relationshipsSyncedAt.set(artistId, Date.now());
    })();

    this.relationshipsSyncInFlight.set(artistId, syncPromise);

    try {
      await syncPromise;
    } finally {
      this.relationshipsSyncInFlight.delete(artistId);
    }
  }

  getArtistRelationships(artistId: string): Promise<ArtistRelationship[]> {
    return this.repository.findRelationshipsBySourceArtistId(artistId);
  }

  async getArtist(musicBrainzId: string): Promise<Artist | null> {
    const validatedMusicBrainzId = musicBrainzIdSchema.parse(musicBrainzId);

    const existingArtist = await this.repository.findByMusicBrainzId(
      validatedMusicBrainzId,
    );

    if (existingArtist) {
      return existingArtist;
    }

    const catalogArtist = await this.provider.getArtist(validatedMusicBrainzId);

    if (!catalogArtist) {
      return null;
    }

    return this.repository.upsertFromCatalog(catalogArtist);
  }
}
