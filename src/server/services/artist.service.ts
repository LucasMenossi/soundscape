import "server-only";

import { z } from "zod";

import type { Artist } from "@/server/domain/artist";
import type { ArtistRepository } from "@/server/repositories/artist.repository";
import type { ArtistCatalogProvider } from "@/server/providers/musicbrainz/artist-catalog.provider";

const musicBrainzIdSchema = z.string().uuid();

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
