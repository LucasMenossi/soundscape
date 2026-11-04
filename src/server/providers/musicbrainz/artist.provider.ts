import "server-only";

import type {
  ArtistCatalogData,
  ArtistRelationshipCatalogData,
} from "@/server/domain/artist";

import type {
  ArtistCatalogProvider,
  ArtistCatalogSearchOptions,
  ArtistCatalogSearchResponse,
} from "./artist-catalog.provider";

import { MusicBrainzError, musicBrainzGet } from "./client";
import {
  musicBrainzArtistSchema,
  musicBrainzArtistSearchSchema,
  musicBrainzArtistRelationshipsResponseSchema,
} from "./artist.schemas";

import {
  mapMusicBrainzArtist,
  mapMusicBrainzArtistSearchResult,
  mapMusicBrainzArtistRelationships,
} from "./artist.mapper";

export class MusicBrainzArtistProvider implements ArtistCatalogProvider {
  async searchArtists(
    query: string,
    options: ArtistCatalogSearchOptions = {},
  ): Promise<ArtistCatalogSearchResponse> {
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

  async getArtistRelationships(
    musicBrainzId: string,
  ): Promise<ArtistRelationshipCatalogData[]> {
    const response = await musicBrainzGet<unknown>(`artist/${musicBrainzId}`, {
      inc: "artist-rels",
    });
    const parsed =
      musicBrainzArtistRelationshipsResponseSchema.safeParse(response);

    if (!parsed.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid artist relationships response",
        undefined,
        { cause: parsed.error },
      );
    }

    return mapMusicBrainzArtistRelationships(
      parsed.data.relations,
      musicBrainzId,
    );
  }
}
