import "server-only";

import { MusicBrainzError, musicBrainzGet } from "./client";

import {
  musicBrainzReleaseGroupBrowseSchema,
  musicBrainzReleaseGroupSearchSchema,
} from "./album.schemas";

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
  async searchAlbumsByArtist(
    musicBrainzArtistId: string,
    options: AlbumCatalogSearchOptions = {},
  ): Promise<AlbumCatalogSearchResponse> {
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 100);
    let offset = Math.max(options.offset ?? 0, 0);
    const results: AlbumSearchResult[] = [];
    let totalCount = 0;

    // Browse is the correct MusicBrainz operation for retrieving an artist's
    // linked release groups. Search queries can omit valid groups due to
    // indexing/ranking and are not suitable for complete discographies.
    do {
      const response = await musicBrainzGet<unknown>("release-group", {
        artist: musicBrainzArtistId,
        type: "album",
        "release-group-status": "website-default",
        inc: "artist-credits",
        limit: String(limit),
        offset: String(offset),
      });

      const parsedResponse =
        musicBrainzReleaseGroupBrowseSchema.safeParse(response);

      if (!parsedResponse.success) {
        throw new MusicBrainzError(
          "MusicBrainz returned an invalid artist discography response",
          undefined,
          { cause: parsedResponse.error },
        );
      }

      totalCount = parsedResponse.data["release-group-count"];

      results.push(
        ...parsedResponse.data["release-group"]
          .filter(
            (releaseGroup) =>
              releaseGroup["primary-type"] === "Album" &&
              (releaseGroup["secondary-types"]?.length ?? 0) === 0,
          )
          .map(mapMusicBrainzReleaseGroupSearchResult)
          .filter((result): result is AlbumSearchResult => result !== null),
      );

      const receivedCount = parsedResponse.data["release-group"].length;
      if (receivedCount === 0) break;

      offset += receivedCount;
    } while (offset < totalCount);

    return {
      count: results.length,
      offset: options.offset ?? 0,
      results,
    };
  }

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
