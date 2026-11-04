import "server-only";

import { MusicBrainzError, musicBrainzGet } from "./client";

import { musicBrainzReleaseGroupSearchSchema } from "./album.schemas";

import {
  mapMusicBrainzReleaseGroupSearchResult,
  type AlbumSearchResult,
} from "./album.mapper";

export interface AlbumSearchResponse {
  count: number;
  offset: number;
  results: AlbumSearchResult[];
}

export interface AlbumSearchOptions {
  limit?: number;
  offset?: number;
}

export class MusicBrainzAlbumProvider {
  async searchAlbums(
    query: string,
    options: AlbumSearchOptions = {},
  ): Promise<AlbumSearchResponse> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("Album search query cannot be empty");
    }

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const response = await musicBrainzGet<unknown>("release-group", {
      query: normalizedQuery,
      limit: String(limit),
      offset: String(offset),
    });

    const parsedResponse =
      musicBrainzReleaseGroupSearchSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new MusicBrainzError(
        "MusicBrainz returned an invalid release group search response",
        undefined,
        { cause: parsedResponse.error },
      );
    }

    const results = parsedResponse.data["release-groups"]
      .map(mapMusicBrainzReleaseGroupSearchResult)
      .filter((result): result is AlbumSearchResult => result !== null);

    return {
      count: parsedResponse.data.count,
      offset: parsedResponse.data.offset,
      results,
    };
  }
}
