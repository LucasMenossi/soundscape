import "server-only";

import { MusicBrainzError, musicBrainzGet } from "./client";

import { musicBrainzReleaseGroupSearchSchema } from "./album.schemas";

import {
  mapMusicBrainzReleaseGroupSearchResult,
  type AlbumSearchResult,
} from "./album.mapper";
import type {
  AlbumCatalogProvider,
  AlbumCatalogSearchOptions,
  AlbumCatalogSearchResponse,
} from "./album-catalog.provider";

export class MusicBrainzAlbumProvider implements AlbumCatalogProvider {
  async searchAlbums(
    query: string,
    options: AlbumCatalogSearchOptions = {},
  ): Promise<AlbumCatalogSearchResponse> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("Album search query cannot be empty");
    }

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const escapedQuery = normalizedQuery
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
    const musicBrainzQuery = `releasegroup:"${escapedQuery}"`;

    const response = await musicBrainzGet<unknown>("release-group", {
      query: musicBrainzQuery,
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
