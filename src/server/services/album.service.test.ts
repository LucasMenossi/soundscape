import { describe, expect, it, vi } from "vitest";

import type { Album, AlbumCatalogData, AlbumWithPrimaryArtist } from "@/server/domain/album";
import type { AlbumRepository } from "@/server/repositories/album.repository";
import type { AlbumCatalogProvider } from "@/server/providers/musicbrainz/album-catalog.provider";

import { AlbumService } from "./album.service";

const catalogAlbum: AlbumCatalogData = {
  musicBrainzReleaseGroupId: "b1392450-e666-3926-a536-22c65f834433",
  title: "OK Computer",
  firstReleaseDate: "1997-05-21",
  albumType: "Album",
  primaryArtist: {
    musicBrainzId: "a74b1b7f-71a5-4011-9441-d0b5e4122711",
    name: "Radiohead",
    sortName: "Radiohead",
    disambiguation: null,
    countryCode: null,
    beginDate: null,
    endDate: null,
  },
};

const persistedAlbum: Album = {
  id: "album-internal-id",
  musicBrainzReleaseGroupId: catalogAlbum.musicBrainzReleaseGroupId,
  title: catalogAlbum.title,
  firstReleaseDate: catalogAlbum.firstReleaseDate,
  albumType: catalogAlbum.albumType,
  primaryArtistId: "artist-internal-id",
  lastSyncedAt: new Date("2026-11-04T12:00:00.000Z"),
  createdAt: new Date("2026-11-04T12:00:00.000Z"),
  updatedAt: new Date("2026-11-04T12:00:00.000Z"),
};

const persistedAlbumWithArtist: AlbumWithPrimaryArtist = {
  ...persistedAlbum,
  primaryArtist: {
    id: "artist-internal-id",
    musicBrainzId: catalogAlbum.primaryArtist.musicBrainzId,
    name: "Radiohead",
    sortName: "Radiohead",
    disambiguation: null,
    countryCode: "GB",
    beginDate: null,
    endDate: null,
    lastSyncedAt: null,
    createdAt: new Date("2026-11-04T12:00:00.000Z"),
    updatedAt: new Date("2026-11-04T12:00:00.000Z"),
  },
};

describe("AlbumService", () => {
  it("persists catalog search results and returns internal album IDs", async () => {
    const upsertFromCatalog = vi.fn().mockResolvedValue(persistedAlbum);

    const repository: AlbumRepository = {
      findById: vi.fn(),
      findByIdWithPrimaryArtist: vi.fn(),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog,
    };

    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn().mockResolvedValue({
        count: 1,
        offset: 0,
        results: [{ album: catalogAlbum, score: 100 }],
      }),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.searchAlbums("OK Computer");

    expect(provider.searchAlbums).toHaveBeenCalledWith("OK Computer", undefined);
    expect(upsertFromCatalog).toHaveBeenCalledWith(catalogAlbum);
    expect(result).toEqual({
      count: 1,
      offset: 0,
      results: [{ album: persistedAlbum, primaryArtistName: "Radiohead", score: 100 }],
    });
    expect(result.results[0].album.id).toBe("album-internal-id");
    expect(result.results[0].primaryArtistName).toBe("Radiohead");
  });

  it("retrieves an album using its internal ID", async () => {
    const repository: AlbumRepository = {
      findById: vi.fn().mockResolvedValue(persistedAlbum),
      findByIdWithPrimaryArtist: vi.fn(),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };

    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumById("album-internal-id");

    expect(repository.findById).toHaveBeenCalledWith("album-internal-id");
    expect(result).toEqual(persistedAlbum);
  });

  it("retrieves an album together with its primary artist", async () => {
    const findByIdWithPrimaryArtist = vi
      .fn()
      .mockResolvedValue(persistedAlbumWithArtist);

    const repository: AlbumRepository = {
      findById: vi.fn(),
      findByIdWithPrimaryArtist,
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };

    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumWithPrimaryArtist("album-internal-id");

    expect(findByIdWithPrimaryArtist).toHaveBeenCalledWith("album-internal-id");
    expect(result).toEqual(persistedAlbumWithArtist);
  });
});
