import { describe, expect, it, vi } from "vitest";

import type {
  Album,
  AlbumCatalogData,
  AlbumWithPrimaryArtist,
} from "@/server/domain/album";
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
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog,
    };

    const provider: AlbumCatalogProvider = {
      searchAlbumsByArtist: vi.fn(),
      searchAlbums: vi.fn().mockResolvedValue({
        count: 1,
        offset: 0,
        results: [{ album: catalogAlbum, score: 100 }],
      }),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.searchAlbums("OK Computer");

    expect(provider.searchAlbums).toHaveBeenCalledWith(
      "OK Computer",
      undefined,
    );
    expect(upsertFromCatalog).toHaveBeenCalledWith(catalogAlbum);
    expect(result).toEqual({
      count: 1,
      offset: 0,
      results: [
        { album: persistedAlbum, primaryArtistName: "Radiohead", score: 100 },
      ],
    });
    expect(result.results[0].album.id).toBe("album-internal-id");
    expect(result.results[0].primaryArtistName).toBe("Radiohead");
  });

  it("syncs an artist discography and returns persisted albums", async () => {
    const upsertFromCatalog = vi.fn().mockResolvedValue(persistedAlbum);
    const previouslyPersistedNoise: AlbumWithPrimaryArtist = {
      ...persistedAlbumWithArtist,
      id: "old-live-release-id",
      musicBrainzReleaseGroupId: "c1392450-e666-3926-a536-22c65f834433",
      title: "Old live release",
    };
    const findByPrimaryArtistId = vi
      .fn()
      .mockResolvedValue([persistedAlbumWithArtist, previouslyPersistedNoise]);
    const repository: AlbumRepository = {
      findById: vi.fn(),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId,
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog,
    };
    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn().mockResolvedValue({
        count: 1,
        offset: 0,
        results: [{ album: catalogAlbum, score: 100 }],
      }),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumsByArtist(
      "artist-internal-id",
      catalogAlbum.primaryArtist.musicBrainzId,
    );

    expect(provider.searchAlbumsByArtist).toHaveBeenCalledWith(
      catalogAlbum.primaryArtist.musicBrainzId,
      { limit: 100, offset: 0 },
    );
    expect(upsertFromCatalog).toHaveBeenCalledWith(catalogAlbum);
    expect(findByPrimaryArtistId).toHaveBeenCalledWith("artist-internal-id");
    expect(result).toEqual([persistedAlbumWithArtist]);
  });

  it("rejects an invalid MusicBrainz artist ID", async () => {
    const repository: AlbumRepository = {
      findById: vi.fn(),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };
    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn(),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };
    const service = new AlbumService(repository, provider);

    await expect(
      service.getAlbumsByArtist("artist-internal-id", "invalid-id"),
    ).rejects.toThrow();
    expect(provider.searchAlbumsByArtist).not.toHaveBeenCalled();
  });

  it("loads release editions and the first available tracklist", async () => {
    const release = {
      id: "11111111-1111-4111-8111-111111111111",
      title: "OK Computer",
      date: "1997-06-16",
      country: "GB",
      status: "Official",
      barcode: null,
      packaging: null,
      labels: [],
      media: [],
    };
    const repository: AlbumRepository = {
      findById: vi.fn().mockResolvedValue(persistedAlbum),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };
    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn(),
      getAlbumReleases: vi.fn().mockResolvedValue([release]),
      getReleaseDetails: vi.fn().mockResolvedValue({ ...release, media: [] }),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumReleaseOverview(persistedAlbum.id);

    expect(provider.getAlbumReleases).toHaveBeenCalledWith(
      persistedAlbum.musicBrainzReleaseGroupId,
    );
    expect(provider.getReleaseDetails).toHaveBeenCalledWith(release.id);
    expect(result).toEqual({
      releases: [release],
      selectedRelease: { ...release, media: [] },
    });
  });

  it("does not load a release that does not belong to the album", async () => {
    const repository: AlbumRepository = {
      findById: vi.fn().mockResolvedValue(persistedAlbum),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };
    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn(),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumReleaseDetails(
      persistedAlbum.id,
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toBeNull();
    expect(provider.getReleaseDetails).not.toHaveBeenCalled();
  });

  it("retrieves an album using its internal ID", async () => {
    const repository: AlbumRepository = {
      findById: vi.fn().mockResolvedValue(persistedAlbum),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };

    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn(),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
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
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi.fn().mockResolvedValue([]),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi.fn(),
    };

    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn(),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };

    const service = new AlbumService(repository, provider);
    const result = await service.getAlbumWithPrimaryArtist("album-internal-id");

    expect(findByIdWithPrimaryArtist).toHaveBeenCalledWith("album-internal-id");
    expect(result).toEqual(persistedAlbumWithArtist);
  });
  it("returns a bounded page of the synchronized discography", async () => {
    const albums = Array.from({ length: 25 }, (_, index) => ({
      ...persistedAlbumWithArtist,
      id: `album-${index + 1}`,
      musicBrainzReleaseGroupId: `b1392450-e666-3926-a536-22c65f83${index.toString(16).padStart(4, "0")}`,
      title: `Album ${index + 1}`,
    }));
    const repository: AlbumRepository = {
      findById: vi.fn(),
      findByIdWithPrimaryArtist: vi.fn(),
      findByPrimaryArtistId: vi.fn(),
      findByPrimaryArtistIdPage: vi
        .fn()
        .mockResolvedValue(albums.slice(12, 24)),
      findByMusicBrainzReleaseGroupId: vi.fn(),
      upsertFromCatalog: vi
        .fn()
        .mockImplementation(async (album: AlbumCatalogData) => ({
          ...persistedAlbum,
          musicBrainzReleaseGroupId: album.musicBrainzReleaseGroupId,
        })),
    };
    const provider: AlbumCatalogProvider = {
      searchAlbums: vi.fn(),
      searchAlbumsByArtist: vi.fn().mockResolvedValue({
        count: 25,
        offset: 0,
        results: albums.map((album) => ({
          album: {
            ...catalogAlbum,
            musicBrainzReleaseGroupId: album.musicBrainzReleaseGroupId,
            title: album.title,
          },
          score: 100,
        })),
      }),
      getAlbumReleases: vi.fn().mockResolvedValue([]),
      getReleaseDetails: vi.fn(),
    };
    const service = new AlbumService(repository, provider);

    const result = await service.getAlbumsByArtistPage(
      "artist-internal-id",
      catalogAlbum.primaryArtist.musicBrainzId,
      { page: 2, pageSize: 12 },
    );

    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(12);
    expect(result.albums).toHaveLength(12);
    expect(repository.findByPrimaryArtistIdPage).toHaveBeenCalledWith(
      "artist-internal-id",
      expect.any(Array),
      { skip: 12, take: 12 },
    );
  });
});
