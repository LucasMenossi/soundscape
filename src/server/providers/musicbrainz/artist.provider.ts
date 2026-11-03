import "server-only";

import type { ArtistCatalogData } from "@/server/domain/artist";

import { MusicBrainzError, musicBrainzGet } from "./client";
import {
  musicBrainzArtistSchema,
  musicBrainzArtistSearchSchema,
} from "./artist.schemas";
import {
  mapMusicBrainzArtist,
  mapMusicBrainzArtistSearchResult,
  type ArtistSearchResult,
} from "./artist.mapper";

export interface ArtistSearchResponse {
  count: number;
  offset: number;
  results: ArtistSearchResult[];
}

export interface ArtistSearchOptions {
  limit?: number;
  offset?: number;
}

export class MusicBrainzArtistProvider {
  async searchArtists(
    query: string,
    options: ArtistSearchOptions = {},
  ): Promise<ArtistSearchResponse> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("Artist search query cannot be empty");
    }

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);

    const offset = Math.max(options.offset ?? 0, 0);

    const response = await musicBrainzGet<unknown>("artist", {
      query: normalizedQuery,
      limit: String(limit),
      offset: String(offset),
    });

    const parsedResponse = musicBrainzArtistSearchSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid artist search response",
        undefined,
        { cause: parsedResponse.error },
      );
    }

    return {
      count: parsedResponse.data.count,
      offset: parsedResponse.data.offset,
      results: parsedResponse.data.artists.map(
        mapMusicBrainzArtistSearchResult,
      ),
    };
  }

  async getArtist(musicBrainzId: string): Promise<ArtistCatalogData | null> {
    let response: unknown;

    try {
      response = await musicBrainzGet<unknown>(`artist/${musicBrainzId}`, {});
    } catch (error) {
      if (error instanceof MusicBrainzError && error.status === 404) {
        return null;
      }

      throw error;
    }

    const parsedArtist = musicBrainzArtistSchema.safeParse(response);

    if (!parsedArtist.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid artist response",
        undefined,
        { cause: parsedArtist.error },
      );
    }

    return mapMusicBrainzArtist(parsedArtist.data);
  }
}
