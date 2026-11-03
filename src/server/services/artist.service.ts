import "server-only";

import { z } from "zod";

import type { Artist } from "@/server/domain/artist";
import type { ArtistRepository } from "@/server/repositories/artist.repository";

import { PrismaArtistRepository } from "@/server/repositories/prisma-artist.repository";
import { MusicBrainzArtistProvider } from "@/server/providers/musicbrainz/artist.provider";

const musicBrainzIdSchema = z.string().uuid();

export class ArtistService {
  constructor(
    private readonly repository: ArtistRepository,
    private readonly provider: MusicBrainzArtistProvider,
  ) {}

  async searchArtists(
    query: string,
    options?: {
      limit?: number;
      offset?: number;
    },
  ) {
    return this.provider.searchArtists(query, options);
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

export const artistService = new ArtistService(
  new PrismaArtistRepository(),
  new MusicBrainzArtistProvider(),
);
